import { useAccount, useNetwork } from 'wagmi'
import { Button, Heading, list } from '@chakra-ui/react'
import { NextSeo } from 'next-seo'
import { useCallback, useEffect, useState } from 'react'
import { NftList } from 'components/NftList'
import { SemaphoreIdentityGenerate } from 'components/SemaphoreIdentityGenerate'
import { HeadingComponent } from 'components/layout/HeadingComponent'
import { NftListing, NftStatus } from 'context/AnonExchangeContext'
import { Identity } from '@semaphore-protocol/identity'
import { MintNFT } from 'components/MintNftButton'
import { ImportNft } from 'components/ImportNftButton'
import { ListNFT } from 'components/ListNftButton'
import { DelistNFT } from 'components/DelistNftButton'
import { v4 as uuidv4 } from 'uuid'
import { ApproveAllNFT } from 'components/ApproveAllNftButton'
import useAnonExchange from 'hooks/useAnonExchange'

export default function ListNftPage() {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()

  const [contractAddressInput, setContractAddressInput] = useState<string>('')
  const [tokenIdInput, setTokenIdInput] = useState<number | null>(null)
  const [semaphoreId, setSemaphoreId] = useState<Identity>()
  const [secret, setSecret] = useState(uuidv4())
  const { nftListings, refreshNftListing } = useAnonExchange()

  const [nfts, setNfts] = useState<NftListing[]>([])

  const refreshNfts = useCallback(() => {
    refreshNftListing()

    setNfts((prevNfts) => {
      const updatedNfts = [...prevNfts]
      let isChanged = false

      nftListings.forEach((listing) => {
        if (listing.lister === address) {
          const existingIndex = updatedNfts.findIndex((nft) => {
            return nft.contractAddress === listing.contractAddress && nft.tokenId === listing.tokenId
          })

          if (existingIndex !== -1) {
            updatedNfts[existingIndex] = listing
            isChanged = true
          } else {
            updatedNfts.push(listing)
            isChanged = true
          }
        }
      })

      if (isChanged) {
        return updatedNfts
      }

      return prevNfts
    })
  }, [address, nftListings, refreshNftListing])

  useEffect(() => {
    refreshNfts()
  }, [])

  useEffect(() => {
    const interval = setInterval(refreshNfts, 5000)
    return () => clearInterval(interval)
  }, [refreshNfts])

  function refreshSecret() {
    setSecret(uuidv4())
  }

  function updateNftStatus(nft: NftListing, newStatus: NftStatus) {
    const updatedNfts = nfts.map((_nft) =>
      nft.tokenId === _nft.tokenId && nft.contractAddress === _nft.contractAddress ? { ...nft, status: newStatus } : nft
    )

    setNfts(updatedNfts)
  }

  if (isConnected && address && chain) {
    return (
      <div>
        <NextSeo title="Mint NFT" />

        <HeadingComponent as="h2">List NFT</HeadingComponent>

        <Heading as="h2" fontSize="2xl" my={4}>
          Mint Test NFT
        </Heading>
        <MintNFT address={address} chain={chain} setNfts={setNfts} />
        <ApproveAllNFT chain={chain} />

        <SemaphoreIdentityGenerate semaphoreId={semaphoreId} setSemaphoreId={setSemaphoreId} secret={secret} refreshSecret={refreshSecret} />

        <Heading as="h2" fontSize="2xl" my={4}>
          NFT List
        </Heading>

        <ImportNft
          {...{
            contractAddressInput,
            setContractAddressInput,
            tokenIdInput,
            setTokenIdInput,
            nfts,
            setNfts,
            address,
          }}
        />

        <NftList
          nfts={nfts}
          statusAction={{
            NotListed: {
              renderButton: semaphoreId
                ? (nft, chain) => (
                    <ListNFT
                      nft={nft}
                      chain={chain}
                      identity={semaphoreId}
                      updateNftStatus={updateNftStatus}
                      setSemaphoreId={setSemaphoreId}
                      refreshSecret={refreshSecret}
                    />
                  )
                : () => <Button disabled={true}>Please generate Semaphore Id first</Button>,
            },
            Sold: {},
            Delisted: {
              renderButton: semaphoreId
                ? (nft, chain) => (
                    <ListNFT
                      nft={nft}
                      chain={chain}
                      identity={semaphoreId}
                      updateNftStatus={updateNftStatus}
                      setSemaphoreId={setSemaphoreId}
                      refreshSecret={refreshSecret}
                    />
                  )
                : () => <Button disabled={true}>Please generate Semaphore Id first</Button>,
            },
            Listed: { renderButton: (nft, chain) => <DelistNFT nft={nft} chain={chain} updateNftStatus={updateNftStatus} /> },
          }}
          chain={chain}
          identity={semaphoreId}
          updateNftStatus={updateNftStatus}
        />
      </div>
    )
  }

  return <div>Connect your wallet first to mint test NFT.</div>
}
