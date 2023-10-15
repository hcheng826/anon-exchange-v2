import { useContractWrite, usePrepareContractWrite, useWaitForTransaction, Address, Chain, useContractRead } from 'wagmi'
import { Alert, AlertDescription, AlertIcon, AlertTitle, Button, Link, Text, Toast, useToast } from '@chakra-ui/react'
import { simple20Address, simple20ABI } from 'abis'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Listing } from 'context/AnonExchangeContext'
import { ethers } from 'ethers'

export function MintErc20({ address, chain, setListings }: { address: Address; chain: Chain; setListings: Dispatch<SetStateAction<Listing[]>> }) {
  const toast = useToast()
  const amount = ethers.utils.parseEther('100').toBigInt()

  const prepare20SafeMintWrite = usePrepareContractWrite({
    address: simple20Address[chain.id as keyof typeof simple20Address],
    abi: simple20ABI,
    functionName: 'safeMint',
    args: [address, amount],
  })

  const erc20safeMintWrite = useContractWrite(prepare20SafeMintWrite.config)
  const waitForTransaction = useWaitForTransaction({ hash: erc20safeMintWrite.data?.hash })

  const handleSendTransation = () => {
    erc20safeMintWrite.write?.()
  }

  useEffect(() => {
    if (waitForTransaction.isSuccess) {
      toast({ description: 'Successfully Minted!' })
      setListings((prevListings) => [
        ...prevListings,
        {
          listingType: 'ERC20',
          lister: address,
          amount: Number(amount),
          contractAddress: simple20Address[chain.id as keyof typeof simple20Address],
          status: 'NotListed',
        },
      ])
    }
  }, [address, amount, chain.id, setListings, toast, waitForTransaction.isSuccess])

  return (
    <div>
      {!erc20safeMintWrite.write && <p>Please connect to supported network</p>}
      <Button
        width="full"
        disabled={waitForTransaction.isLoading || erc20safeMintWrite.isLoading || !erc20safeMintWrite.write}
        isLoading={waitForTransaction.isLoading}
        mt={4}
        onClick={handleSendTransation}>
        {waitForTransaction.isLoading ? 'Minting...' : erc20safeMintWrite.isLoading ? 'Check your wallet' : 'Mint 100 Test ERC20'}
      </Button>
      {waitForTransaction.isSuccess && (
        <Alert status="success" mt={2}>
          <AlertIcon />
          <AlertTitle>Successfully Minted ERC20!</AlertTitle>
          <AlertDescription>
            <Text>
              <Link href={`${chain?.blockExplorers?.default.url}/tx/${erc20safeMintWrite.data?.hash}`} isExternal>
                Check on block explorer
              </Link>
            </Text>
          </AlertDescription>
        </Alert>
      )}
      {waitForTransaction.isError && (
        <Alert status="error" mt={2}>
          <AlertIcon />
          <AlertTitle>Error minting ERC20</AlertTitle>
          <AlertDescription>
            <Text>{waitForTransaction.error?.message}</Text>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
