import { Address, useAccount, useNetwork } from 'wagmi'
import { Button, Heading } from '@chakra-ui/react'
import { NextSeo } from 'next-seo'
import { NftList } from 'components/NftList'
import { useEffect, useState } from 'react'
// import { SemaphoreIdentitySecretInput } from 'components/SemaphoreIdentityGenerate'
import { RecipientAdressInput } from 'components/layout/RecipientAdressInput'
import { HeadingComponent } from 'components/layout/HeadingComponent'
import { Identity } from '@semaphore-protocol/identity'
import { NftListing, NftStatus } from 'context/AnonExchangeContext'
import { SemaphoreIdentityVerify } from 'components/SemaphoreIdentityVerify'
import useAnonExchange from 'hooks/useAnonExchange'

export default function BuyNft() {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  const { nftListings, refreshNftListing } = useAnonExchange()

  // TODO: initialize NFT list
  const [nfts, setNfts] = useState<NftListing[]>([])
  const [recipient, setRecipient] = useState<string>('')
  const [semaphoreId, setSemaphoreId] = useState<Identity>()

  useEffect(() => {
    refreshNftListing()
  }, [refreshNftListing])

  if (isConnected && address && chain) {
    function updateNftStatus(nft: NftListing, newStatus: NftStatus): void {
      throw new Error('Function not implemented.')
    }

    function refreshSecret(): void {
      throw new Error('Function not implemented.')
    }

    return (
      <div>
        <NextSeo title="Buy NFT" />

        <HeadingComponent as="h2">Buy NFT</HeadingComponent>

        <SemaphoreIdentityVerify semaphoreId={semaphoreId} setSemaphoreId={setSemaphoreId} />

        <RecipientAdressInput {...{ recipient, setRecipient }} />

        <Heading as="h2" fontSize="2xl" my={4}>
          Buy NFT
        </Heading>

        <Heading as="h2" fontSize="1xl" my={4}>
          NFT Listings
        </Heading>

        <NftList
          nfts={nftListings}
          statusAction={{
            NotListed: {},
            Sold: {},
            Delisted: {},
            Listed: {},
          }}
          chain={chain}
          identity={semaphoreId}
          updateNftStatus={updateNftStatus}
        />
      </div>
    )
  }

  return <div>Connect your wallet first to deposit ETH.</div>
}
