import { Button, Heading, Flex, Input, InputGroup, InputLeftAddon, useToast, Stack } from '@chakra-ui/react'
import { simple721ABI } from 'abis'
import { Listing, ListingType } from 'context/AnonExchangeContext'
import { Dispatch, SetStateAction } from 'react'
import { Address, isAddress } from 'viem'
import { useContractRead } from 'wagmi'

export function ImportNft({
  contractErc721AddressInput,
  setContractErc721AddressInput,
  tokenIdInput,
  setTokenIdInput,
  listings,
  setListings,
  address,
}: {
  contractErc721AddressInput: string
  setContractErc721AddressInput: Dispatch<SetStateAction<string>>
  tokenIdInput: number | null
  setTokenIdInput: Dispatch<SetStateAction<number | null>>
  listings: Listing[]
  setListings: Dispatch<SetStateAction<Listing[]>>
  address: `0x${string}` | undefined
}) {
  const { data: ownerOfImportNft } = useContractRead({
    address: contractErc721AddressInput as Address,
    abi: simple721ABI,
    functionName: 'ownerOf',
    args: [BigInt(tokenIdInput || 0)],
    watch: true,
    onError: () => {
      toast({
        description: 'Invalid NFT address',
        status: 'error',
      })
    },
  })

  const toast = useToast()

  const handleImport = () => {
    if (!contractErc721AddressInput || tokenIdInput === null || !isAddress(contractErc721AddressInput)) {
      toast({
        description: 'Invalid input',
        status: 'error',
      })
      setTokenIdInput(null)
      return
    }

    if (
      listings
        .filter((listing) => listing.listingType === ListingType.ERC721)
        .map((listing) => {
          return listing.contractAddress
        })
        .includes(contractErc721AddressInput) &&
      listings
        .map((listing) => {
          return listing.tokenId
        })
        .includes(tokenIdInput)
    ) {
      toast({
        description: 'Already imported',
      })
      setTokenIdInput(null)
      return
    }

    if (ownerOfImportNft === address) {
      setListings((prevListings) => [
        ...prevListings,
        {
          listingType: ListingType.ERC721,
          amount: 1,
          contractAddress: contractErc721AddressInput,
          tokenId: tokenIdInput,
          status: 'NotListed', // default action
        },
      ])
    } else {
      toast({
        description: 'Not owner of the NFT',
        status: 'error',
      })
    }

    setTokenIdInput(null)
  }

  return (
    <div>
      <Heading as="h2" fontSize="1xl" my={4}>
        NFT
      </Heading>

      <Stack spacing={4} mb={4} align="center">
        <InputGroup size="md">
          <Input
            placeholder="contract addr: 0x12345...6789"
            value={contractErc721AddressInput}
            onChange={(e) => setContractErc721AddressInput(e.target.value)}
          />
        </InputGroup>

        <InputGroup size="md">
          <Input placeholder="Enter Token ID" type="number" value={tokenIdInput ?? ''} onChange={(e) => setTokenIdInput(Number(e.target.value))} />
        </InputGroup>

        <Button onClick={handleImport} w={'100%'}>
          Import
        </Button>
      </Stack>
    </div>
  )
}
