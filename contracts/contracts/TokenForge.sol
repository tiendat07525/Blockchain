// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title TokenForge (TFG)
/// @notice ERC-20: chỉ owner được mint, holder tự burn token của mình.
contract TokenForge is ERC20, ERC20Burnable, Ownable {
    constructor(address initialOwner, uint256 initialSupply)
        ERC20("TokenForge", "TFG")
        Ownable(initialOwner)
    {
        if (initialSupply > 0) {
            _mint(initialOwner, initialSupply);
        }
    }

    /// @notice Mint token mới, chỉ owner.
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}