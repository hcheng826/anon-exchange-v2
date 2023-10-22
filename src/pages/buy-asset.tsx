import { Button, Text, Heading, Select, list } from '@chakra-ui/react'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import { RecipientAdressInput } from 'components/layout/RecipientAdressInput'
import { HeadingComponent } from 'components/layout/HeadingComponent'
import { Identity } from '@semaphore-protocol/identity'
import { Listing, ListingType, Signal } from 'context/AnonExchangeContext'
import { SemaphoreIdentityVerify } from 'components/SemaphoreIdentityVerify'
import useAnonExchange from 'hooks/useAnonExchange'
import { FullProof } from '@semaphore-protocol/proof'
import { Buy } from 'components/BuyButton'
import { isAddress } from 'viem'
import { Listings } from 'components/Listings'
import { Chain } from '@wagmi/chains'
import { ChainDropdown } from 'components/ChainSelectionDropDown'
import { useContractInfiniteReads } from 'wagmi'
import { anonExchangeABI, anonExchangeAddress } from 'abis'

export default function BuyAsset() {
  const [recipient, setRecipient] = useState<string>('')
  const [semaphoreId, setSemaphoreId] = useState<Identity>()
  const [fullProof, setFullProof] = useState<FullProof>()
  const [secret, setSecret] = useState('')
  const [listings, setListings] = useState<Listing[]>([])
  const [chain, setChain] = useState<Chain>()
  // const { refreshListing } = useAnonExchange(chain)

  // function updateNfts() {
  //   refreshListing().then((listings) => {
  //     setListings(listings)
  //   })
  // }

  useEffect(() => {
    // updateNfts()

    const interval = setInterval(() => {
      // updateNfts()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  function resetSemaphoreId() {
    setSemaphoreId(undefined)
    setSecret('')
  }

  type ContractConfig = {
    functionName: string
    args: any[]
    address: string
    abi: any[]
  }

  const anonExchangeConfig = {
    address: chain ? anonExchangeAddress[chain.id as keyof typeof anonExchangeAddress] : '0xFFFE3c238718f3a5CfcEDA18AaFFd6203F1FA642',
    abi: anonExchangeABI,
  }

  const { data, fetchNextPage } = useContractInfiniteReads({
    cacheKey: 'listings1',
    contracts(idx = 0) {
      if (!anonExchangeConfig.address) {
        return []
      }

      const args = [idx] as const
      return [
        {
          ...anonExchangeConfig,
          functionName: 'listings',
          args,
        },
      ] as any
    },
    getNextPageParam: (_, pages) => pages.length + 1,
    cacheTime: 0,
  })

  type FetchedListing = [
    number, // 0
    string, // '0xA28B81e10d78a38A9C1D4dD599145355577354f6'
    string, // '0x816D176a7A925D60099AEd94e9ae953928650fcC'
    bigint, // 0n
    bigint, // 1n
    bigint // 17062994139967014471635386600629574665491413753159562336108775123467628692746n
  ]

  useEffect(() => {
    return setListings(
      data?.pages
        ?.map((page, idx) => {
          return { data: page[0], idx }
        })
        .filter((data) => data.data.status === 'success')
        .map((listingFetched) => {
          const listing = listingFetched.data.result as FetchedListing
          return {
            listingType: listing[0],
            lister: listing[1],
            contractAddress: listing[2],
            tokenId: listing[0] === ListingType.ERC20 ? undefined : Number(listing[3]),
            amount: Number(listing[4]),
            listingIdx: listingFetched.idx,
            status: 'Listed',
          }
        }) || []
    )
  }, [data?.pages])

  useEffect(() => {
    if (data?.pages[data?.pages.length - 1][0].status === 'success') {
      fetchNextPage()
    }
  }, [data?.pages, fetchNextPage])

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
                        <Buy listing={listing} chain={chain} fullProof={fullProof} resetSemaphoreId={resetSemaphoreId} recipient={recipient} />
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
