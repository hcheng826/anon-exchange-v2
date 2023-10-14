// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract Simple20 is ERC20 {
  constructor() ERC20('Simple20', '20') {}

  function safeMint(address to, uint256 amount) public {
    _mint(to, amount);
  }
}
