import { useCallback, useState } from 'react'
import { useNetwork } from 'wagmi'
import { anonExchangeAddress, anonExchangeABI } from 'abis'
import { AnonExchangeContextType, EthDeposit, NftListing, NftStatus } from 'context/AnonExchangeContext'
import { ethers } from 'ethers'

export default function useAnonExchange(): AnonExchangeContextType {
  const [nftListings, setNftListings] = useState<AnonExchangeContextType['nftListings']>([])
  const [ethDeposits, setEthDeposits] = useState<AnonExchangeContextType['ethDeposits']>([])
  const { chain } = useNetwork()

  const refreshNftListing = useCallback(async (): Promise<NftListing[]> => {
    if (!chain || !anonExchangeAddress[chain?.id as keyof typeof anonExchangeAddress]) {
      return []
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
    return nftListings
  }, [chain])

  const refreshEthDeposits = useCallback(async (): Promise<void> => {
    if (!chain || !anonExchangeAddress[chain?.id as keyof typeof anonExchangeAddress]) {
      return
    }

    const anonExchange = new ethers.Contract(
      anonExchangeAddress[chain?.id as keyof typeof anonExchangeAddress],
      anonExchangeABI,
      new ethers.providers.JsonRpcProvider()
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
    nftListings,
    ethDeposits,
    refreshNftListing,
    refreshEthDeposits,
  }
}
