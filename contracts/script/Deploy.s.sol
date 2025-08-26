// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/SwarmPoll.sol";
import "../src/MockUSDC.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy MockUSDC first
        MockUSDC mockUSDC = new MockUSDC();
        console.log("MockUSDC deployed at:", address(mockUSDC));

        // Deploy SwarmPoll with MockUSDC address
        SwarmPoll swarmPoll = new SwarmPoll(address(mockUSDC));
        console.log("SwarmPoll deployed at:", address(swarmPoll));

        vm.stopBroadcast();

        // Save deployment addresses
        string memory deploymentData = string.concat(
            "MockUSDC=", vm.toString(address(mockUSDC)), "\n",
            "SwarmPoll=", vm.toString(address(swarmPoll))
        );
        vm.writeFile("deployment.txt", deploymentData);
    }
}

