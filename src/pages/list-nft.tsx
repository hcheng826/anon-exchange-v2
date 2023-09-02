import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
  useNetwork,
  Address,
  Chain,
  useContractRead,
  useContractEvent,
} from 'wagmi'
import { Button, Heading, Text, Flex, Input, Table, Thead, Tr, Th, Tbody, Td, InputGroup, InputLeftAddon, list, useToast } from '@chakra-ui/react'
import { NextSeo } from 'next-seo'
import { LinkComponent } from 'components/layout/LinkComponent'
import { anonExchangeABI, anonExchangeAddress, simpleNftABI, simpleNftAddress } from 'abis'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { NftList } from 'components/NftList'
import { SemaphoreIdentitySecretInput } from 'components/SemaphoreIdentitySecretInput'
import { HeadingComponent } from 'components/layout/HeadingComponent'
import useAnonExchange from 'hooks/useAnonExchange'
import { NftListing } from 'context/AnonExchangeContext'
import { isAddress } from 'viem'
import { Identity } from '@semaphore-protocol/identity'
import { MintNFT } from 'components/MintNftButton'
import { ImportNft } from 'components/ImportNftButton'
import { ListNFT } from 'components/ListNftButton'

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

  if (isConnected && address && chain) {
    return (
      <div>
        <NextSeo title="Mint NFT" />

        <HeadingComponent as="h2">List NFT</HeadingComponent>

        <Heading as="h2" fontSize="2xl" my={4}>
          Mint Test NFT
        </Heading>
        <MintNFT address={address} chain={chain} setNfts={setNfts} />

        <SemaphoreIdentitySecretInput semaphoreId={semaphoreId} setSemaphoreId={setSemaphoreId} />

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
            NotListed: { renderButton: (nft, chain, identity) => <ListNFT nft={nft} chain={chain} identity={identity} /> },
            Sold: {},
            Delisted: { renderButton: (nft, chain, identity) => <ListNFT nft={nft} chain={chain} identity={identity} /> },
            Listed: {},
          }}
          chain={chain}
          identity={semaphoreId}
        />
      </div>
    )
  }

  return <div>Connect your wallet first to mint test NFT.</div>
}
