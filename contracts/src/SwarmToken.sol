//SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {ERC20Burnable, ERC20} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SwarmToken is ERC20Burnable, Ownable {
    error SwarmToken__CanNotMintToZerAddress(address);
    error SwarmToken__InvalidAmount(uint256);
    error SwarmToken__CanNotBurnFromoZerAddress(address);
    error SwarmToken__BurnAmountExceedsBalance(uint256);

    constructor() ERC20("Swarm Token", "SWARM") Ownable(msg.sender) {}

    function mint(address _to, uint256 _amount) external onlyOwner returns (bool) {
        if (_to == address(0)) {
            revert SwarmToken__CanNotMintToZerAddress(_to);
        }
        if (_amount <= 0) {
            revert SwarmToken__InvalidAmount(_amount);
        }
        _mint(_to, _amount);
        return true;
    }

    function burn(uint256 _amount) public override {
        uint256 balance = balanceOf(msg.sender);
        if (_amount <= 0) {
            revert SwarmToken__InvalidAmount(_amount);
        }
        if (balance < _amount) {
            revert SwarmToken__BurnAmountExceedsBalance(_amount);
        }
        super.burn(_amount);
    }
}
