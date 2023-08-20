// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol';
import '@semaphore-protocol/contracts/interfaces/ISemaphore.sol';

contract AnonExchange is IERC721Receiver {
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

  function onERC721Received(address, address, uint256, bytes calldata) external pure override returns (bytes4) {
    // bytes4(keccak256('onERC721Received(address,address,uint256,bytes)'))
    return 0x150b7a02;
  }

  // call by NFT seller
  function listNFT(address nftAddress, uint256 tokenId, uint256 identityCommitment) external {
    IERC721(nftAddress).safeTransferFrom(msg.sender, address(this), tokenId);
    nftListingRecords[nftAddress][tokenId] = ListNFTRecord({sellerAddr: msg.sender, idCommitment: identityCommitment});
  }

  // Original NFT lister can withdraw the NFT before it's sold
  function withdrawNFT(address nftAddress, uint256 tokenId) external {
    if (nftListingRecords[nftAddress][tokenId].sellerAddr != msg.sender) revert CallerInvalidOrNftNotDeposit();

    nftListingRecords[nftAddress][tokenId] = ListNFTRecord({sellerAddr: address(0), idCommitment: 0});
    IERC721(nftAddress).safeTransferFrom(address(this), msg.sender, tokenId);
  }

  // call by potential buyer
  function depositETH(uint256 identityCommitment) external payable {
    if (msg.value != 0.1 ether) revert InvalidDepositAmount();
    semaphore.addMember(ETH_DEPOSITED_BUYER_GROUP_ID, identityCommitment);
  }

  // ETH depositer can withdraw ETH before it's spent
  // Can be called by any address with proof after ETH is deposited
  function withdrawETH(uint256 merkleTreeRoot, uint256 nullifierHash, uint256[8] calldata proof, address ethRecipient) external {
    semaphore.verifyProof(
      ETH_DEPOSITED_BUYER_GROUP_ID,
      merkleTreeRoot,
      BUYER_WITHDRAW_UNSPENT_ETH_SIGNAL,
      nullifierHash,
      ETH_DEPOSITED_BUYER_GROUP_ID,
      proof
    );

    (bool success, ) = ethRecipient.call{value: 0.1 ether}('');
    if (!success) revert EthTransferFailed();
  }

  // Can be called by any address with proof after ETH is deposited
  function buyAndClaimNFT(
    address nftAddr,
    uint tokenId,
    uint256 merkleTreeRoot,
    uint256 nullifierHash,
    uint256[8] calldata proof,
    address nftRecipient
  ) external {
    if (nftListingRecords[nftAddr][tokenId].sellerAddr == address(0)) revert NftNotAvailable();

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

    // clear the NFT listing record
    nftListingRecords[nftAddr][tokenId] = ListNFTRecord({sellerAddr: address(0), idCommitment: 0});

    // transfer NFT
    IERC721(nftAddr).safeTransferFrom(address(this), nftRecipient, tokenId);
  }

  // Can be called by any address with proof after NFT is sold
  function claimETH(address ethRecipient, uint256 merkleTreeRoot, uint256 nullifierHash, uint256[8] calldata proof) external {
    semaphore.verifyProof(NFT_SOLD_SELLER_GROUP_ID, merkleTreeRoot, SELLER_CLAIM_ETH_SIGNAL, nullifierHash, NFT_SOLD_SELLER_GROUP_ID, proof);

    (bool success, ) = ethRecipient.call{value: 0.1 ether}('');
    if (!success) revert EthTransferFailed();
  }
}
