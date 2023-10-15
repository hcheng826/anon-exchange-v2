import React from 'react'

export type NftStatus = 'NotListed' | 'Listed' | 'Delisted' | 'Sold'

export enum Signal {
  BUYER_WITHDRAW_UNSPENT_ETH = 0,
  BUYER_BUY_AND_CLAIM_NFT = 1,
  SELLER_CLAIM_ETH = 2,
}

export type ListingType = 'ERC20' | 'ERC721' | 'ERC1155'

export type NftListing = {
  lister?: string
  contractAddress: string
  tokenId: number
  status: NftStatus
}

export type Listing = {
  listingType: ListingType
  lister?: string
  contractAddress: string
  amount: number
  tokenId?: number
  status: NftStatus
}

export type EthDeposit = {
  depositer: string
  timestamp: number
}

export type AnonExchangeContextType = {
  nftListings: NftListing[]
  ethDeposits: EthDeposit[]
  refreshNftListing: () => Promise<NftListing[]>
  refreshEthDeposits: () => Promise<void>
}

export default React.createContext<AnonExchangeContextType>({
  nftListings: [],
  ethDeposits: [],
  refreshNftListing: async () => {
    return []
  },
  refreshEthDeposits: async () => {},
})
