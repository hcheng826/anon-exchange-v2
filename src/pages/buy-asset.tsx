import { Button, Text, Heading, Select } from '@chakra-ui/react'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import { RecipientAdressInput } from 'components/layout/RecipientAdressInput'
import { HeadingComponent } from 'components/layout/HeadingComponent'
import { Identity } from '@semaphore-protocol/identity'
import { Listing, Signal } from 'context/AnonExchangeContext'
import { SemaphoreIdentityVerify } from 'components/SemaphoreIdentityVerify'
import useAnonExchange from 'hooks/useAnonExchange'
import { FullProof } from '@semaphore-protocol/proof'
import { Buy } from 'components/BuyButton'
import { isAddress } from 'viem'
import { Listings } from 'components/Listings'
import { Chain, mantleTestnet, polygonZkEvm, scrollSepolia, sepolia } from '@wagmi/chains'
import { ChainDropdown } from 'components/ChainSelectionDropDown'

export default function BuyNft() {
  const [recipient, setRecipient] = useState<string>('')
  const [semaphoreId, setSemaphoreId] = useState<Identity>()
  const [fullProof, setFullProof] = useState<FullProof>()
  const [secret, setSecret] = useState('')
  const [listings, setListings] = useState<Listing[]>([])
  const [chain, setChain] = useState<Chain>()
  const { refreshListing } = useAnonExchange(chain)

  function updateNfts() {
    refreshListing().then((listings) => {
      setListings(listings)
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
      <NextSeo title="Buy Asset" />
      <HeadingComponent as="h2">Buy Asset</HeadingComponent>
      <Text>{"Note that you don't need to connect a wallet to perform operations on this page"}</Text>

      <ChainDropdown chain={chain} setChain={setChain} />
      {chain && (
        <>
          <SemaphoreIdentityVerify
            semaphoreId={semaphoreId}
            setSemaphoreId={setSemaphoreId}
            setFullProof={setFullProof}
            secret={secret}
            setSecret={setSecret}
            signal={Signal.BUYER_BUY_AND_CLAIM_NFT}
            chain={chain}
          />
          <RecipientAdressInput {...{ recipient, setRecipient }} />
          <Heading as="h2" fontSize="2xl" my={4}>
            Buy Asset
          </Heading>
          <Heading as="h2" fontSize="1xl" my={4}>
            Listings
          </Heading>
          <Listings
            assets={listings}
            statusAction={{
              NotListed: { renderButton: () => <Button disabled={true}>Not listed</Button> },
              Sold: { renderButton: () => <Button disabled={true}>Sold</Button> },
              Delisted: { renderButton: () => <Button disabled={true}>Delisted</Button> },
              Listed: {
                renderButton:
                  fullProof && isAddress(recipient)
                    ? (listing, chain) => (
                        <Buy
                          listing={listing}
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
            chain={chain}
            identity={semaphoreId}
          />
        </>
      )}
    </div>
  )
}
