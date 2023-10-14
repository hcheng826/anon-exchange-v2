// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

contract Simple721 is ERC721 {
  using Counters for Counters.Counter;

  Counters.Counter public _tokenIdCounter;

  constructor() ERC721('Simple721', '721') {}

  function safeMint(address to) public {
    uint256 tokenId = _tokenIdCounter.current();
    _tokenIdCounter.increment();
    _safeMint(to, tokenId);
  }
}
