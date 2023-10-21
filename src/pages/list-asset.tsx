import { Address, useAccount, useNetwork } from 'wagmi'
import { Box, Button, Flex, Heading } from '@chakra-ui/react'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import { SemaphoreIdentityGenerate } from 'components/SemaphoreIdentityGenerate'
import { HeadingComponent } from 'components/layout/HeadingComponent'
import { Listing, ListingStatus } from 'context/AnonExchangeContext'
import { Identity } from '@semaphore-protocol/identity'
import { MintErc721 } from 'components/MintErc721'
import { ImportNft } from 'components/ImportNft'
import { List } from 'components/ListButton'
import { v4 as uuidv4 } from 'uuid'
import useAnonExchange from 'hooks/useAnonExchange'
import { ethers } from 'ethers'
import { simple721ABI } from 'abis'
import { supportedChains } from 'utils/config'
import { MintErc20 } from 'components/MintErc20'
import { Listings } from 'components/Listings'
import { ImportErc20 } from 'components/ImportErc20'
import { Delist } from 'components/DelistButton'

export default function ListPage() {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()

  const [contractErc20AddressInput, setContractErc20AddressInput] = useState<string>('')
  const [contractErc721AddressInput, setContractErc721AddressInput] = useState<string>('')
  const [tokenIdInput, setTokenIdInput] = useState<number | null>(null)
  const [erc20ImportAmoutInput, setErc20ImportAmoutInput] = useState<number | null>(null)
  const [semaphoreId, setSemaphoreId] = useState<Identity>()
  const [secret, setSecret] = useState(uuidv4())
  const { refreshListing } = useAnonExchange(chain)

  const [listings, setListings] = useState<Listing[]>([])

  useEffect(() => {
    const fetchAndSetListings = async () => {
      const refreshedListings = await refreshListing()

      const updatedListings = refreshedListings
        .filter((listing) => listing.lister === address)
        .map((listing) => {
          return listing
        })

      const updateListingsPromises = updatedListings.map((updatedListing) => {
        if (updatedListing.status === 'Sold') {
          const nftContract = new ethers.Contract(
            updatedListing.contractAddress,
            simple721ABI,
            new ethers.providers.JsonRpcProvider(chain?.rpcUrls.default.http[0])
          )
          return nftContract.ownerOf(updatedListing.tokenId).then((owner: Address) => {
            if (owner === address) {
              updatedListing.status = 'NotListed'
            }
            return updatedListing
          })
        } else {
          return Promise.resolve(updatedListing)
        }
      })

      Promise.all(updateListingsPromises).then((resolvedListings) => {
        setListings((prevListings) => {
          const newListingsArray = [...prevListings]

          resolvedListings.forEach((listing) => {
            const idx = newListingsArray.findIndex(
              (currentListing) => currentListing.contractAddress === listing.contractAddress && currentListing.tokenId === listing.tokenId
            )
            if (idx !== -1) {
              newListingsArray[idx] = listing
            } else {
              newListingsArray.push(listing)
            }
          })

          return newListingsArray
        })
      })
    }

    fetchAndSetListings() // Call once immediately when component mounts

    const intervalId = setInterval(fetchAndSetListings, 5000)

    return () => clearInterval(intervalId) // Cleanup interval when component unmounts
  }, [address, refreshListing, chain])

  function refreshSecret() {
    setSecret(uuidv4())
  }

  function updateListingStatus(nftToUpdate: Listing, newStatus: ListingStatus) {
    setListings((currentListings) =>
      currentListings.map((listing) => {
        if (nftToUpdate.tokenId === listing.tokenId && nftToUpdate.contractAddress === listing.contractAddress) {
          return { ...listing, status: newStatus }
        }
        return listing
      })
    )
  }

  if (isConnected && address && chain && supportedChains.map((chain) => chain.id as number).includes(chain.id)) {
    return (
      <div>
        <NextSeo title="List Asset" />

        <HeadingComponent as="h2">List Asset</HeadingComponent>

        <Heading as="h2" fontSize="2xl" my={4}>
          Mint Test Asset
        </Heading>
        <Flex gap={4} alignItems={'stretch'} w="100%">
          <Box flex="1" px="2">
            <MintErc20 address={address} chain={chain} setListings={setListings} />
          </Box>
          <Box flex="1" px="2">
            <MintErc721 address={address} chain={chain} setListings={setListings} />
          </Box>
          {/* <Box flex="1" px="2">
            <MintErc1155 address={address} chain={chain} setListings={setListings} />
          </Box> */}
        </Flex>

        <SemaphoreIdentityGenerate semaphoreId={semaphoreId} setSemaphoreId={setSemaphoreId} secret={secret} refreshSecret={refreshSecret} />

        <Heading as="h2" fontSize="2xl" my={4}>
          Asset List
        </Heading>

        <Flex gap={4} alignItems={'stretch'} w="100%">
          <Box flex="1" px="2">
            <ImportErc20
              {...{
                contractErc20AddressInput,
                setContractErc20AddressInput,
                erc20ImportAmoutInput,
                setErc20ImportAmoutInput,
                listings,
                setListings,
                address,
              }}
            />
          </Box>
          <Box flex="1" px="2">
            <ImportNft
              {...{
                contractErc721AddressInput,
                setContractErc721AddressInput,
                tokenIdInput,
                setTokenIdInput,
                listings,
                setListings,
                address,
              }}
            />
          </Box>
          {/* <Box flex="1" px="2">
            <ImportErc1155
              {...{
                contractAddressInput,
                setContractAddressInput,
                tokenIdInput,
                setTokenIdInput,
                listings,
                setListings,
                address,
              }}
            />
          </Box> */}
        </Flex>

        <Listings
          assets={listings}
          statusAction={{
            NotListed: {
              renderButton: semaphoreId
                ? (listing, chain) => (
                    <List
                      listing={listing}
                      chain={chain}
                      identity={semaphoreId}
                      updateListingStatus={updateListingStatus}
                      setSemaphoreId={setSemaphoreId}
                      refreshSecret={refreshSecret}
                    />
                  )
                : () => <Button disabled={true}>Please generate Semaphore Id first</Button>,
            },
            Sold: { renderButton: () => <Button disabled={true}>Sold</Button> },
            Delisted: {
              renderButton: semaphoreId
                ? (listing, chain) => (
                    <List
                      listing={listing}
                      chain={chain}
                      identity={semaphoreId}
                      updateListingStatus={updateListingStatus}
                      setSemaphoreId={setSemaphoreId}
                      refreshSecret={refreshSecret}
                    />
                  )
                : () => <Button disabled={true}>Please generate Semaphore Id first</Button>,
            },
            Listed: { renderButton: (listing, chain) => <Delist listing={listing} chain={chain} updateListingStatus={updateListingStatus} /> },
          }}
          chain={chain}
          identity={semaphoreId}
          updateListingStatus={updateListingStatus}
        />
      </div>
    )
  }

  return <div>Connect your wallet to supported chains: {supportedChains.map((chain) => chain.name).join(', ')}.</div>
}
