import { SemaphoreEthers } from '@semaphore-protocol/data'
import { useCallback, useState } from 'react'
import { Address, useNetwork } from 'wagmi'
import { anonExchangeAddress, anonExchangeABI } from 'abis'
import { ETH_DEPOSITED_GROUP_ID, NFT_SOLD_GROUP_ID, semaphoreStartBlock } from 'utils/config'
import { AnonExchangeContextType } from 'context/AnonExchangeContext'
import { ethers } from 'ethers'

export default function useAnonExchange(address?: Address): AnonExchangeContextType {
  const [nftListings, setNftListings] = useState<AnonExchangeContextType['nftListings']>([])
  const [ethDeposits, setEthDeposits] = useState<AnonExchangeContextType['ethDeposits']>([])
  const { chain } = useNetwork()

  const anonExchange = new ethers.Contract(
    anonExchangeAddress[chain?.id as keyof typeof anonExchangeAddress],
    anonExchangeABI,
    new ethers.providers.JsonRpcProvider()
  )

  // const filters = anonExchange.filters['NftListed']()
  // anonExchange.queryFilter(filters).then((events) => {
  //   console.log('events', events)
  // })

  // console.log('filters', filters)
  // console.log('filters2', filters['NftListed'](address))
  // console.log('p', new ethers.providers.JsonRpcProvider())
  // console.log('c', anonExchange)

  // anonExchange.queryFilter
  /**
  scrape the following smart contract events
  event NftListed(address lister, address nftAddr, uint256 tokenId);
  event NftDelisted(address lister, address nftAddr, uint256 tokenId);
  event NftSold(address lister, address recipient, address nftAddr, uint256 tokenId);
  event EthDeposited(address depositer);
  event EthWithdrawn(address recipient);
  event EthClaimed(address recipient);

  NftListed: add to the ownerNftMap
  Deflisted: remove from the map
  Sold: mark status as sold
  */

  return {
    nftListings,
    ethDeposits,
  }
}
