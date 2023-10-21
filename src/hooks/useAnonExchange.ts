import { useCallback, useState } from 'react'
import { anonExchangeAddress, anonExchangeABI } from 'abis'
import { AnonExchangeContextType, EthDeposit, Listing, ListingStatus } from 'context/AnonExchangeContext'
import { ethers } from 'ethers'
import { Chain } from 'viem'

export default function useAnonExchange(chain: Chain | undefined): AnonExchangeContextType {
  const [listings, setListings] = useState<AnonExchangeContextType['listings']>([])
  const [ethDeposits, setEthDeposits] = useState<AnonExchangeContextType['ethDeposits']>([])

  const refreshListing = useCallback(async (): Promise<Listing[]> => {
    if (!chain || !anonExchangeAddress[chain?.id as keyof typeof anonExchangeAddress]) {
      return []
    }

    const anonExchange = new ethers.Contract(
      anonExchangeAddress[chain?.id as keyof typeof anonExchangeAddress],
      anonExchangeABI,
      new ethers.providers.JsonRpcProvider(chain.rpcUrls.default.http[0])
    )

    type ListingRecord = {
      blockNumber: number
      listing: Listing
      status: ListingStatus
    }

    const listingLatestRecord: Record<string, Record<number, ListingRecord>> = {}

    const listingListedfilter = anonExchange.filters.Listed()
    const listingDelistedfilter = anonExchange.filters.Delisted()
    const listingSoldfilter = anonExchange.filters.Sold()

    const filters = [listingListedfilter, listingDelistedfilter, listingSoldfilter]
    const statuses: ListingStatus[] = ['Listed', 'Delisted', 'Sold']

    await Promise.all(
      filters.map(async (filter, i) => {
        const events = await anonExchange.queryFilter(filter)
        events.map((event) => {
          if (event.args) {
            const listing = event.args.listing
            listing.listingIdx = event.args.listingIdx

            const listingAddr = listing.contractAddress
            const tokenId = listing.tokenId

            if (!listingLatestRecord[listingAddr]) {
              listingLatestRecord[listingAddr] = {}
            }

            if (!listingLatestRecord[listingAddr][tokenId]) {
              listingLatestRecord[listingAddr][tokenId] = {
                blockNumber: event.blockNumber,
                listing: listing,
                status: statuses[i],
              }
            } else {
              if (event.blockNumber > listingLatestRecord[listingAddr][tokenId].blockNumber) {
                listingLatestRecord[listingAddr][tokenId] = {
                  blockNumber: event.blockNumber,
                  listing: listing,
                  status: statuses[i],
                }
              }
            }
          }
        })
      })
    ).catch((e) => {
      console.error('error getting events', e)
    })

    const listings: Listing[] = []

    for (const contractAddress in listingLatestRecord) {
      for (const tokenIdStr in listingLatestRecord[contractAddress]) {
        const record = listingLatestRecord[contractAddress][tokenIdStr]
        listings.push({
          ...record.listing,
          status: record.status,
        })
      }
    }

    setListings(listings)
    return listings
  }, [chain])

  const refreshEthDeposits = useCallback(async (): Promise<void> => {
    if (!chain || !anonExchangeAddress[chain?.id as keyof typeof anonExchangeAddress]) {
      return
    }

    const anonExchange = new ethers.Contract(
      anonExchangeAddress[chain?.id as keyof typeof anonExchangeAddress],
      anonExchangeABI,
      new ethers.providers.JsonRpcProvider(chain.rpcUrls.default.http[0])
    )
    const ethDepositfilter = anonExchange.filters['EthDeposited']()

    const events = await anonExchange.queryFilter(ethDepositfilter)

    const depositsPromises = events.map(async (event) => {
      if (event.args) {
        const { depositer } = event.args
        const block = await event.getBlock()
        return {
          depositer,
          timestamp: block.timestamp,
        }
      }
      return null
    })

    const ethDeposits: EthDeposit[] = (await Promise.all(depositsPromises)).filter((deposit): deposit is EthDeposit => deposit !== null)

    setEthDeposits(ethDeposits)
  }, [chain])

  return {
    listings,
    ethDeposits,
    refreshListing,
    refreshEthDeposits,
  }
}
