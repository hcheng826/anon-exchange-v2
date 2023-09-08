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
import { FullProof } from '@semaphore-protocol/proof'
import { BuyNFT } from 'components/BuyNftButton'
import { isAddress } from 'viem'

export default function BuyNft() {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  const { nftListings, refreshNftListing } = useAnonExchange()

  const [recipient, setRecipient] = useState<string>('')
  const [semaphoreId, setSemaphoreId] = useState<Identity>()
  const [fullProof, setFullProof] = useState<FullProof>()
  const [secret, setSecret] = useState('')

  useEffect(() => {
    refreshNftListing()
    const interval = setInterval(() => {
      refreshNftListing()
    }, 5000)
    return () => clearInterval(interval)
  }, [refreshNftListing])

  function resetSemaphoreId() {
    setSemaphoreId(undefined)
    setSecret('')
  }
  if (isConnected && address && chain) {
    return (
      <div>
        <NextSeo title="Buy NFT" />

        <HeadingComponent as="h2">Buy NFT</HeadingComponent>

        <SemaphoreIdentityVerify
          semaphoreId={semaphoreId}
          setSemaphoreId={setSemaphoreId}
          setFullProof={setFullProof}
          secret={secret}
          setSecret={setSecret}
        />

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
            Listed: {
              renderButton:
                fullProof && isAddress(recipient)
                  ? (nft, chain) => (
                      <BuyNFT
                        nft={nft}
                        chain={chain}
                        fullProof={fullProof}
                        resetSemaphoreId={resetSemaphoreId}
                        recipient={recipient}
                        setRecipient={setRecipient}
                      />
                    )
                  : () => <Button disabled={true}>Please generate proof and input recipient</Button>,
            },
          }}
          chain={chain}
          identity={semaphoreId}
        />
      </div>
    )
  }

  return <div>Connect your wallet first to deposit ETH.</div>
}
