// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ArcVault is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public usdc;

    struct Position {
        uint256 principal;
        uint256 lastUpdated;
    }
    
    mapping(address => Position) public positions;
    uint256 public totalPrincipal;

    // Dynamic APY state
    uint256 public currentApyBps = 500; // Starts at 5% base
    uint256 public lastApyUpdate;
    uint256 public constant DECAY_PERIOD = 12 hours; // APY bonus decays over 12 hours
    uint256 public constant MAX_APY_BPS = 2500; // Hard cap at 25% APY
    uint256 public constant SECONDS_PER_YEAR = 31536000;
    address public owner;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
        owner = msg.sender;
    }

    /**
     * @dev Calculates the decayed APY level based on time since last agent revenue injection.
     */
    function getCurrentApy() public view returns (uint256) {
        if (block.timestamp >= lastApyUpdate + DECAY_PERIOD) return 500; // Return to base 5%
        
        uint256 elapsed = block.timestamp - lastApyUpdate;
        uint256 decayAmount = (currentApyBps - 500) * elapsed / DECAY_PERIOD;
        
        if (currentApyBps <= 500 + decayAmount) return 500;
        return currentApyBps - decayAmount;
    }

    /**
     * @dev Algorithmic yield calculation based on time passed and dynamic rate.
     */
    function _calculateYield(address user) internal view returns (uint256) {
        Position memory pos = positions[user];
        if (pos.principal == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - pos.lastUpdated;
        uint256 avgApy = getCurrentApy(); // Uses the current decayed rate for simple demo math
        
        uint256 earned = (pos.principal * avgApy * timeElapsed) / (10000 * SECONDS_PER_YEAR);
        return earned;
    }

    function deposit(uint256 amount) external nonReentrant {
        _deposit(msg.sender, amount);
    }

    /**
     * @dev Allows authorized contracts (e.g. CreditManager) to deposit for a user.
     */
    function depositFor(address user, uint256 amount) external nonReentrant {
        // In a production environment, we would restrict this to authorized callers
        _deposit(user, amount);
    }

    function _deposit(address user, uint256 amount) internal {
        require(amount > 0, "Amount must be > 0");
        
        // If it's a direct deposit, transer from user. 
        // If it's depositFor, we assume the caller (CreditManager) already holds the funds.
        if (msg.sender == user) {
            usdc.safeTransferFrom(msg.sender, address(this), amount);
        } else {
             usdc.safeTransferFrom(msg.sender, address(this), amount);
        }
        
        uint256 pendingYield = _calculateYield(user);
        
        positions[user].principal += (amount + pendingYield);
        positions[user].lastUpdated = block.timestamp;
        totalPrincipal += amount;
        
        emit Deposited(user, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        uint256 pendingYield = _calculateYield(msg.sender);
        uint256 totalBalance = positions[msg.sender].principal + pendingYield;
        
        require(totalBalance >= amount, "Insufficient balance");
        
        positions[msg.sender].principal = totalBalance - amount;
        positions[msg.sender].lastUpdated = block.timestamp;
        
        if (totalPrincipal >= amount) {
            totalPrincipal -= amount;
        } else {
            totalPrincipal = 0;
        }
        
        usdc.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @dev Live balance reading. Returns principal + mathematically accrued interest.
     */
    function getDeposit(address user) external view returns (uint256) {
        return positions[user].principal + _calculateYield(user);
    }

    /**
     * @dev APY STIMULATOR: Increases APY based on revenue inflow.
     * Only authorized (CreditManager) in prod.
     */
    function boostApy(uint256 amount) external {
        if (totalPrincipal == 0) return;
        
        uint256 boost = (amount * 10000) / totalPrincipal; 
        
        uint256 targetApy = getCurrentApy() + boost;
        if (targetApy > MAX_APY_BPS) targetApy = MAX_APY_BPS;
        
        currentApyBps = targetApy;
        lastApyUpdate = block.timestamp;
    }

    /**
     * @dev ADMIN: Emergency rescue for treasury management or migration.
     */
    function rescueTokens(address token, uint256 amount) external {
        require(msg.sender == owner, "Only owner");
        IERC20(token).safeTransfer(msg.sender, amount);
    }

    /**
     * @dev ARC NATIVE USDC: Allows the contract to receive native USDC.
     */
    receive() external payable {}
}
