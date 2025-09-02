// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SwarmToken} from "./SwarmToken.sol";

/**
 * @title SwarmPoll
 * @notice Permissioned poll system where each address can participate once per poll.
 *          Users stakes USDC to enter a poll (stake amount affects rewards but NOT vote weight).
 *          Vote weight = 1 per address (one participation per poll).
 *          Baseline SWM minted on participation (proportional to stake).
 *          Bonuhgs SWM minted to winners (proportional to their USDC reward).
 *          Winners receive USDC rewards proportional to their stake among winning-option stakers.
 *          A treasury cut (TREASURY_FEE_BPS) is taken from stakes and accumulated.
 *
 */
contract SwarmPoll is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    ////////////////////////////////////////////////////////////////
    //                    ERRORS                                  //
    ////////////////////////////////////////////////////////////////
    error SwarmPoll__InvalidPollId();
    error SwarmPoll__NotEnoughOptions(uint256);
    error SwarmPoll__PollNotActive();
    error SwarmPoll__PollAlreadyEnded();
    error SwarmPoll__InvalidOption(uint256 optionId);
    error SwarmPoll__NoStakePlaced();
    error SwarmPoll__NoWinnings();
    error SwarmPoll__AlreadyClaimed();
    error SwarmPoll__DurationMustBePositive();
    error SwarmPoll__AlreadyParticipated();
    error SwarmPoll__ZeroAddress();

    ////////////////////////////////////////////////////////////////
    //                    EVENTS                                  //
    ////////////////////////////////////////////////////////////////
    event PollCreated(uint256 indexed pollId, string question, string[] options, uint256 duration);
    event EnteredPoll(
        uint256 indexed pollId, address indexed user, uint256 optionId, uint256 amount, uint256 fee, uint256 swmMinted
    );
    event PollEnded(uint256 indexed pollId, uint256 winningOption);
    event ClaimedReward(uint256 indexed pollId, address indexed user, uint256 amount, uint256 bonusSwm);
    event SwmMinted(uint256 amount, address to);

    ////////////////////////////////////////////////////////////////
    //                    STRUCTS                                 //
    ////////////////////////////////////////////////////////////////
    struct Poll {
        string question;
        string[] options;
        uint256 endTime;
        bool active;
        uint256 totalStaked; // USDC (6 decimals)
        uint256 winningOptionId;
        bool winnerDeclared;
        mapping(uint256 => uint256) optionStakes; // optionId → total USDC staked
        mapping(address => mapping(uint256 => uint256)) userStakes; // user → optionId → stake (USDC)
        mapping(address => bool) claimed; // user → claimed status
        mapping(address => bool) hasEntered; // user → already entered?
    }

    ////////////////////////////////////////////////////////////////
    //                    STATE VARIABLES                         //
    ////////////////////////////////////////////////////////////////
    IERC20 public immutable usdcToken;
    SwarmToken public immutable swarmToken;

    address public immutable treasury;

    uint256 public constant TREASURY_FEE_BPS = 200; // 2%
    uint256 public constant BASELINE_SWM_PER_USDC = 1e17; // 0.1 SWM per USDC
    uint256 public constant BONUS_SWM_PER_USDC = 1e18; // 1 SWM per USDC reward

    uint256 public totalFeesCollected;
    uint256 public lastMintTimestamp;

    uint256 public pollCount;
    mapping(uint256 => Poll) private polls;

    ////////////////////////////////////////////////////////////////
    //                    CONSTRUCTOR                             //
    ////////////////////////////////////////////////////////////////
    constructor(address _usdcToken, address _swarmToken) Ownable(msg.sender) {
        if (_usdcToken == address(0) || _swarmToken == address(0)) {
            revert SwarmPoll__ZeroAddress();
        }

        usdcToken = IERC20(_usdcToken);
        swarmToken = SwarmToken(_swarmToken);
        treasury = address(this);
    }

    ////////////////////////////////////////////////////////////////
    //                    POLL MANAGEMENT                         //
    ////////////////////////////////////////////////////////////////
    function createPoll(string memory _question, string[] memory _options, uint256 _duration) external onlyOwner {
        if (_duration == 0) revert SwarmPoll__DurationMustBePositive();
        if (_options.length < 2) revert SwarmPoll__NotEnoughOptions(_options.length);

        uint256 pollId = pollCount++;
        Poll storage newPoll = polls[pollId];
        newPoll.question = _question;
        newPoll.options = _options;
        newPoll.endTime = block.timestamp + _duration;
        newPoll.active = true;

        emit PollCreated(pollId, _question, _options, _duration);
    }

    ////////////////////////////////////////////////////////////////
    //                    STAKING                                  //
    ////////////////////////////////////////////////////////////////
    function stake(uint256 _pollId, uint256 _optionId, uint256 _amount) external nonReentrant {
        _stake(_pollId, _optionId, _amount);
    }

    function _stake(uint256 _pollId, uint256 _optionId, uint256 _amount) internal {
        if (_pollId >= pollCount) revert SwarmPoll__InvalidPollId();
        if (_amount == 0) revert SwarmPoll__NoStakePlaced();

        Poll storage poll = polls[_pollId];
        if (!poll.active || block.timestamp >= poll.endTime) revert SwarmPoll__PollNotActive();
        if (_optionId >= poll.options.length) revert SwarmPoll__InvalidOption(_optionId);
        if (poll.hasEntered[msg.sender]) revert SwarmPoll__AlreadyParticipated();

        poll.hasEntered[msg.sender] = true;

        uint256 fee = (_amount * TREASURY_FEE_BPS) / 10000;
        uint256 netAmount = _amount - fee;

        totalFeesCollected += fee;
        poll.totalStaked += netAmount;
        poll.optionStakes[_optionId] += netAmount;
        poll.userStakes[msg.sender][_optionId] = netAmount;

        usdcToken.safeTransferFrom(msg.sender, treasury, fee);
        usdcToken.safeTransferFrom(msg.sender, address(this), netAmount);

        uint256 swmToMint = (netAmount * BASELINE_SWM_PER_USDC) / 1e6;
        if (swmToMint > 0) {
            bool ok = swarmToken.mint(msg.sender, swmToMint);
            require(ok, "SWM mint failed");
            emit SwmMinted(swmToMint, msg.sender);
        }

        emit EnteredPoll(_pollId, msg.sender, _optionId, netAmount, fee, swmToMint);
    }

    ////////////////////////////////////////////////////////////////
    //                  DECLARE WINNER                            //
    ////////////////////////////////////////////////////////////////
    function declareWinner(uint256 _pollId, uint256 _winningOptionId) external onlyOwner {
        if (_pollId >= pollCount) revert SwarmPoll__InvalidPollId();

        Poll storage poll = polls[_pollId];
        if (block.timestamp < poll.endTime) revert SwarmPoll__PollNotActive();
        if (!poll.active) revert SwarmPoll__PollAlreadyEnded();
        if (_winningOptionId >= poll.options.length) revert SwarmPoll__InvalidOption(_winningOptionId);

        poll.winnerDeclared = true;
        poll.winningOptionId = _winningOptionId;
        poll.active = false;

        emit PollEnded(_pollId, _winningOptionId);
    }

    ////////////////////////////////////////////////////////////////
    //                   CLAIMING REWARDS                         //
    ////////////////////////////////////////////////////////////////
    function claimReward(uint256 _pollId) external nonReentrant {
        if (_pollId >= pollCount) revert SwarmPoll__InvalidPollId();

        Poll storage poll = polls[_pollId];
        if (!poll.winnerDeclared) revert SwarmPoll__PollNotActive();
        if (poll.claimed[msg.sender]) revert SwarmPoll__AlreadyClaimed();

        uint256 stakeAmount = poll.userStakes[msg.sender][poll.winningOptionId];
        if (stakeAmount == 0) revert SwarmPoll__NoStakePlaced();

        uint256 winnerTotal = poll.optionStakes[poll.winningOptionId];
        uint256 reward = (stakeAmount * poll.totalStaked) / winnerTotal;
        if (reward == 0) revert SwarmPoll__NoWinnings();

        poll.claimed[msg.sender] = true;

        usdcToken.safeTransfer(msg.sender, reward);

        uint256 bonusSwm = (reward * BONUS_SWM_PER_USDC) / 1e6;
        if (bonusSwm > 0) {
            bool ok = swarmToken.mint(msg.sender, bonusSwm);
            require(ok, "SWM mint failed");
            emit SwmMinted(bonusSwm, msg.sender);
        }

        emit ClaimedReward(_pollId, msg.sender, reward, bonusSwm);
    }

    ////////////////////////////////////////////////////////////////
    //                    SWM MINTING FROM FEES                   //
    ////////////////////////////////////////////////////////////////
    function mintSwmFromFees(address to) external onlyOwner {
        require(block.timestamp >= lastMintTimestamp + 30 days, "Too early");
        uint256 amountUsdc = totalFeesCollected;
        require(amountUsdc > 0, "No fees");

        uint256 swmAmount = amountUsdc * 1e12;
        address recipient = to == address(0) ? treasury : to;

        totalFeesCollected = 0;
        lastMintTimestamp = block.timestamp;

        bool success = swarmToken.mint(recipient, swmAmount);
        require(success, "SWM mint failed");

        emit SwmMinted(swmAmount, recipient);
    }

    ////////////////////////////////////////////////////////////////
    //                    VIEW FUNCTIONS                          //
    ////////////////////////////////////////////////////////////////
    function getPoll(uint256 _pollId)
        external
        view
        returns (
            string memory question,
            string[] memory options,
            uint256 endTime,
            bool active,
            uint256 totalStaked,
            bool winnerDeclared,
            uint256 winningOptionId
        )
    {
        if (_pollId >= pollCount) revert SwarmPoll__InvalidPollId();
        Poll storage poll = polls[_pollId];
        return (
            poll.question,
            poll.options,
            poll.endTime,
            poll.active,
            poll.totalStaked,
            poll.winnerDeclared,
            poll.winningOptionId
        );
    }

    function getOptionStake(uint256 _pollId, uint256 _optionId) external view returns (uint256) {
        if (_pollId >= pollCount) revert SwarmPoll__InvalidPollId();
        Poll storage poll = polls[_pollId];
        if (_optionId >= poll.options.length) revert SwarmPoll__InvalidOption(_optionId);
        return poll.optionStakes[_optionId];
    }

    function getUserStake(uint256 _pollId, address _user, uint256 _optionId) external view returns (uint256) {
        if (_pollId >= pollCount) revert SwarmPoll__InvalidPollId();
        Poll storage poll = polls[_pollId];
        if (_optionId >= poll.options.length) revert SwarmPoll__InvalidOption(_optionId);
        return poll.userStakes[_user][_optionId];
    }

    function hasUserEntered(uint256 _pollId, address _user) external view returns (bool) {
        if (_pollId >= pollCount) revert SwarmPoll__InvalidPollId();
        return polls[_pollId].hasEntered[_user];
    }

    function hasUserClaimed(uint256 _pollId, address _user) external view returns (bool) {
        if (_pollId >= pollCount) revert SwarmPoll__InvalidPollId();
        return polls[_pollId].claimed[_user];
    }

    function getOptionCount(uint256 _pollId) external view returns (uint256) {
        if (_pollId >= pollCount) revert SwarmPoll__InvalidPollId();
        return polls[_pollId].options.length;
    }

    function getPollCount() external view returns (uint256) {
        return pollCount;
    }
}
