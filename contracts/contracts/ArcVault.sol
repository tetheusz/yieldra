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

    // We set a more realistic APY for testnet sustainability 
    uint256 public constant APY_BPS = 500; // 500 -> 5%
    uint256 public constant SECONDS_PER_YEAR = 31536000;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
    }

    /**
     * @dev Algorithmic yield calculation based on time passed.
     */
    function _calculateYield(address user) internal view returns (uint256) {
        Position memory pos = positions[user];
        if (pos.principal == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - pos.lastUpdated;
        
        // Simple interest math: (Principal * Rate * Time)
        uint256 earned = (pos.principal * APY_BPS * timeElapsed) / (10000 * SECONDS_PER_YEAR);
        return earned;
    }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        
        uint256 pendingYield = _calculateYield(msg.sender);
        
        positions[msg.sender].principal += (amount + pendingYield);
        positions[msg.sender].lastUpdated = block.timestamp;
        totalPrincipal += amount;
        
        emit Deposited(msg.sender, amount);
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
     * @dev Exposed purely for UI metric calculations if needed.
     */
    function getPrincipal(address user) external view returns (uint256) {
        return positions[user].principal;
    }
}
