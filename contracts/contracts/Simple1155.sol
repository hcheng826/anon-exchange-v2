// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';

contract Simple1155 is ERC1155 {
  constructor() ERC1155('') {}

  function safeMint(address to, uint256 id, uint256 amount) public {
    _mint(to, id, amount, bytes(''));
  }
}
