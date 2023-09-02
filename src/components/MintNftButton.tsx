import { useContractWrite, usePrepareContractWrite, useWaitForTransaction, Address, Chain, useContractRead } from 'wagmi'
import { Button, Text } from '@chakra-ui/react'
import { LinkComponent } from 'components/layout/LinkComponent'
import { simpleNftABI, simpleNftAddress } from 'abis'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { NftListing } from 'context/AnonExchangeContext'

export function MintNFT({ address, chain, setNfts }: { address: Address; chain: Chain; setNfts: Dispatch<SetStateAction<NftListing[]>> }) {
  const { data: simpleNftTokenIdCounter, refetch: tokenIdRefetch } = useContractRead({
    address: simpleNftAddress[chain?.id as keyof typeof simpleNftAddress],
    abi: simpleNftABI,
    functionName: '_tokenIdCounter',
    watch: true,
  })

  const prepareSafeMintWrite = usePrepareContractWrite({
    address: simpleNftAddress[chain.id as keyof typeof simpleNftAddress],
    abi: simpleNftABI,
    functionName: 'safeMint',
    args: [address],
  })

  const safeMintWrite = useContractWrite(prepareSafeMintWrite.config)
  const waitForTransaction = useWaitForTransaction({ hash: safeMintWrite.data?.hash })

  const handleSendTransation = () => {
    safeMintWrite.write?.()
  }

  useEffect(() => {
    if (waitForTransaction.isSuccess) {
      tokenIdRefetch().then(({ data: tokenId }) => {
        setNfts((prevNfts) => [
          ...prevNfts,
          {
            contractAddress: simpleNftAddress[chain.id as keyof typeof simpleNftAddress],
            tokenId: Number(tokenId) - 1,
            status: 'NotListed',
          },
        ])
      })
    }
  }, [chain.id, setNfts, tokenIdRefetch, waitForTransaction.isSuccess])

  return (
    <div>
      {!safeMintWrite.write && <p>Please connect to Sepolia testnet</p>}
      <Button
        width="full"
        disabled={waitForTransaction.isLoading || safeMintWrite.isLoading || !safeMintWrite.write}
        isLoading={waitForTransaction.isLoading}
        mt={4}
        onClick={handleSendTransation}>
        {waitForTransaction.isLoading ? 'Minting NFT...' : safeMintWrite.isLoading ? 'Check your wallet' : 'Mint Test NFT'}
      </Button>
      {waitForTransaction.isSuccess && (
        <div>
          <Text mt={2} fontSize="lg">
            Successfully Minted NFT!
          </Text>
          <Text fontSize="lg" fontWeight="bold">
            <LinkComponent href={`${chain?.blockExplorers?.default.url}/tx/${safeMintWrite.data?.hash}`}>Check on block explorer</LinkComponent>
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
