import { Button, Heading, Flex, Input, InputGroup, InputLeftAddon, useToast, Stack } from '@chakra-ui/react'
import { simple20ABI } from 'abis'
import { Listing, ListingType } from 'context/AnonExchangeContext'
import { ethers } from 'ethers'
import { Dispatch, SetStateAction } from 'react'
import { Address, isAddress } from 'viem'
import { useContractRead } from 'wagmi'

export function ImportErc20({
  contractErc20AddressInput,
  setContractErc20AddressInput,
  erc20ImportAmoutInput,
  setErc20ImportAmoutInput,
  listings,
  setListings,
  address,
}: {
  contractErc20AddressInput: string
  setContractErc20AddressInput: Dispatch<SetStateAction<string>>
  erc20ImportAmoutInput: number | null
  setErc20ImportAmoutInput: Dispatch<SetStateAction<number | null>>
  listings: Listing[]
  setListings: Dispatch<SetStateAction<Listing[]>>
  address: `0x${string}` | undefined
}) {
  const { data: balance } = useContractRead({
    address: contractErc20AddressInput as Address,
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
    address: contractErc20AddressInput as Address,
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
    if (!contractErc20AddressInput || !isAddress(contractErc20AddressInput)) {
      toast({
        description: 'Invalid input',
        status: 'error',
      })
      return
    }

    if (erc20ImportAmoutInput && balance && decimals && erc20ImportAmoutInput <= balance / BigInt(10 ** decimals)) {
      setListings((prevListings) => [
        ...prevListings,
        {
          listingType: ListingType.ERC20,
          amount: erc20ImportAmoutInput * 10 ** decimals,
          contractAddress: contractErc20AddressInput,
          status: 'NotListed', // default action
        },
      ])
    } else {
      toast({
        description: 'Not enough of balance',
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
          <Input
            placeholder="contract addr: 0x12345...6789"
            value={contractErc20AddressInput}
            onChange={(e) => setContractErc20AddressInput(e.target.value)}
          />
        </InputGroup>

        <InputGroup size="md">
          <Input
            placeholder="Enter Import Amout"
            type="number"
            value={erc20ImportAmoutInput ?? ''}
            onChange={(e) => setErc20ImportAmoutInput(Number(e.target.value))}
          />
        </InputGroup>

        <Button onClick={handleImport} w={'100%'}>
          Import
        </Button>
      </Stack>
    </div>
  )
}
