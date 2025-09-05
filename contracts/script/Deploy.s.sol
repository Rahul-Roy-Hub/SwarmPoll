// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/SwarmPoll.sol";
import "../src/SwarmToken.sol";
import "../src/MockUSDC.sol";

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
        
        // Transfer ownership of SwarmToken to SwarmPoll so it can mint tokens
        swarm.transferOwnership(address(poll));

        console.log("Mock USDC deployed at:", address(usdc));
        console.log("SwarmToken deployed at:", address(swarm));
        console.log("SwarmPoll deployed at:", address(poll));

        vm.stopBroadcast();
    }
}

