import { Button, Heading, Flex, Input, InputGroup, InputLeftAddon, useToast } from '@chakra-ui/react'
import { simpleNftABI } from 'abis'
import { NftListing } from 'context/AnonExchangeContext'
import { Dispatch, SetStateAction } from 'react'
import { Address, isAddress } from 'viem'
import { useContractRead } from 'wagmi'

export function ImportNft({
  contractAddressInput,
  setContractAddressInput,
  tokenIdInput,
  setTokenIdInput,
  nfts,
  setNfts,
  address,
}: {
  contractAddressInput: string
  setContractAddressInput: Dispatch<SetStateAction<string>>
  tokenIdInput: number | null
  setTokenIdInput: Dispatch<SetStateAction<number | null>>
  nfts: NftListing[]
  setNfts: Dispatch<SetStateAction<NftListing[]>>
  address: `0x${string}` | undefined
}) {
  const { data: ownerOfImportNft } = useContractRead({
    address: contractAddressInput as Address,
    abi: simpleNftABI,
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
    if (!contractAddressInput || tokenIdInput === null || !isAddress(contractAddressInput)) {
      toast({
        description: 'Invalid input',
        status: 'error',
      })
      setTokenIdInput(null)
      return
    }

    if (
      nfts
        .map((nft) => {
          return nft.contractAddress
        })
        .includes(contractAddressInput) &&
      nfts
        .map((nft) => {
          return nft.tokenId
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
      setNfts((prevNfts) => [
        ...prevNfts,
        {
          contractAddress: contractAddressInput,
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
        Import your own NFT
      </Heading>

      <Flex mb={4} align="center">
        <InputGroup size="md" mr={2}>
          <InputLeftAddon>NFT Address</InputLeftAddon>
          <Input placeholder="0x12345...6789" value={contractAddressInput} onChange={(e) => setContractAddressInput(e.target.value)} />
        </InputGroup>

        <InputGroup size="md" mr={2}>
          <InputLeftAddon>Token ID</InputLeftAddon>
          <Input placeholder="Enter Token ID" type="number" value={tokenIdInput ?? ''} onChange={(e) => setTokenIdInput(Number(e.target.value))} />
        </InputGroup>

        {/* TODO: validate the input format and user owns the NFT */}
        <Button onClick={handleImport}>Import</Button>
      </Flex>
    </div>
  )
}
