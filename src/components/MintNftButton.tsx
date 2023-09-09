import { useContractWrite, usePrepareContractWrite, useWaitForTransaction, Address, Chain, useContractRead } from 'wagmi'
import { Alert, AlertDescription, AlertIcon, AlertTitle, Button, Link, Text, Toast, useToast } from '@chakra-ui/react'
import { LinkComponent } from 'components/layout/LinkComponent'
import { simpleNftABI, simpleNftAddress } from 'abis'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { NftListing } from 'context/AnonExchangeContext'

export function MintNFT({ address, chain, setNfts }: { address: Address; chain: Chain; setNfts: Dispatch<SetStateAction<NftListing[]>> }) {
  const toast = useToast()

  const { refetch: tokenIdRefetch } = useContractRead({
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
      toast({ description: 'Successfully Minted NFT!' })
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
  }, [chain.id, setNfts, toast, tokenIdRefetch, waitForTransaction.isSuccess])

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
    </div>
  )
}
