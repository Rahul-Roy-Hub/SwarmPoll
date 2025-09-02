// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/SwarmPoll.sol";
import "../src/SwarmToken.sol";

contract DeploySwarmPoll is Script {
    SwarmPoll poll;

    function run() external {
        vm.startBroadcast();

        // Deploy USDC mock (for local/testnet only)
        MockUSDC usdc = new MockUSDC();

        // Deploy SwarmToken
        SwarmToken swarm = new SwarmToken();

        // Deploy SwarmPoll with USDC and SwarmToken addresses
        poll = new SwarmPoll(address(usdc), address(swarm));

        console.log("Mock USDC deployed at:", address(usdc));
        console.log("SwarmToken deployed at:", address(swarm));
        console.log("SwarmPoll deployed at:", address(poll));

        vm.stopBroadcast();
    }
}

/// @notice Simple mock USDC for testing / local deployment
contract MockUSDC is IERC20 {
    string public name = "USDC";
    string public symbol = "USDC";
    uint8 public decimals = 6;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}
