import { sepolia } from 'wagmi'
import { Button, Text, Heading } from '@chakra-ui/react'
import { NextSeo } from 'next-seo'
import { NftList } from 'components/NftList'
import { useEffect, useState } from 'react'
import { RecipientAdressInput } from 'components/layout/RecipientAdressInput'
import { HeadingComponent } from 'components/layout/HeadingComponent'
import { Identity } from '@semaphore-protocol/identity'
import { NftListing, Signal } from 'context/AnonExchangeContext'
import { SemaphoreIdentityVerify } from 'components/SemaphoreIdentityVerify'
import useAnonExchange from 'hooks/useAnonExchange'
import { FullProof } from '@semaphore-protocol/proof'
import { BuyNFT } from 'components/BuyNftButton'
import { isAddress } from 'viem'
import { localhost } from 'viem/chains'

export default function BuyNft() {
  const { refreshNftListing } = useAnonExchange()

  const [recipient, setRecipient] = useState<string>('')
  const [semaphoreId, setSemaphoreId] = useState<Identity>()
  const [fullProof, setFullProof] = useState<FullProof>()
  const [secret, setSecret] = useState('')
  const [nfts, setNfts] = useState<NftListing[]>([])

  function updateNfts() {
    refreshNftListing().then((nftListings) => {
      setNfts(nftListings)
    })
  }

  useEffect(() => {
    updateNfts()

    const interval = setInterval(() => {
      updateNfts()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  function resetSemaphoreId() {
    setSemaphoreId(undefined)
    setSecret('')
  }

  return (
    <div>
      <NextSeo title="Buy NFT" />
      <HeadingComponent as="h2">Buy NFT</HeadingComponent>
      <Text>{"Note that you don't need to connect a wallet to perform operations on this page"}</Text>
      <SemaphoreIdentityVerify
        semaphoreId={semaphoreId}
        setSemaphoreId={setSemaphoreId}
        setFullProof={setFullProof}
        secret={secret}
        setSecret={setSecret}
        signal={Signal.BUYER_BUY_AND_CLAIM_NFT}
      />
      <RecipientAdressInput {...{ recipient, setRecipient }} />
      <Heading as="h2" fontSize="2xl" my={4}>
        Buy NFT
      </Heading>
      <Heading as="h2" fontSize="1xl" my={4}>
        NFT Listings
      </Heading>
      <NftList
        nfts={nfts}
        statusAction={{
          NotListed: { renderButton: () => <Button disabled={true}>Not listed</Button> },
          Sold: { renderButton: () => <Button disabled={true}>Sold</Button> },
          Delisted: { renderButton: () => <Button disabled={true}>Delisted</Button> },
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
                      updateNfts={updateNfts}
                    />
                  )
                : () => <Button disabled={true}>Please generate proof and input recipient</Button>,
          },
        }}
        chain={process.env.NEXT_PUBLIC_USE_LOCALHOST ? localhost : sepolia}
        identity={semaphoreId}
      />
    </div>
  )
}
