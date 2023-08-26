import { useAccount, useNetwork } from 'wagmi'
import { Heading } from '@chakra-ui/react'
import { NextSeo } from 'next-seo'
import { NftList, NftListItem } from 'components/layout/NftList'
import { useState } from 'react'

export default function BuyNft() {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()

  // TODO: initialize NFT list
  const [nfts, setNfts] = useState<NftListItem[]>([])

  if (isConnected && address && chain) {
    return (
      <div>
        <NextSeo title="Buy NFT" />
        <Heading as="h2" fontSize="2xl" my={4}>
          Buy NFT
        </Heading>

        <Heading as="h2" fontSize="1xl" my={4}>
          NFT Listings
        </Heading>

        <NftList nfts={nfts} />
      </div>
    )
  }

  return <div>Connect your wallet first to deposit ETH.</div>
}
