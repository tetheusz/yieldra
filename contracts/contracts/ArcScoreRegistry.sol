// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ArcScoreRegistry is Ownable {
    
    struct UserScore {
        uint256 score;
        uint256 maxUnsecuredCredit; // The amount of pure credit limit granted by off-chain AI
        uint256 lastUpdated;
    }

    mapping(address => UserScore) public scores;

    event ScoreUpdated(address indexed user, uint256 score, uint256 maxUnsecuredCredit);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Only the ARC Off-chain Agent / Admin can update scores and unsecured limits.
     * This is the bridge between the AI behavioral analysis and on-chain execution.
     */
    function updateScore(address user, uint256 _score, uint256 _maxUnsecuredCredit) external onlyOwner {
        scores[user] = UserScore({
            score: _score,
            maxUnsecuredCredit: _maxUnsecuredCredit,
            lastUpdated: block.timestamp
        });

        emit ScoreUpdated(user, _score, _maxUnsecuredCredit);
    }

    function getUnsecuredLimit(address user) external view returns (uint256) {
        return scores[user].maxUnsecuredCredit;
    }

    function getScore(address user) external view returns (uint256) {
        return scores[user].score;
    }
}
