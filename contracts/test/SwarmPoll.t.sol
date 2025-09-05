// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "lib/openzeppelin-contracts/lib/forge-std/src/Test.sol";
import "../src/SwarmPoll.sol";
import "../src/MockUSDC.sol";
import "../src/SwarmToken.sol";

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
        SwarmToken swarmToken = new SwarmToken();
        swarmPoll = new SwarmPoll(address(mockUSDC), address(swarmToken));
        
        // Transfer ownership of SwarmToken to SwarmPoll so it can mint tokens
        swarmToken.transferOwnership(address(swarmPoll));
        
        // Give users some USDC (while still pranking as owner)
        mockUSDC.mint(user1, 1000 * 10**6);
        mockUSDC.mint(user2, 1000 * 10**6);
        mockUSDC.mint(user3, 1000 * 10**6);
        
        vm.stopPrank();
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
        (string memory storedQuestion, string[] memory storedOptions, uint256 endTime, bool active, uint256 totalStaked, bool winnerDeclared, uint256 winningOption) = swarmPoll.getPoll(0);
        
        assertEq(storedQuestion, question);
        assertEq(storedOptions[0], "GPT-5");
        assertEq(storedOptions[1], "Gemini 2");
        assertEq(endTime, block.timestamp + duration);
        assertEq(totalStaked, 0);
        assertEq(active, true);
        
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
        
        mockUSDC.approve(address(swarmPoll), stakeAmount);
        swarmPoll.stake(0, 0, stakeAmount);
        
        // Verify stake (after treasury fee deduction)
        uint256 expectedStake = stakeAmount - (stakeAmount * 200) / 10000; // 2% fee
        uint256 userStake = swarmPoll.getUserStake(0, user1, 0);
        assertEq(userStake, expectedStake);
        
        uint256 optionStake = swarmPoll.getOptionStake(0, 0);
        assertEq(optionStake, expectedStake);
        
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
        mockUSDC.approve(address(swarmPoll), 100 * 10**6);
        swarmPoll.stake(0, 0, 100 * 10**6);
        vm.stopPrank();
        
        vm.startPrank(user2);
        mockUSDC.approve(address(swarmPoll), 50 * 10**6);
        swarmPoll.stake(0, 1, 50 * 10**6);
        vm.stopPrank();
        
        // Fast forward time
        vm.warp(block.timestamp + 3601);
        
        // Declare winner
        vm.startPrank(owner);
        swarmPoll.declareWinner(0, 0);
        
        // Verify poll ended
        (,,, bool active, uint256 totalStaked, bool winnerDeclared, uint256 winningOption) = swarmPoll.getPoll(0);
        assertEq(winnerDeclared, true);
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
        mockUSDC.approve(address(swarmPoll), 100 * 10**6);
        swarmPoll.stake(0, 0, 100 * 10**6);
        vm.stopPrank();
        
        // User2 stakes on losing option
        vm.startPrank(user2);
        mockUSDC.approve(address(swarmPoll), 50 * 10**6);
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
    
    function test_RevertWhen_StakeOnEndedPoll() public {
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
        mockUSDC.approve(address(swarmPoll), 100 * 10**6);
        vm.expectRevert();
        swarmPoll.stake(0, 0, 100 * 10**6);
        vm.stopPrank();
    }
    
    function test_RevertWhen_StakeOnExpiredPoll() public {
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
        mockUSDC.approve(address(swarmPoll), 100 * 10**6);
        vm.expectRevert();
        swarmPoll.stake(0, 0, 100 * 10**6);
        vm.stopPrank();
    }
    
    function test_RevertWhen_NonOwnerCreatePoll() public {
        vm.startPrank(user1);
        
        string memory question = "Which AI will be more influential?";
        string[] memory options = new string[](2);
        options[0] = "GPT-5";
        options[1] = "Gemini 2";
        
        vm.expectRevert();
        swarmPoll.createPoll(question, options, 3600);
        
        vm.stopPrank();
    }
    
    function test_RevertWhen_NonOwnerDeclareWinner() public {
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
        mockUSDC.approve(address(swarmPoll), 100 * 10**6);
        swarmPoll.stake(0, 0, 100 * 10**6);
        vm.stopPrank();
        
        // User2 stakes 50 USDC on losing option
        vm.startPrank(user2);
        mockUSDC.approve(address(swarmPoll), 50 * 10**6);
        swarmPoll.stake(0, 1, 50 * 10**6);
        vm.stopPrank();
        
        // Fast forward and declare winner
        vm.warp(block.timestamp + 3601);
        vm.startPrank(owner);
        swarmPoll.declareWinner(0, 0);
        vm.stopPrank();
        
        // User1 should be able to claim reward
        vm.startPrank(user1);
        uint256 balanceBefore = mockUSDC.balanceOf(user1);
        swarmPoll.claimReward(0);
        uint256 balanceAfter = mockUSDC.balanceOf(user1);
        assertGt(balanceAfter, balanceBefore); // Should receive more than original stake
        vm.stopPrank();
        
        // User2 should not be able to claim (staked on losing option)
        vm.startPrank(user2);
        vm.expectRevert();
        swarmPoll.claimReward(0);
        vm.stopPrank();
    }
}

