// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/SwarmPoll.sol";
import "../src/MockUSDC.sol";

contract SwarmPollTest is Test {
    SwarmPoll public swarmPoll;
    MockUSDC public mockUSDC;
    
    address public owner = address(1);
    address public user1 = address(2);
    address public user2 = address(3);
    address public user3 = address(4);
    
    function setUp() public {
        vm.startPrank(owner);
        
        // Deploy contracts
        mockUSDC = new MockUSDC();
        swarmPoll = new SwarmPoll(address(mockUSDC));
        
        vm.stopPrank();
        
        // Give users some USDC
        mockUSDC.mint(user1, 1000 * 10**6);
        mockUSDC.mint(user2, 1000 * 10**6);
        mockUSDC.mint(user3, 1000 * 10**6);
    }
    
    function testCreatePoll() public {
        vm.startPrank(owner);
        
        string memory question = "Which AI will be more influential?";
        string[] memory options = new string[](2);
        options[0] = "GPT-5";
        options[1] = "Gemini 2";
        uint256 duration = 3600; // 1 hour
        
        swarmPoll.createPoll(question, options, duration);
        
        // Verify poll was created
        (string memory storedQuestion, string[] memory storedOptions, uint256 endTime, uint256 totalStaked, bool ended, uint256 winningOption) = swarmPoll.getPoll(0);
        
        assertEq(storedQuestion, question);
        assertEq(storedOptions[0], "GPT-5");
        assertEq(storedOptions[1], "Gemini 2");
        assertEq(endTime, block.timestamp + duration);
        assertEq(totalStaked, 0);
        assertEq(ended, false);
        
        vm.stopPrank();
    }
    
    function testStake() public {
        // Create a poll first
        vm.startPrank(owner);
        string memory question = "Which AI will be more influential?";
        string[] memory options = new string[](2);
        options[0] = "GPT-5";
        options[1] = "Gemini 2";
        swarmPoll.createPoll(question, options, 3600);
        vm.stopPrank();
        
        // User stakes on option 0
        vm.startPrank(user1);
        uint256 stakeAmount = 100 * 10**6; // 100 USDC
        
        mockUSDC.appve(address(swarmPoll), stakeAmount);
        swarmPoll.stake(0, 0, stakeAmount);
        
        // Verify stake
        uint256 userStake = swarmPoll.getUserStakes(0, user1, 0);
        assertEq(userStake, stakeAmount);
        
        uint256 optionStake = swarmPoll.getOptionStakes(0, 0);
        assertEq(optionStake, stakeAmount);
        
        vm.stopPrank();
    }
    
    function testDeclareWinner() public {
        // Create and stake on a poll
        vm.startPrank(owner);
        string memory question = "Which AI will be more influential?";
        string[] memory options = new string[](2);
        options[0] = "GPT-5";
        options[1] = "Gemini 2";
        swarmPoll.createPoll(question, options, 3600);
        vm.stopPrank();
        
        // Users stake
        vm.startPrank(user1);
        mockUSDC.appve(address(swarmPoll), 100 * 10**6);
        swarmPoll.stake(0, 0, 100 * 10**6);
        vm.stopPrank();
        
        vm.startPrank(user2);
        mockUSDC.appve(address(swarmPoll), 50 * 10**6);
        swarmPoll.stake(0, 1, 50 * 10**6);
        vm.stopPrank();
        
        // Fast forward time
        vm.warp(block.timestamp + 3601);
        
        // Declare winner
        vm.startPrank(owner);
        swarmPoll.declareWinner(0, 0);
        
        // Verify poll ended
        (,,,, bool ended, uint256 winningOption) = swarmPoll.getPoll(0);
        assertEq(ended, true);
        assertEq(winningOption, 0);
        
        vm.stopPrank();
    }
    
    function testClaimReward() public {
        // Create poll and stake
        vm.startPrank(owner);
        string memory question = "Which AI will be more influential?";
        string[] memory options = new string[](2);
        options[0] = "GPT-5";
        options[1] = "Gemini 2";
        swarmPoll.createPoll(question, options, 3600);
        vm.stopPrank();
        
        // User1 stakes on winning option
        vm.startPrank(user1);
        mockUSDC.appve(address(swarmPoll), 100 * 10**6);
        swarmPoll.stake(0, 0, 100 * 10**6);
        vm.stopPrank();
        
        // User2 stakes on losing option
        vm.startPrank(user2);
        mockUSDC.appve(address(swarmPoll), 50 * 10**6);
        swarmPoll.stake(0, 1, 50 * 10**6);
        vm.stopPrank();
        
        // Fast forward and declare winner
        vm.warp(block.timestamp + 3601);
        vm.startPrank(owner);
        swarmPoll.declareWinner(0, 0);
        vm.stopPrank();
        
        // User1 claims reward
        vm.startPrank(user1);
        uint256 balanceBefore = mockUSDC.balanceOf(user1);
        swarmPoll.claimReward(0);
        uint256 balanceAfter = mockUSDC.balanceOf(user1);
        
        // Should receive original stake + portion of losing stakes
        assertGt(balanceAfter, balanceBefore);
        
        vm.stopPrank();
    }
    
    function testFailStakeOnEndedPoll() public {
        // Create and end a poll
        vm.startPrank(owner);
        string memory question = "Which AI will be more influential?";
        string[] memory options = new string[](2);
        options[0] = "GPT-5";
        options[1] = "Gemini 2";
        swarmPoll.createPoll(question, options, 3600);
        
        vm.warp(block.timestamp + 3601);
        swarmPoll.declareWinner(0, 0);
        vm.stopPrank();
        
        // Try to stake on ended poll
        vm.startPrank(user1);
        mockUSDC.appve(address(swarmPoll), 100 * 10**6);
        vm.expectRevert();
        swarmPoll.stake(0, 0, 100 * 10**6);
        vm.stopPrank();
    }
    
    function testFailStakeOnExpiredPoll() public {
        // Create a poll
        vm.startPrank(owner);
        string memory question = "Which AI will be more influential?";
        string[] memory options = new string[](2);
        options[0] = "GPT-5";
        options[1] = "Gemini 2";
        swarmPoll.createPoll(question, options, 3600);
        vm.stopPrank();
        
        // Fast forward past end time
        vm.warp(block.timestamp + 3601);
        
        // Try to stake on expired poll
        vm.startPrank(user1);
        mockUSDC.appve(address(swarmPoll), 100 * 10**6);
        vm.expectRevert();
        swarmPoll.stake(0, 0, 100 * 10**6);
        vm.stopPrank();
    }
    
    function testFailNonOwnerCreatePoll() public {
        vm.startPrank(user1);
        
        string memory question = "Which AI will be more influential?";
        string[] memory options = new string[](2);
        options[0] = "GPT-5";
        options[1] = "Gemini 2";
        
        vm.expectRevert();
        swarmPoll.createPoll(question, options, 3600);
        
        vm.stopPrank();
    }
    
    function testFailNonOwnerDeclareWinner() public {
        // Create a poll
        vm.startPrank(owner);
        string memory question = "Which AI will be more influential?";
        string[] memory options = new string[](2);
        options[0] = "GPT-5";
        options[1] = "Gemini 2";
        swarmPoll.createPoll(question, options, 3600);
        vm.stopPrank();
        
        // Fast forward time
        vm.warp(block.timestamp + 3601);
        
        // Non-owner tries to declare winner
        vm.startPrank(user1);
        vm.expectRevert();
        swarmPoll.declareWinner(0, 0);
        vm.stopPrank();
    }
    
    function testCalculateReward() public {
        // Create poll and stake
        vm.startPrank(owner);
        string memory question = "Which AI will be more influential?";
        string[] memory options = new string[](2);
        options[0] = "GPT-5";
        options[1] = "Gemini 2";
        swarmPoll.createPoll(question, options, 3600);
        vm.stopPrank();
        
        // User1 stakes 100 USDC on winning option
        vm.startPrank(user1);
        mockUSDC.appve(address(swarmPoll), 100 * 10**6);
        swarmPoll.stake(0, 0, 100 * 10**6);
        vm.stopPrank();
        
        // User2 stakes 50 USDC on losing option
        vm.startPrank(user2);
        mockUSDC.appve(address(swarmPoll), 50 * 10**6);
        swarmPoll.stake(0, 1, 50 * 10**6);
        vm.stopPrank();
        
        // Fast forward and declare winner
        vm.warp(block.timestamp + 3601);
        vm.startPrank(owner);
        swarmPoll.declareWinner(0, 0);
        vm.stopPrank();
        
        // Calculate reward for user1
        uint256 reward = swarmPoll.calculateReward(0, user1);
        assertGt(reward, 100 * 10**6); // Should be more than original stake
        
        // Calculate reward for user2 (should be 0)
        uint256 reward2 = swarmPoll.calculateReward(0, user2);
        assertEq(reward2, 0);
    }
}

