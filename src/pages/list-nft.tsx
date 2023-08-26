import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction, useNetwork, Address, Chain } from 'wagmi'
import { Button, Heading, Text, Flex, Input, Table, Thead, Tr, Th, Tbody, Td, InputGroup, InputLeftAddon } from '@chakra-ui/react'
import { NextSeo } from 'next-seo'
import { LinkComponent } from 'components/layout/LinkComponent'
import { simpleNftABI, simpleNftAddress } from 'abis'
import { useState } from 'react'
import { NftList, NftListItem } from 'components/layout/NftList'

function MintNFT({ address, chain }: { address: Address; chain: Chain }) {
  const prepareContractWrite = usePrepareContractWrite({
    address: simpleNftAddress[chain.id as keyof typeof simpleNftAddress],
    abi: simpleNftABI,
    functionName: 'safeMint',
    args: [address],
  })

  const contractWrite = useContractWrite(prepareContractWrite.config)
  const waitForTransaction = useWaitForTransaction({ hash: contractWrite.data?.hash })

  const handleSendTransation = () => {
    contractWrite.write?.()
  }

  return (
    <div>
      {!contractWrite.write && <p>Please connect to Sepolia testnet</p>}
      <Button
        width="full"
        disabled={waitForTransaction.isLoading || contractWrite.isLoading || !contractWrite.write}
        mt={4}
        onClick={handleSendTransation}>
        {waitForTransaction.isLoading ? 'Minting NFT...' : contractWrite.isLoading ? 'Check your wallet' : 'Mint Test NFT'}
      </Button>
      {waitForTransaction.isSuccess && (
        <div>
          <Text mt={2} fontSize="lg">
            Successfully Minted NFT!
          </Text>
          <Text fontSize="lg" fontWeight="bold">
            <LinkComponent href={`${chain?.blockExplorers?.default.url}/tx/${contractWrite.data?.hash}`}>Check on block explorer</LinkComponent>
          </Text>
        </div>
      )}
      {waitForTransaction.isError && (
        <div>
          <Text mt={2} color="red" fontSize="lg">
            Error minting NFT
          </Text>
          <Text color="red" fontSize="lg" fontWeight="bold">
            {waitForTransaction.error?.message}
          </Text>
        </div>
      )}
    </div>
  )
}

export default function ListNft() {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()

  // TODO: initialize NFT list by useAnonExchange
  const [nfts, setNfts] = useState<NftListItem[]>([])

  const [contractAddressInput, setContractAddressInput] = useState<string>('')
  const [tokenIdInput, setTokenIdInput] = useState<number | null>(null)
  const [secret, setSecret] = useState('')

  const handleImport = () => {
    if (contractAddressInput && tokenIdInput !== null) {
      setNfts((prevNfts) => [
        ...prevNfts,
        {
          contractAddress: contractAddressInput,
          tokenId: tokenIdInput,
          action: 'List NFT', // default action
        },
      ])

      // Optionally, clear the input fields
      setContractAddressInput('')
      setTokenIdInput(null)
    }
  }

  if (isConnected && address && chain) {
    return (
      <div>
        <NextSeo title="Mint NFT" />

        <Heading as="h2" fontSize="2xl" my={4}>
          Mint Test NFT
        </Heading>
        {/* TODO: pass in nfts array and add to the list when mint NFT is successful */}
        <MintNFT address={address} chain={chain} />

        <Heading as="h2" fontSize="2xl" my={4}>
          Semaphore Identity
        </Heading>

        <Text>Input a secret message to generate Semaphore Identity</Text>
        <Input type="text" placeholder="Enter your secret message..." value={secret} onChange={(e) => setSecret(e.target.value)} />
        <Text>
          Note:
          <br /> 1. Each secret message is associated with 1 NFT listing. Do not reuse same value.
          <br /> 2. The secret message is needed when you are claiming the ETH after NFT is sold. Keep it private and do not lose it.
        </Text>

        <Heading as="h2" fontSize="2xl" my={4}>
          NFT List
        </Heading>

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
        <NftList nfts={nfts} />
      </div>
    )
  }

  return <div>Connect your wallet first to mint test NFT.</div>
}
