// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IReputationRegistry {
    function giveFeedback(
        uint256 agentId,
        int128 score,
        uint8 feedbackType,
        string calldata tag,
        string calldata metadataURI,
        string calldata evidenceURI,
        string calldata comment,
        bytes32 feedbackHash
    ) external;
}

contract ArcScoreRegistry is Ownable {
    
    struct UserScore {
        uint256 score;
        uint256 maxUnsecuredCredit; // The amount of pure credit limit granted by off-chain AI
        uint256 lastUpdated;
    }

    mapping(address => UserScore) public scores;

    address public constant REPUTATION_REGISTRY = 0x8004B663056A597Dffe9eCcC1965A193B7388713;

    event ScoreUpdated(address indexed user, uint256 score, uint256 maxUnsecuredCredit);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Only the ARC Off-chain Agent / Admin can update scores and unsecured limits.
     * This is the bridge between the AI behavioral analysis and on-chain execution.
     */
    function updateScore(
        address user,
        uint256 _score,
        uint256 _maxUnsecuredCredit,
        uint256 _agentId
    ) external onlyOwner {
        scores[user] = UserScore({
            score: _score,
            maxUnsecuredCredit: _maxUnsecuredCredit,
            lastUpdated: block.timestamp
        });

        // Sync with official Arc Reputation Registry if agent is registered
        if (_agentId != 0) {
            bytes32 feedbackHash = keccak256(abi.encodePacked("yieldra_score_update"));
            
            // Assuming feedbackType 0 is numerical score
            // Safe downcast to int128 for ERC-8004 standard
            int128 erc8004Score = int128(int256(_score));
            
            try IReputationRegistry(REPUTATION_REGISTRY).giveFeedback(
                _agentId,
                erc8004Score,
                0,
                "credit_score_update",
                "",
                "",
                "Automated credit score update by Yieldra Protocol",
                feedbackHash
            ) {} catch {
                // Fail silently if reputation registry fails to prevent breaking the core function
            }
        }

        emit ScoreUpdated(user, _score, _maxUnsecuredCredit);
    }

    function getUnsecuredLimit(address user) external view returns (uint256) {
        return scores[user].maxUnsecuredCredit;
    }

    function getScore(address user) external view returns (uint256) {
        return scores[user].score;
    }
}
