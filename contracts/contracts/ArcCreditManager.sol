// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IArcVault {
    function getDeposit(address user) external view returns (uint256);
    function depositFor(address user, uint256 amount) external;
    function boostApy(uint256 amount) external;
}

interface IArcScoreRegistry {
    function getUnsecuredLimit(address user) external view returns (uint256);
    function getScore(address user) external view returns (uint256);
}

contract ArcCreditManager is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public usdc;
    IArcVault public vault;
    IArcScoreRegistry public scoreRegistry;
    address public owner;

    // 80% LTV config (8000 / 10000) for standard collateral value
    uint256 public constant MAX_LTV = 8000; 

    // Agent Credit Config
    mapping(address => uint256) public agentReputation; // 0-1000
    mapping(address => uint256) public agentPenaltyMultiplier; // BPS
    mapping(address => bool) public isBlacklisted;
    
    // Revenue tracking
    uint256 public totalProtocolRevenue;
    uint256 public totalBorrowed;
    mapping(address => uint256) public debts;
    
    // 8% APR for standard agents, but can increase with penalty
    uint256 public constant BASE_AGENT_INTEREST = 800; 
    uint256 public constant NANOPAYMENT_FEE = 1000; // $0.001 USDC

    event Borrowed(address indexed user, uint256 amount, bool isUnsecured);
    event AgentBorrowed(address indexed agent, uint256 amount, uint256 reputation);
    event Repaid(address indexed user, uint256 amount);
    event AgentRepaid(address indexed agent, uint256 amount, uint256 feePaid);
    event AgentSlashed(address indexed agent, uint256 formerReputation);
    event LeverageBoosted(address indexed user, uint256 amount);
    event RevenueInjected(address indexed agent, uint256 amount);

    constructor(address _usdc, address _vault, address _scoreRegistry) {
        usdc = IERC20(_usdc);
        vault = IArcVault(_vault);
        scoreRegistry = IArcScoreRegistry(_scoreRegistry);
        owner = msg.sender;
    }

    /**
     * @dev Calculates the maximum total credit a user holds based on two pillars:
     * 1) Collateral limit (80% of deposited holding)
     * 2) Unsecured limit (pure trust from high off-chain score)
     */
    function getAvailableCreditLimit(address user) public view returns (uint256) {
        uint256 vaultBalance = vault.getDeposit(user);
        uint256 collateralCredit = (vaultBalance * MAX_LTV) / 10000;
        
        uint256 unsecuredCredit = scoreRegistry.getUnsecuredLimit(user);
        
        return collateralCredit + unsecuredCredit;
    }

    /**
     * @dev User borrows money using exactly the hybrid rules.
     */
    function borrow(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");

        uint256 maxLimit = getAvailableCreditLimit(msg.sender);
        uint256 currentDebt = debts[msg.sender];
        
        require(currentDebt + amount <= maxLimit, "Exceeds dynamic credit limit");

        debts[msg.sender] += amount;
        totalBorrowed += amount;
        
        // Emulate sending USDC to the borrower (In production, the protocol yields liquidity)
        // Here we require the CreditManager itself is funded with USDC to hand out.
        usdc.safeTransfer(msg.sender, amount);
        
        // Log event determining if this was an unsecured slice.
        // If current debt + new amount exceeds collateral allowed, it's partially or fully unsecured
        uint256 collateralLimit = (vault.getDeposit(msg.sender) * MAX_LTV) / 10000;
        bool usesUnsecured = (debts[msg.sender] > collateralLimit);

        emit Borrowed(msg.sender, amount, usesUnsecured);
    }

    function repay(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(debts[msg.sender] >= amount, "Amount exceeds current debt");

        usdc.safeTransferFrom(msg.sender, address(this), amount);
        debts[msg.sender] -= amount;

        if (totalBorrowed >= amount) {
            totalBorrowed -= amount;
        } else {
            totalBorrowed = 0;
        }

        emit Repaid(msg.sender, amount);
    }

    /**
     * @dev AGENT CREDIT ORACLE
     * Allows verified agents to borrow USDC without collateral based on reputation.
     */
    function agentBorrow(uint256 amount) external nonReentrant {
        require(!isBlacklisted[msg.sender], "Agent is blacklisted");
        require(amount > 0, "Amount must be > 0");
        
        uint256 reputation = agentReputation[msg.sender];
        require(reputation >= 500, "Insufficient reputation for unsecured credit");

        // Limit is Reputation * 10 USDC (Demo scaling)
        uint256 maxLimit = reputation * 10 * 10**6; 
        require(debts[msg.sender] + amount <= maxLimit, "Exceeds agent credit limit");

        debts[msg.sender] += amount;
        totalBorrowed += amount;

        usdc.safeTransfer(msg.sender, amount);
        emit AgentBorrowed(msg.sender, amount, reputation);
    }

    /**
     * @dev Agent repays and BUILDS reputation.
     */
    function agentRepay(uint256 amount) external nonReentrant {
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        
        // Fee collection (simulated spread)
        uint256 fee = (amount * 10) / 10000; // 0.1% simple fee
        
        debts[msg.sender] = (debts[msg.sender] > amount) ? debts[msg.sender] - amount : 0;
        
        // Increase reputation score (max 1000)
        if (agentReputation[msg.sender] < 1000) {
            agentReputation[msg.sender] += 10;
        }

        emit AgentRepaid(msg.sender, amount, fee);
    }

    /**
     * @dev SLASHING: Zero out reputation and increase interest multiplier
     */
    function slashAgent(address agent) external {
        // Only owner or authorized risk engine in prod
        require(agentReputation[agent] > 0, "Agent already has no reputation");
        
        emit AgentSlashed(agent, agentReputation[agent]);
        
        agentReputation[agent] = 0;
        isBlacklisted[agent] = true;
        agentPenaltyMultiplier[agent] = 5000; // 50% penalty rate
    }

    function getDebt(address user) external view returns (uint256) {
        return debts[user];
    }

    /**
     * @dev ATOMIC LEVERAGE: Borrows USDC and immediately deposits it 
     * back into the vault for the user in a single transaction.
     */
    function leverageBoost(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");

        uint256 maxLimit = getAvailableCreditLimit(msg.sender);
        uint256 currentDebt = debts[msg.sender];
        
        require(currentDebt + amount <= maxLimit, "Exceeds dynamic credit limit");

        debts[msg.sender] += amount;
        totalBorrowed += amount;

        // Atomic flow: We don't send USDC to user, we send it to Vault for them
        usdc.approve(address(vault), amount);
        vault.depositFor(msg.sender, amount);

        emit LeverageBoosted(msg.sender, amount);
    }

    /**
     * @dev YIELD ACCELERATOR: Allows manual injection of USDC to simulate agent revenue.
     * This now sends funds directly to the Vault and boosts the dynamic APY.
     */
    function injectProtocolRevenue(uint256 amount) external nonReentrant {
        usdc.safeTransferFrom(msg.sender, address(vault), amount);
        totalProtocolRevenue += amount;
        vault.boostApy(amount);
        emit RevenueInjected(msg.sender, amount);
    }

    /**
     * @dev ADMIN: Emergency rescue for treasury management or migration.
     */
    function rescueTokens(address token, uint256 amount) external {
        require(msg.sender == owner, "Only owner");
        IERC20(token).safeTransfer(msg.sender, amount);
    }

    /**
     * @dev ARC NATIVE USDC: Allows the contract to receive native USDC for liquidity.
     */
    receive() external payable {}
}
