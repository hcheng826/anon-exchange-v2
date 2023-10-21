import { useContractWrite, usePrepareContractWrite, useWaitForTransaction, Address, Chain, useContractRead, useAccount } from 'wagmi'
import { Button, useToast } from '@chakra-ui/react'
import { anonExchangeABI, anonExchangeAddress, simple20ABI, simple721ABI } from 'abis'
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

  // check erc20 approval
  const { data: allowance } = useContractRead({
    address: listing.contractAddress as Address,
    abi: simple20ABI,
    functionName: 'allowance',
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

  const approveErc20Write = useContractWrite({
    address: listing.contractAddress as Address,
    abi: simple20ABI,
    functionName: 'approve',
    args: [anonExchangeAddr, BigInt(listing.amount || 0)],
  })
  const approveErc20Wait = useWaitForTransaction({ hash: approveErc20Write.data?.hash })

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
      approveErc20Write.write?.()
    } else {
      toast({ status: 'error', description: 'unsupported asset' })
    }
  }

  const handleList = () => {
    listWrite.write?.()
  }

  useEffect(() => {
    // ERC721
    setApproved(approvedAddress === anonExchangeAddr || !!isApprovedForAll)
    // ERC20
    setApproved((allowance ?? 0) >= listing.amount)
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
    isApprovedForAll,
    listWait.data?.transactionHash,
    toast,
    chain?.blockExplorers?.default.url,
    allowance,
  ])

  if (!approved) {
    return (
      <Button onClick={handleApprove} isLoading={approve721Wait.isLoading || approveErc20Wait.isLoading}>
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
