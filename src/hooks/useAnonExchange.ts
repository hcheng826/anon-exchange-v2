import { SemaphoreEthers } from '@semaphore-protocol/data'
import { useCallback, useState } from 'react'
import { useNetwork } from 'wagmi'
import { semaphoreAddress } from 'abis'
import { ETH_DEPOSITED_GROUP_ID, NFT_SOLD_GROUP_ID, semaphoreStartBlock } from 'utils/config'
import { AnonExchangeContextType } from 'context/AnonExchangeContext'

export default function useAnonExchange(): AnonExchangeContextType {
  const [ownerNftMap, setOwnerNftMap] = useState<AnonExchangeContextType['ownerNftMap']>({})
  const { chain } = useNetwork()

  /**
  scrape the following smart contract events
  event NftListed(address lister, address nftAddr, uint256 tokenId);
  event NftDelisted(address lister, address nftAddr, uint256 tokenId);
  event NftSold(address lister, address nftAddr, uint256 tokenId);

  NftListed: add to the ownerNftMap
  Deflisted: remove from the map
  Sold: mark status as sold
  */

  return {
    ownerNftMap,
  }
}
