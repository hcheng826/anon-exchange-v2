import { Button } from '@chakra-ui/react'
import { simple721ABI } from 'abis'
import { Listing, ListingStatus } from 'context/AnonExchangeContext'
import { Address, useAccount, useContractRead } from 'wagmi'

interface ListNftSoldProps {
  listing: Listing
  updateListingStatus: (listing: Listing, newStatus: ListingStatus) => void
}

export function ListNftSold({ listing, updateListingStatus }: ListNftSoldProps) {
  const { address } = useAccount()

  const { data: ownerOfImportNft } = useContractRead({
    address: listing.contractAddress as Address,
    abi: simple721ABI,
    functionName: 'ownerOf',
    args: [BigInt(listing.tokenId || 0)],
    watch: true,
  })

  if (ownerOfImportNft === address) {
    updateListingStatus(listing, 'NotListed')
  }

  return <Button disabled={true}>Sold</Button>
}
