// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol';
import '@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol';
import '@semaphore-protocol/contracts/interfaces/ISemaphore.sol';

contract AnonExchange is IERC721Receiver, IERC1155Receiver {
  ISemaphore public semaphore;

  uint256 public constant LISTING_SOLD_SELLER_GROUP_ID = 1;
  uint256 public constant ETH_DEPOSITED_BUYER_GROUP_ID = 2;

  uint256 public constant BUYER_WITHDRAW_UNSPENT_ETH_SIGNAL = 0;
  uint256 public constant BUYER_BUY_AND_CLAIM_SIGNAL = 1;
  uint256 public constant SELLER_CLAIM_ETH_SIGNAL = 2;

  uint256 public constant LISTING_PRICE = 0.01 ether;

  struct ListNFTRecord {
    address sellerAddr;
    uint256 idCommitment;
  }

  enum ListingType {
    ERC20,
    ERC721,
    ERC1155
  }

  struct Listing {
    ListingType listingType;
    address lister;
    address contractAddress; // address(0) means unavailable
    uint256 tokenId; // not used for ERC20
    uint256 amount; // not used for ERC721
    uint256 idCommitment;
  }

  struct SemaphoreProof {
    uint256 merkleTreeRoot;
    uint256 nullifierHash;
    uint256[8] proof;
  }

  error InvalidDepositAmount();
  error EthTransferFailed();
  error CallerNotLister();
  error InvalidListingType();
  error ListingUnavailable();

  event Listed(Listing listing, uint256 listingIdx);
  event Delisted(Listing listing, uint256 listingIdx);
  event Sold(Listing listing, uint256 listingIdx, address recipient);
  event EthDeposited(address indexed depositer);
  event EthWithdrawn(address indexed recipient);
  event EthClaimed(address indexed recipient);

  constructor(address semaphoreAddress) {
    semaphore = ISemaphore(semaphoreAddress);

    semaphore.createGroup(LISTING_SOLD_SELLER_GROUP_ID, 20, address(this));
    semaphore.createGroup(ETH_DEPOSITED_BUYER_GROUP_ID, 20, address(this));
  }

  /** state variables **/
  Listing[] public listings;

  /** external functions **/
  // call by lister
  function list(Listing calldata listing) external {
    if (listing.lister != msg.sender) {
      revert CallerNotLister();
    }

    listings.push(listing);
    uint256 listingIdx = listings.length - 1;
    trnasferListing(listings[listingIdx], msg.sender, address(this));

    emit Listed(listing, listingIdx);
  }

  // call by lister
  function delist(uint256 listingIdx) external {
    Listing storage listing = listings[listingIdx];

    if (listing.contractAddress == address(0)) {
      revert ListingUnavailable();
    }

    if (listing.lister != msg.sender) {
      revert CallerNotLister();
    }

    emit Delisted(listing, listingIdx);

    trnasferListing(listing, address(this), msg.sender);
  }

  // Can be called by any address with proof
  function buyAndClaim(uint256 listingIdx, address recipient, SemaphoreProof calldata proof) external {
    semaphore.verifyProof(
      ETH_DEPOSITED_BUYER_GROUP_ID,
      proof.merkleTreeRoot,
      BUYER_BUY_AND_CLAIM_SIGNAL,
      proof.nullifierHash,
      ETH_DEPOSITED_BUYER_GROUP_ID,
      proof.proof
    );

    Listing storage listing = listings[listingIdx];

    semaphore.addMember(LISTING_SOLD_SELLER_GROUP_ID, listing.idCommitment);

    emit Sold(listing, listingIdx, recipient);

    trnasferListing(listing, address(this), recipient);
  }

  function claimPayment(address recipient, SemaphoreProof calldata proof) external {}

  // call by potential buyer
  function depositETH(uint256 identityCommitment) external payable {
    if (msg.value != LISTING_PRICE) revert InvalidDepositAmount();
    semaphore.addMember(ETH_DEPOSITED_BUYER_GROUP_ID, identityCommitment);

    emit EthDeposited(msg.sender);
  }

  // ETH depositer can withdraw ETH before it's spent
  // Can be called by any address with proof after ETH is deposited
  function withdrawETH(address ethRecipient, SemaphoreProof calldata proof) external {
    semaphore.verifyProof(
      ETH_DEPOSITED_BUYER_GROUP_ID,
      proof.merkleTreeRoot,
      BUYER_WITHDRAW_UNSPENT_ETH_SIGNAL,
      proof.nullifierHash,
      ETH_DEPOSITED_BUYER_GROUP_ID,
      proof.proof
    );

    (bool success, ) = ethRecipient.call{value: LISTING_PRICE}('');
    if (!success) revert EthTransferFailed();

    emit EthWithdrawn(ethRecipient);
  }

  // Can be called by any address with proof after NFT is sold
  function claimETH(address ethRecipient, SemaphoreProof calldata proof) external {
    semaphore.verifyProof(
      LISTING_SOLD_SELLER_GROUP_ID,
      proof.merkleTreeRoot,
      SELLER_CLAIM_ETH_SIGNAL,
      proof.nullifierHash,
      LISTING_SOLD_SELLER_GROUP_ID,
      proof.proof
    );

    (bool success, ) = ethRecipient.call{value: LISTING_PRICE}('');
    if (!success) revert EthTransferFailed();

    emit EthClaimed(ethRecipient);
  }

  /** internal functions */
  function trnasferListing(Listing storage listing, address from, address to) internal {
    ListingType listingType = listing.listingType;
    address contractAddress = listing.contractAddress;
    uint256 tokenId = listing.tokenId;
    uint256 amount = listing.amount;

    if (from == address(this)) {
      listing.contractAddress = address(0);
    }

    if (listingType == ListingType.ERC20) {
      if (from == address(this)) {
        IERC20(contractAddress).transfer(to, amount);
      } else {
        IERC20(contractAddress).transferFrom(from, to, amount);
      }
    } else if (listingType == ListingType.ERC721) {
      IERC721(contractAddress).safeTransferFrom(from, to, tokenId);
    } else if (listingType == ListingType.ERC1155) {
      IERC1155(contractAddress).safeTransferFrom(from, to, tokenId, amount, bytes(''));
    } else {
      revert InvalidListingType();
    }
  }

  /** dummy functions */
  function onERC721Received(address, address, uint256, bytes calldata) external pure override returns (bytes4) {
    // bytes4(keccak256('onERC721Received(address,address,uint256,bytes)'))
    return 0x150b7a02;
  }

  function onERC1155Received(address, address, uint256, uint256, bytes calldata) external pure override returns (bytes4) {
    // bytes4(keccak256('onERC1155Received(address,address,uint256,uint256,bytes)'))
    return 0xf23a6e61;
  }

  function onERC1155BatchReceived(address, address, uint256[] calldata, uint256[] calldata, bytes calldata) external pure override returns (bytes4) {
    // bytes4(keccak256('onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)'))
    return 0xbc197c81;
  }

  function supportsInterface(bytes4) external pure override returns (bool) {
    return false;
  }
}
