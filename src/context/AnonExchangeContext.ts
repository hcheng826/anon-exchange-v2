import React from 'react'

enum NFTStatus {
  LISTED = 'listed',
  SOLD = 'sold',
}

type NFTEntry = {
  [tokenId: number]: {
    status: NFTStatus
  }
}

type NFTAddressMap = {
  [nftAddress: string]: NFTEntry
}

type OwnerNFTMap = {
  [ownerAddress: string]: NFTAddressMap
}

export type AnonExchangeContextType = {
  ownerNftMap: OwnerNFTMap
}

export default React.createContext<AnonExchangeContextType>({
  ownerNftMap: {},
})
