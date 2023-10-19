import { useContractWrite, usePrepareContractWrite, useWaitForTransaction, Address, Chain, useContractRead, useAccount } from 'wagmi'
import { Button, useToast } from '@chakra-ui/react'
import { anonExchangeABI, anonExchangeAddress, simple721ABI, simpleNftAddress } from 'abis'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Listing, ListingStatus, ListingType } from 'context/AnonExchangeContext'
import { Identity } from '@semaphore-protocol/identity'
import { ethers } from 'ethers'

interface ListProps {
  listing: Listing
  chain: Chain
  identity: Identity
  updateListingStatus: (listing: Listing, newStatus: ListingStatus) => void
  setSemaphoreId: Dispatch<SetStateAction<Identity | undefined>>
  refreshSecret: () => void
}

export function List({ listing, chain, identity, updateListingStatus, setSemaphoreId, refreshSecret }: ListProps) {
  const anonExchangeAddr = anonExchangeAddress[chain.id as keyof typeof anonExchangeAddress]
  const [approved, setApproved] = useState<boolean>(false)
  const { address } = useAccount()

  const toast = useToast()

  // check 721 approval
  const { data: approvedAddress } = useContractRead({
    address: listing.contractAddress as Address,
    abi: simple721ABI,
    functionName: 'getApproved',
    args: [BigInt(listing.tokenId || 0)],
    watch: true,
  })

  const { data: isApprovedForAll } = useContractRead({
    address: listing.contractAddress as Address,
    abi: simple721ABI,
    functionName: 'isApprovedForAll',
    args: [address || '0x', anonExchangeAddr],
    watch: true,
  })

  const approve721Write = useContractWrite({
    address: listing.contractAddress as Address,
    abi: simple721ABI,
    functionName: 'approve',
    args: [anonExchangeAddr, BigInt(listing.tokenId || 0)],
  })
  const approve721Wait = useWaitForTransaction({ hash: approve721Write.data?.hash })

  const listWrite = useContractWrite({
    address: anonExchangeAddress[chain.id as keyof typeof anonExchangeAddress] as Address,
    abi: anonExchangeABI,
    functionName: 'list',
    args: [
      {
        listingType: listing.listingType,
        lister: address || ethers.constants.AddressZero,
        contractAddress: listing.contractAddress as `0x${string}`,
        tokenId: BigInt(listing.tokenId || 0),
        amount: BigInt(listing.amount),
        idCommitment: identity.commitment,
      },
    ],
  })
  const listWait = useWaitForTransaction({ hash: listWrite.data?.hash })

  const handleApprove = () => {
    if (listing.listingType === ListingType.ERC721) {
      approve721Write.write?.()
    } else if (listing.listingType === ListingType.ERC20) {
    } else {
      toast({ status: 'error', description: 'unsupported asset' })
    }
  }

  const handleList = () => {
    listWrite.write?.()
  }

  useEffect(() => {
    setApproved(approvedAddress === anonExchangeAddr || !!isApprovedForAll)
    if (listWait.isSuccess) {
      updateListingStatus(listing, 'Listed')
      setSemaphoreId(undefined)
      toast({
        status: 'success',
        description: (
          <>
            Success! Check on block explorer:
            <a href={`${chain?.blockExplorers?.default.url}/tx/${listWait.data?.transactionHash}`} target="_blank" rel="noopener noreferrer">
              {`${chain?.blockExplorers?.default.url}/tx/${listWait.data?.transactionHash}`}
            </a>
          </>
        ),
      })
      // refreshSecret()
    }
  }, [
    anonExchangeAddr,
    approvedAddress,
    listWait.isSuccess,
    listing,
    setSemaphoreId,
    updateListingStatus,
    // refreshSecret,
    isApprovedForAll,
    listWait.data?.transactionHash,
    toast,
    chain?.blockExplorers?.default.url,
  ])

  if (!approved) {
    return (
      <Button onClick={handleApprove} isLoading={approve721Wait.isLoading}>
        Approve
      </Button>
    )
  } else {
    return (
      <Button onClick={handleList} isLoading={listWait.isLoading}>
        List
      </Button>
    )
  }
}
