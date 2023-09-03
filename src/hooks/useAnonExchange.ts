import { NftListedEvent } from './../../contracts/typechain-types/contracts/AnonExchange'
import { SemaphoreEthers } from '@semaphore-protocol/data'
import { useCallback, useState } from 'react'
import { Address, useNetwork } from 'wagmi'
import { anonExchangeAddress, anonExchangeABI } from 'abis'
import { ETH_DEPOSITED_GROUP_ID, NFT_SOLD_GROUP_ID, semaphoreStartBlock } from 'utils/config'
import { AnonExchangeContextType, NftStatus } from 'context/AnonExchangeContext'
import { ethers } from 'ethers'

export default function useAnonExchange(address?: Address): AnonExchangeContextType {
  const [nftListings, setNftListings] = useState<AnonExchangeContextType['nftListings']>([])
  const [ethDeposits, setEthDeposits] = useState<AnonExchangeContextType['ethDeposits']>([])
  const { chain } = useNetwork()

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

  const refreshNftListing = useCallback(async (): Promise<void> => {
    if (!chain) {
      return
    }

    const anonExchange = new ethers.Contract(
      anonExchangeAddress[chain?.id as keyof typeof anonExchangeAddress],
      anonExchangeABI,
      new ethers.providers.JsonRpcProvider()
    )

    type NftRecord = {
      blockNumber: number
      lister: string
      status: NftStatus
    }

    const nftLatestRecord: Record<string, Record<number, NftRecord>> = {}

    const nftListedfilter = anonExchange.filters['NftListed']()
    const nftDelistedfilter = anonExchange.filters['NftDelisted']()
    const nftSoldfilter = anonExchange.filters['NftSold']()

    const filters = [nftListedfilter, nftDelistedfilter, nftSoldfilter]
    const statuses: NftStatus[] = ['Listed', 'Delisted', 'Sold']

    await Promise.all(
      filters.map(async (filter, i) => {
        const events = await anonExchange.queryFilter(filter)
        events.map((event) => {
          if (event.args) {
            const { lister, nftAddr, tokenId } = event.args

            if (!nftLatestRecord[nftAddr]) {
              nftLatestRecord[nftAddr] = {}
            }

            if (!nftLatestRecord[nftAddr][tokenId]) {
              nftLatestRecord[nftAddr][tokenId] = {
                blockNumber: event.blockNumber,
                lister,
                status: statuses[i],
              }
            } else {
              if (event.blockNumber > nftLatestRecord[nftAddr][tokenId].blockNumber) {
                nftLatestRecord[nftAddr][tokenId] = {
                  blockNumber: event.blockNumber,
                  lister,
                  status: statuses[i],
                }
              }
            }
          }
        })
      })
    )

    const nftListings = []

    for (const contractAddress in nftLatestRecord) {
      for (const tokenIdStr in nftLatestRecord[contractAddress]) {
        const record = nftLatestRecord[contractAddress][tokenIdStr]
        nftListings.push({
          lister: record.lister,
          contractAddress: contractAddress,
          tokenId: parseInt(tokenIdStr),
          status: record.status,
        })
      }
    }

    setNftListings(nftListings)
  }, [chain])

  const refreshEthDeposits = useCallback(async (): Promise<void> => {
    if (!chain) {
      return
    }

    setEthDeposits([])
  }, [chain])

  return {
    nftListings,
    ethDeposits,
    refreshNftListing,
    refreshEthDeposits,
  }
}
