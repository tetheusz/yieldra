// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IArcVault {
    function getDeposit(address user) external view returns (uint256);
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

    // 80% LTV config (8000 / 10000) for standard collateral value
    uint256 public constant MAX_LTV = 8000; 

    mapping(address => uint256) public debts;

    event Borrowed(address indexed user, uint256 amount, bool isUnsecured);
    event Repaid(address indexed user, uint256 amount);

    constructor(address _usdc, address _vault, address _scoreRegistry) {
        usdc = IERC20(_usdc);
        vault = IArcVault(_vault);
        scoreRegistry = IArcScoreRegistry(_scoreRegistry);
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

        emit Repaid(msg.sender, amount);
    }

    function getDebt(address user) external view returns (uint256) {
        return debts[user];
    }
}
