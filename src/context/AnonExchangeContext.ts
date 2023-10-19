import React from 'react'

export type ListingStatus = 'NotListed' | 'Listed' | 'Delisted' | 'Sold'

export enum Signal {
  BUYER_WITHDRAW_UNSPENT_ETH = 0,
  BUYER_BUY_AND_CLAIM_NFT = 1,
  SELLER_CLAIM_ETH = 2,
}

export enum ListingType {
  ERC20,
  ERC721,
  ERC1155,
}

export type Listing = {
  listingType: ListingType
  lister?: string
  contractAddress: string
  amount: number
  tokenId?: number
  status: ListingStatus
  listingIdx?: number
}

export type EthDeposit = {
  depositer: string
  timestamp: number
}

export type AnonExchangeContextType = {
  listings: Listing[]
  ethDeposits: EthDeposit[]
  refreshListing: () => Promise<Listing[]>
  refreshEthDeposits: () => Promise<void>
}

export default React.createContext<AnonExchangeContextType>({
  listings: [],
  ethDeposits: [],
  refreshListing: async () => {
    return []
  },
  refreshEthDeposits: async () => {},
})
