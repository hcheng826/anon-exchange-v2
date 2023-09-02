import { useContractWrite, usePrepareContractWrite, useWaitForTransaction, Address, Chain, useContractRead } from 'wagmi'
import { Button } from '@chakra-ui/react'
import { anonExchangeABI, anonExchangeAddress, simpleNftABI, simpleNftAddress } from 'abis'
import { useEffect, useState } from 'react'
import { NftListing, NftStatus } from 'context/AnonExchangeContext'
import { Identity } from '@semaphore-protocol/identity'

interface ListNFTProps {
  nft: NftListing
  chain: Chain
  identity: Identity
  updateNftStatus: (nft: NftListing, newStatus: NftStatus) => void
}

export function ListNFT({ nft, chain, identity, updateNftStatus }: ListNFTProps) {
  const anonExchangeAddr = anonExchangeAddress[chain.id as keyof typeof anonExchangeAddress]
  const [approved, setApproved] = useState<boolean>(false)

  // check approval
  const { data: approvedAddress } = useContractRead({
    address: nft.contractAddress as Address,
    abi: simpleNftABI,
    functionName: 'getApproved',
    args: [BigInt(nft.tokenId)],
    watch: true,
  })

  const approveWrite = useContractWrite({
    address: nft.contractAddress as Address,
    abi: simpleNftABI,
    functionName: 'approve',
    args: [anonExchangeAddr, BigInt(nft.tokenId)],
  })

  const listNftWrite = useContractWrite({
    address: anonExchangeAddress[chain.id as keyof typeof anonExchangeAddress] as Address,
    abi: anonExchangeABI,
    functionName: 'listNFT',
    args: [nft.contractAddress as Address, BigInt(nft.tokenId), identity.commitment],
  })
  const listNftWait = useWaitForTransaction({ hash: listNftWrite.data?.hash })

  const handleApprove = () => {
    approveWrite.write?.()
  }

  const handleListNft = () => {
    listNftWrite.write?.()
  }

  useEffect(() => {
    setApproved(approvedAddress === anonExchangeAddr)
    if (listNftWait.isSuccess) {
      updateNftStatus(nft, 'Listed')
    }
  }, [anonExchangeAddr, approvedAddress, listNftWait.isSuccess, nft, updateNftStatus])

  if (!approved) {
    return <Button onClick={handleApprove}>Approve</Button>
  } else {
    return <Button onClick={handleListNft}>List</Button>
  }
}
