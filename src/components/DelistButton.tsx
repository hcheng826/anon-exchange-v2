import { useContractWrite, usePrepareContractWrite, useWaitForTransaction, Address, Chain, useContractRead } from 'wagmi'
import { Button, useToast } from '@chakra-ui/react'
import { anonExchangeABI, anonExchangeAddress } from 'abis'
import { Listing, ListingStatus } from 'context/AnonExchangeContext'
import { useEffect } from 'react'

interface DelistProps {
  listing: Listing
  chain: Chain
  updateListingStatus: (listing: Listing, newStatus: ListingStatus) => void
}

export function Delist({ listing, chain, updateListingStatus }: DelistProps) {
  const toast = useToast()

  const prepareDelist = usePrepareContractWrite({
    address: anonExchangeAddress[chain.id as keyof typeof anonExchangeAddress] as Address,
    abi: anonExchangeABI,
    functionName: 'delist',
    args: [BigInt(listing.listingIdx)],
    chainId: chain.id,
  })

  const delistNftWrite = useContractWrite(prepareDelist.config)
  const delistNftWait = useWaitForTransaction({ hash: delistNftWrite.data?.hash })

  useEffect(() => {
    if (delistNftWait.isSuccess) {
      updateListingStatus(listing, 'Delisted')
      toast({
        status: 'success',
        description: (
          <>
            Success! Check on block explorer:
            <a href={`${chain?.blockExplorers?.default.url}/tx/${delistNftWait.data?.transactionHash}`} target="_blank" rel="noopener noreferrer">
              {`${chain?.blockExplorers?.default.url}/tx/${delistNftWait.data?.transactionHash}`}
            </a>
          </>
        ),
      })
    }
  }, [chain?.blockExplorers?.default.url, delistNftWait.data?.transactionHash, delistNftWait.isSuccess, listing, toast, updateListingStatus])

  const handleDelistNft = () => {
    delistNftWrite.write?.()
  }

  return <Button onClick={handleDelistNft}>Delist</Button>
}
