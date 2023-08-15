// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@semaphore-protocol/contracts/interfaces/ISemaphore.sol';

contract AnonExchange is ReentrancyGuard {
  ISemaphore public semaphore;

  uint public constant NFT_SOLD_SELLER_GROUP_ID = 1;
  uint public constant ETH_DEPOSITED_BUYER_GROUP_ID = 2;

  uint public constant BUYER_WITHDRAW_UNSPENT_ETH_SIGNAL = 0;
  uint public constant BUYER_BUY_AND_CLAIM_NFT_SIGNAL = 1;
  uint public constant SELLER_CLAIM_ETH_SIGNAL = 2;

  struct ListNFTRecord {
    address sellerAddr;
    uint idCommitment;
  }

  error CallerInvalidOrNftNotDeposit();
  error InvalidDepositAmount();
  error AlreadyDeposited();
  error NoDeposit();
  error EthTransferFailed();
  error NftNotAvailable();

  constructor(address semaphoreAddress) {
    semaphore = ISemaphore(semaphoreAddress);

    semaphore.createGroup(NFT_SOLD_SELLER_GROUP_ID, 20, address(this));
    semaphore.createGroup(ETH_DEPOSITED_BUYER_GROUP_ID, 20, address(this));
  }

  // Mapping of NFT addresses to their deposits
  // nft contract addr -> tokenId -> idcommitment/holder addr
  mapping(address => mapping(uint256 => ListNFTRecord)) public nftListingRecords;

  // Mapping of user identityCommitments to their ETH deposit status
  // depositor addr -> identity
  mapping(address => uint) public ethDepositRecords;

  function depositNFT(address nftAddress, uint256 tokenId, uint256 identityCommitment) external nonReentrant {
    IERC721(nftAddress).safeTransferFrom(msg.sender, address(this), tokenId);
    nftListingRecords[nftAddress][tokenId] = ListNFTRecord({sellerAddr: msg.sender, idCommitment: identityCommitment});
  }

  // Original depositer can withdraw the NFT before it's sold
  function withdrawNFT(address nftAddress, uint256 tokenId) external nonReentrant {
    if (nftListingRecords[nftAddress][tokenId].sellerAddr != msg.sender) revert CallerInvalidOrNftNotDeposit();

    IERC721(nftAddress).safeTransferFrom(address(this), msg.sender, tokenId);
    nftListingRecords[nftAddress][tokenId] = ListNFTRecord({sellerAddr: address(0), idCommitment: 0});
  }

  function depositETH(uint256 identityCommitment) external payable nonReentrant {
    if (msg.value != 0.1 ether) revert InvalidDepositAmount();
    if (ethDepositRecords[msg.sender] != 0) revert AlreadyDeposited();

    ethDepositRecords[msg.sender] = identityCommitment;
    semaphore.addMember(ETH_DEPOSITED_BUYER_GROUP_ID, identityCommitment);
  }

  // Original depositer can withdraw the NFT before it's spent
  // (Note: could also make withdraw unspent ETH anonymous. deposit and withdraw itself becomes tornado)
  function withdrawETH(uint256 merkleTreeRoot, uint256 nullifierHash, uint256[8] calldata proof) external nonReentrant {
    if (ethDepositRecords[msg.sender] == 0) revert NoDeposit();

    ethDepositRecords[msg.sender] = 0;

    semaphore.verifyProof(
      ETH_DEPOSITED_BUYER_GROUP_ID,
      merkleTreeRoot,
      BUYER_WITHDRAW_UNSPENT_ETH_SIGNAL,
      nullifierHash,
      ETH_DEPOSITED_BUYER_GROUP_ID,
      proof
    );

    (bool success, ) = msg.sender.call{value: 0.1 ether}('');
    if (!success) revert EthTransferFailed();
  }

  // triggered by NFT buyer, who has deposited ETH
  function buyAndClaimNFT(
    address nftAddr,
    uint tokenId,
    uint256 merkleTreeRoot,
    uint256 nullifierHash,
    uint256[8] calldata proof,
    address nftRecipient
  ) external nonReentrant {
    if (nftListingRecords[nftAddr][tokenId].sellerAddr == address(0) || nftListingRecords[nftAddr][tokenId].idCommitment == 0)
      revert NftNotAvailable();

    // clear the NFT listing record
    nftListingRecords[nftAddr][tokenId] = ListNFTRecord({sellerAddr: address(0), idCommitment: 0});

    // update semaphore
    semaphore.verifyProof(
      ETH_DEPOSITED_BUYER_GROUP_ID,
      merkleTreeRoot,
      BUYER_BUY_AND_CLAIM_NFT_SIGNAL,
      nullifierHash,
      ETH_DEPOSITED_BUYER_GROUP_ID,
      proof
    );
    semaphore.addMember(NFT_SOLD_SELLER_GROUP_ID, nftListingRecords[nftAddr][tokenId].idCommitment);

    // transfer NFT
    IERC721(nftAddr).safeTransferFrom(address(this), nftRecipient, tokenId);
  }

  // triggered by NFT seller, can call after NFT is sold
  function claimETH(address ethRecipient, uint256 merkleTreeRoot, uint256 nullifierHash, uint256[8] calldata proof) external nonReentrant {
    semaphore.verifyProof(NFT_SOLD_SELLER_GROUP_ID, merkleTreeRoot, SELLER_CLAIM_ETH_SIGNAL, nullifierHash, NFT_SOLD_SELLER_GROUP_ID, proof);

    (bool success, ) = ethRecipient.call{value: 0.1 ether}('');
    if (!success) revert EthTransferFailed();
  }
}
