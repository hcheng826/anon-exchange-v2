import React from 'react'

export type NftStatus = 'NotListed' | 'Listed' | 'Delisted' | 'Sold'

export type NftListing = {
  lister?: string
  contractAddress: string
  tokenId: number
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
