import { useAccount, useNetwork } from 'wagmi'
import { Button, Heading } from '@chakra-ui/react'
import { NextSeo } from 'next-seo'
import { useState } from 'react'
import { NftList } from 'components/NftList'
import { SemaphoreIdentityGenerate } from 'components/SemaphoreIdentityGenerate'
import { HeadingComponent } from 'components/layout/HeadingComponent'
import { NftListing, NftStatus } from 'context/AnonExchangeContext'
import { Identity } from '@semaphore-protocol/identity'
import { MintNFT } from 'components/MintNftButton'
import { ImportNft } from 'components/ImportNftButton'
import { ListNFT } from 'components/ListNftButton'
import { DelistNFT } from 'components/DelistNftButton'

export default function ListNftPage() {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()

  const nftListings: NftListing[] = []

  const [nfts, setNfts] = useState<NftListing[]>(
    nftListings.filter((listing) => {
      return listing.lister && listing.lister === address
    })
  )

  const [contractAddressInput, setContractAddressInput] = useState<string>('')
  const [tokenIdInput, setTokenIdInput] = useState<number | null>(null)
  const [semaphoreId, setSemaphoreId] = useState<Identity>()

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

        <SemaphoreIdentityGenerate semaphoreId={semaphoreId} setSemaphoreId={setSemaphoreId} />

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
            // TODO override the buttons
            NotListed: {
              renderButton: semaphoreId
                ? (nft, chain) => (
                    <ListNFT nft={nft} chain={chain} identity={semaphoreId} updateNftStatus={updateNftStatus} setSemaphoreId={setSemaphoreId} />
                  )
                : () => <Button disabled={true}>Please generate Semaphore Id first</Button>,
            },
            Sold: {},
            Delisted: {
              renderButton: semaphoreId
                ? (nft, chain) => (
                    <ListNFT nft={nft} chain={chain} identity={semaphoreId} updateNftStatus={updateNftStatus} setSemaphoreId={setSemaphoreId} />
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
