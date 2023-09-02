import React from 'react'

export type NftStatus = 'NotListed' | 'Listed' | 'Delisted' | 'Sold'

export type NftListing = {
  lister?: string
  contractAddress: string
  tokenId: number
  status: NftStatus
}

type EthDeposit = {}

export type AnonExchangeContextType = {
  nftListings: NftListing[]
  ethDeposits: EthDeposit[]
}

export default React.createContext<AnonExchangeContextType>({
  nftListings: [],
  ethDeposits: [],
})
