import React from 'react'

export type NftListing = {
  lister?: string
  contractAddress: string
  tokenId: number
  status: 'NotListed' | 'Listed' | 'Delisted' | 'Sold'
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
