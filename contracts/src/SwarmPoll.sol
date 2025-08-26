// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title SwarmPoll
 * @dev A social prediction game where players bet on what they think the crowd will choose
 */
contract SwarmPoll is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdcToken;
    
    struct Poll {
        string question;
        string[] options;
        uint256 endTime;
        uint256 totalStaked;
        bool ended;
        uint256 winningOption;
        mapping(uint256 => uint256) optionStakes; // optionId => total staked
        mapping(address => mapping(uint256 => uint256)) userStakes; // user => optionId => amount
        mapping(address => bool) hasClaimed;
    }
    
    Poll[] public polls;
    
    event PollCreated(uint256 indexed pollId, string question, string[] options, uint256 endTime);
    event Staked(uint256 indexed pollId, address indexed user, uint256 optionId, uint256 amount);
    event WinnerDeclared(uint256 indexed pollId, uint256 winningOption);
    event RewardClaimed(uint256 indexed pollId, address indexed user, uint256 amount);
    
    constructor(address _usdcToken) {
        usdcToken = IERC20(_usdcToken);
    }
    
    /**
     * @dev Create a new poll
     * @param _question The poll question
     * @param _options Array of possible answers
     * @param _duration Duration in seconds from now
     */
    function createPoll(
        string memory _question,
        string[] memory _options,
        uint256 _duration
    ) external onlyOwner {
        require(_options.length >= 2, "Must have at least 2 options");
        require(_duration > 0, "Duration must be positive");
        
        Poll storage newPoll = polls.push();
        newPoll.question = _question;
        newPoll.options = _options;
        newPoll.endTime = block.timestamp + _duration;
        newPoll.ended = false;
        
        emit PollCreated(polls.length - 1, _question, _options, newPoll.endTime);
    }
    
    /**
     * @dev Stake USDC on an option
     * @param _pollId The poll ID
     * @param _optionId The option to stake on (0-indexed)
     * @param _amount Amount of USDC to stake
     */
    function stake(uint256 _pollId, uint256 _optionId, uint256 _amount) external nonReentrant {
        require(_pollId < polls.length, "Invalid poll ID");
        Poll storage poll = polls[_pollId];
        require(!poll.ended, "Poll has ended");
        require(block.timestamp < poll.endTime, "Poll has expired");
        require(_optionId < poll.options.length, "Invalid option");
        require(_amount > 0, "Amount must be positive");
        
        // Transfer USDC from user to contract
        usdcToken.safeTransferFrom(msg.sender, address(this), _amount);
        
        // Update stakes
        poll.totalStaked += _amount;
        poll.optionStakes[_optionId] += _amount;
        poll.userStakes[msg.sender][_optionId] += _amount;
        
        emit Staked(_pollId, msg.sender, _optionId, _amount);
    }
    
    /**
     * @dev Declare the winner of a poll (admin only)
     * @param _pollId The poll ID
     * @param _winningOptionId The winning option ID
     */
    function declareWinner(uint256 _pollId, uint256 _winningOptionId) external onlyOwner {
        require(_pollId < polls.length, "Invalid poll ID");
        Poll storage poll = polls[_pollId];
        require(!poll.ended, "Poll already ended");
        require(block.timestamp >= poll.endTime, "Poll not yet expired");
        require(_winningOptionId < poll.options.length, "Invalid option");
        
        poll.ended = true;
        poll.winningOption = _winningOptionId;
        
        emit WinnerDeclared(_pollId, _winningOptionId);
    }
    
    /**
     * @dev Claim rewards for winning stakes
     * @param _pollId The poll ID
     */
    function claimReward(uint256 _pollId) external nonReentrant {
        require(_pollId < polls.length, "Invalid poll ID");
        Poll storage poll = polls[_pollId];
        require(poll.ended, "Poll not ended");
        require(!poll.hasClaimed[msg.sender], "Already claimed");
        
        uint256 userStake = poll.userStakes[msg.sender][poll.winningOption];
        require(userStake > 0, "No winning stake");
        
        // Calculate reward
        uint256 totalWinningStakes = poll.optionStakes[poll.winningOption];
        uint256 totalLosingStakes = poll.totalStaked - totalWinningStakes;
        uint256 reward = (userStake * totalLosingStakes) / totalWinningStakes + userStake;
        
        poll.hasClaimed[msg.sender] = true;
        
        // Transfer reward
        usdcToken.safeTransfer(msg.sender, reward);
        
        emit RewardClaimed(_pollId, msg.sender, reward);
    }
    
    /**
     * @dev Get poll details
     * @param _pollId The poll ID
     */
    function getPoll(uint256 _pollId) external view returns (
        string memory question,
        string[] memory options,
        uint256 endTime,
        uint256 totalStaked,
        bool ended,
        uint256 winningOption
    ) {
        require(_pollId < polls.length, "Invalid poll ID");
        Poll storage poll = polls[_pollId];
        return (
            poll.question,
            poll.options,
            poll.endTime,
            poll.totalStaked,
            poll.ended,
            poll.winningOption
        );
    }
    
    /**
     * @dev Get option stakes for a poll
     * @param _pollId The poll ID
     * @param _optionId The option ID
     */
    function getOptionStakes(uint256 _pollId, uint256 _optionId) external view returns (uint256) {
        require(_pollId < polls.length, "Invalid poll ID");
        Poll storage poll = polls[_pollId];
        require(_optionId < poll.options.length, "Invalid option");
        return poll.optionStakes[_optionId];
    }
    
    /**
     * @dev Get user stakes for a specific option
     * @param _pollId The poll ID
     * @param _user The user address
     * @param _optionId The option ID
     */
    function getUserStakes(uint256 _pollId, address _user, uint256 _optionId) external view returns (uint256) {
        require(_pollId < polls.length, "Invalid poll ID");
        Poll storage poll = polls[_pollId];
        require(_optionId < poll.options.length, "Invalid option");
        return poll.userStakes[_user][_optionId];
    }
    
    /**
     * @dev Check if user has claimed rewards for a poll
     * @param _pollId The poll ID
     * @param _user The user address
     */
    function hasClaimed(uint256 _pollId, address _user) external view returns (bool) {
        require(_pollId < polls.length, "Invalid poll ID");
        Poll storage poll = polls[_pollId];
        return poll.hasClaimed[_user];
    }
    
    /**
     * @dev Get total number of polls
     */
    function getPollCount() external view returns (uint256) {
        return polls.length;
    }
    
    /**
     * @dev Calculate potential reward for a user's stake
     * @param _pollId The poll ID
     * @param _user The user address
     */
    function calculateReward(uint256 _pollId, address _user) external view returns (uint256) {
        require(_pollId < polls.length, "Invalid poll ID");
        Poll storage poll = polls[_pollId];
        require(poll.ended, "Poll not ended");
        
        uint256 userStake = poll.userStakes[_user][poll.winningOption];
        if (userStake == 0) return 0;
        
        uint256 totalWinningStakes = poll.optionStakes[poll.winningOption];
        uint256 totalLosingStakes = poll.totalStaked - totalWinningStakes;
        return (userStake * totalLosingStakes) / totalWinningStakes + userStake;
    }
}

