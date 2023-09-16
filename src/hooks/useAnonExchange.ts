import { useCallback, useState } from 'react'
import { anonExchangeAddress, anonExchangeABI } from 'abis'
import { AnonExchangeContextType, EthDeposit, NftListing, NftStatus } from 'context/AnonExchangeContext'
import { ethers } from 'ethers'
import { chainInUse } from 'utils/config'
import { sepolia } from 'wagmi'

export default function useAnonExchange(): AnonExchangeContextType {
  const [nftListings, setNftListings] = useState<AnonExchangeContextType['nftListings']>([])
  const [ethDeposits, setEthDeposits] = useState<AnonExchangeContextType['ethDeposits']>([])
  const chain = chainInUse

  const refreshNftListing = useCallback(async (): Promise<NftListing[]> => {
    if (!chain || !anonExchangeAddress[chain?.id as keyof typeof anonExchangeAddress]) {
      return []
    }

    const anonExchange = new ethers.Contract(
      anonExchangeAddress[chain?.id as keyof typeof anonExchangeAddress],
      anonExchangeABI,
      new ethers.providers.JsonRpcProvider(chain.rpcUrls.default.http[0])
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
    ).catch((e) => {
      console.error(e)
    })
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
      new ethers.providers.JsonRpcProvider(chain.id === sepolia.id ? chain.rpcUrls.infura.http[0] : chain.rpcUrls.default.http[0])
      // new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/3c979d1c554c4d5ebd6148011a794e1d')
      // new ethers.providers.JsonRpcProvider(chain.rpcUrls.default.http[0])
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
