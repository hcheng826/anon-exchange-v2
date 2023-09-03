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
  refreshNftListing: () => Promise<void>
  refreshEthDeposits: () => Promise<void>
}

export default React.createContext<AnonExchangeContextType>({
  nftListings: [],
  ethDeposits: [],
  refreshNftListing: async () => {},
  refreshEthDeposits: async () => {},
})
