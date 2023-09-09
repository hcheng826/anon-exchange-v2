import { Button } from '@chakra-ui/react'
import { simpleNftABI } from 'abis'
import { NftListing, NftStatus } from 'context/AnonExchangeContext'
import { Address, useAccount, useContractRead } from 'wagmi'

interface ListNftSoldProps {
  nft: NftListing
  updateNftStatus: (nft: NftListing, newStatus: NftStatus) => void
}

export function ListNftSold({ nft, updateNftStatus }: ListNftSoldProps) {
  const { address } = useAccount()

  const { data: ownerOfImportNft } = useContractRead({
    address: nft.contractAddress as Address,
    abi: simpleNftABI,
    functionName: 'ownerOf',
    args: [BigInt(nft.tokenId)],
    watch: true,
  })

  if (ownerOfImportNft === address) {
    updateNftStatus(nft, 'NotListed')
  }

  return <Button disabled={true}>Sold</Button>
}
