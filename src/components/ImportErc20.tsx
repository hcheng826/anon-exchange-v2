import { Button, Heading, Flex, Input, InputGroup, InputLeftAddon, useToast, Stack } from '@chakra-ui/react'
import { simple20ABI } from 'abis'
import { Listing, ListingType } from 'context/AnonExchangeContext'
import { ethers } from 'ethers'
import { Dispatch, SetStateAction } from 'react'
import { Address, isAddress } from 'viem'
import { useContractRead } from 'wagmi'

export function ImportErc20({
  contractAddressInput,
  setContractAddressInput,
  listings,
  setListings,
  address,
}: {
  contractAddressInput: string
  setContractAddressInput: Dispatch<SetStateAction<string>>
  listings: Listing[]
  setListings: Dispatch<SetStateAction<Listing[]>>
  address: `0x${string}` | undefined
}) {
  const { data: balance } = useContractRead({
    address: contractAddressInput as Address,
    abi: simple20ABI,
    functionName: 'balanceOf',
    args: [address || ethers.constants.AddressZero],
    watch: true,
    onError: () => {
      toast({
        description: 'Invalid ERC20 address',
        status: 'error',
      })
    },
  })

  const { data: decimals } = useContractRead({
    address: contractAddressInput as Address,
    abi: simple20ABI,
    functionName: 'decimals',
    watch: true,
    onError: () => {
      toast({
        description: 'Invalid ERC20 address',
        status: 'error',
      })
    },
  })

  const toast = useToast()

  const handleImport = () => {
    if (!contractAddressInput || !isAddress(contractAddressInput)) {
      toast({
        description: 'Invalid input',
        status: 'error',
      })
      return
    }

    // if (
    //   listings
    //     .filter((listing) => listing.listingType === ListingType.ERC20)
    //     .map((listing) => {
    //       return listing.contractAddress
    //     })
    //     .includes(contractAddressInput)
    // ) {
    //   toast({
    //     description: 'Already imported',
    //   })
    //   return
    // }

    if (balance && balance > 0) {
      setListings((prevListings) => [
        ...prevListings,
        {
          listingType: ListingType.ERC20,
          amount: Number(balance / BigInt(10 ** Number(decimals))),
          contractAddress: contractAddressInput,
          status: 'NotListed', // default action
        },
      ])
    } else {
      toast({
        description: 'Not owner of the NFT',
        status: 'error',
      })
    }
  }

  return (
    <div>
      <Heading as="h2" fontSize="1xl" my={4}>
        ERC20
      </Heading>

      <Stack spacing={4} mb={4} align="center">
        <InputGroup size="md">
          <Input placeholder="contract addr: 0x12345...6789" value={contractAddressInput} onChange={(e) => setContractAddressInput(e.target.value)} />
        </InputGroup>

        <Button onClick={handleImport} w={'100%'}>
          Import
        </Button>
      </Stack>
    </div>
  )
}
