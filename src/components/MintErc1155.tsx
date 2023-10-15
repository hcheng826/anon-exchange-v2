import { useContractWrite, usePrepareContractWrite, useWaitForTransaction, Address, Chain, useContractRead } from 'wagmi'
import { Alert, AlertDescription, AlertIcon, AlertTitle, Button, Link, Text, Toast, useToast } from '@chakra-ui/react'
import { simple1155Address, simple1155ABI } from 'abis'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Listing } from 'context/AnonExchangeContext'
import { ethers } from 'ethers'
import { Input, FormControl } from '@chakra-ui/react'

export function MintErc1155({ address, chain, setListings }: { address: Address; chain: Chain; setListings: Dispatch<SetStateAction<Listing[]>> }) {
  const toast = useToast()
  const amount = ethers.utils.parseEther('100').toBigInt()
  const [inputId, setInputId] = useState<string>('')

  const prepare1155SafeMintWrite = usePrepareContractWrite({
    address: simple1155Address[chain.id as keyof typeof simple1155Address],
    abi: simple1155ABI,
    functionName: 'safeMint',
    args: [address, BigInt(inputId), amount],
  })

  const erc1155safeMintWrite = useContractWrite(prepare1155SafeMintWrite.config)
  const waitForTransaction = useWaitForTransaction({ hash: erc1155safeMintWrite.data?.hash })

  const handleSendTransation = () => {
    erc1155safeMintWrite.write?.()
  }

  useEffect(() => {
    if (waitForTransaction.isSuccess) {
      toast({ description: 'Successfully Minted!' })
      setListings((prevListings) => [
        ...prevListings,
        {
          listingType: 'ERC1155',
          lister: address,
          amount: Number(amount),
          tokenId: parseInt(inputId),
          contractAddress: simple1155Address[chain.id as keyof typeof simple1155Address],
          status: 'NotListed',
        },
      ])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, amount, chain.id, setListings, toast, waitForTransaction.isSuccess])

  return (
    <div>
      {!erc1155safeMintWrite.write}
      <FormControl mt={4}>
        <Input type="number" placeholder="Enter ERC1155 index to mint" value={inputId} onChange={(e) => setInputId(e.target.value)} />
      </FormControl>

      <Button
        width="full"
        disabled={waitForTransaction.isLoading || erc1155safeMintWrite.isLoading || !erc1155safeMintWrite.write}
        isLoading={waitForTransaction.isLoading}
        mt={4}
        onClick={handleSendTransation}>
        {waitForTransaction.isLoading ? 'Minting...' : erc1155safeMintWrite.isLoading ? 'Check your wallet' : 'Mint 100 Test ERC1155'}
      </Button>
      {waitForTransaction.isSuccess && (
        <Alert status="success" mt={2}>
          <AlertIcon />
          <AlertTitle>Successfully Minted ERC1155!</AlertTitle>
          <AlertDescription>
            <Text>
              <Link href={`${chain?.blockExplorers?.default.url}/tx/${erc1155safeMintWrite.data?.hash}`} isExternal>
                Check on block explorer
              </Link>
            </Text>
          </AlertDescription>
        </Alert>
      )}
      {waitForTransaction.isError && (
        <Alert status="error" mt={2}>
          <AlertIcon />
          <AlertTitle>Error minting ERC1155</AlertTitle>
          <AlertDescription>
            <Text>{waitForTransaction.error?.message}</Text>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
