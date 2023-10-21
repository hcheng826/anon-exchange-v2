import { useContractWrite, usePrepareContractWrite, useWaitForTransaction, Address, Chain, useContractRead } from 'wagmi'
import { Alert, AlertDescription, AlertIcon, AlertTitle, Button, Link, Text, Toast, useToast } from '@chakra-ui/react'
import { simpleNftABI, simple721Address } from 'abis'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Listing, ListingType } from 'context/AnonExchangeContext'
import { ApproveAllNFT } from './ApproveAllNftButton'

export function MintErc721({ address, chain, setListings }: { address: Address; chain: Chain; setListings: Dispatch<SetStateAction<Listing[]>> }) {
  const toast = useToast()

  const { refetch: tokenIdRefetch } = useContractRead({
    address: simple721Address[chain?.id as keyof typeof simple721Address],
    abi: simpleNftABI,
    functionName: '_tokenIdCounter',
    watch: true,
  })

  const prepareSafeMintWrite = usePrepareContractWrite({
    address: simple721Address[chain.id as keyof typeof simple721Address],
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
      toast({ description: 'Successfully Minted NFT!' })
      tokenIdRefetch().then(({ data: tokenId }) => {
        setListings((prevListings) => [
          ...prevListings,
          {
            listingType: ListingType.ERC721,
            lister: address,
            amount: 1,
            contractAddress: simple721Address[chain.id as keyof typeof simple721Address],
            tokenId: Number(tokenId) - 1,
            status: 'NotListed',
          },
        ])
      })
    }
  }, [address, chain.id, setListings, toast, tokenIdRefetch, waitForTransaction.isSuccess])

  console.log('safeMintWrite', safeMintWrite)

  return (
    <div>
      {!safeMintWrite.write && <p>Please connect to supported network</p>}
      <Button
        width="full"
        disabled={waitForTransaction.isLoading || safeMintWrite.isLoading || !safeMintWrite.write}
        isLoading={waitForTransaction.isLoading}
        mt={4}
        onClick={handleSendTransation}>
        {waitForTransaction.isLoading ? 'Minting NFT...' : safeMintWrite.isLoading ? 'Check your wallet' : 'Mint Test NFT'}
      </Button>
      {waitForTransaction.isSuccess && (
        <Alert status="success" mt={2}>
          <AlertIcon />
          <AlertTitle>Successfully Minted NFT!</AlertTitle>
          <AlertDescription>
            <Text>
              <Link href={`${chain?.blockExplorers?.default.url}/tx/${safeMintWrite.data?.hash}`} isExternal>
                Check on block explorer
              </Link>
            </Text>
          </AlertDescription>
        </Alert>
      )}
      {waitForTransaction.isError && (
        <Alert status="error" mt={2}>
          <AlertIcon />
          <AlertTitle>Error minting NFT</AlertTitle>
          <AlertDescription>
            <Text>{waitForTransaction.error?.message}</Text>
          </AlertDescription>
        </Alert>
      )}
      <ApproveAllNFT chain={chain} />
    </div>
  )
}
