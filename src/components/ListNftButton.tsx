import { useContractWrite, usePrepareContractWrite, useWaitForTransaction, Address, Chain, useContractRead, useAccount } from 'wagmi'
import { Button, useToast } from '@chakra-ui/react'
import { anonExchangeABI, anonExchangeAddress, simpleNftABI, simpleNftAddress } from 'abis'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { NftListing, NftStatus } from 'context/AnonExchangeContext'
import { Identity } from '@semaphore-protocol/identity'

interface ListNFTProps {
  nft: NftListing
  chain: Chain
  identity: Identity
  updateNftStatus: (nft: NftListing, newStatus: NftStatus) => void
  setSemaphoreId: Dispatch<SetStateAction<Identity | undefined>>
  refreshSecret: () => void
}

export function ListNFT({ nft, chain, identity, updateNftStatus, setSemaphoreId, refreshSecret }: ListNFTProps) {
  const anonExchangeAddr = anonExchangeAddress[chain.id as keyof typeof anonExchangeAddress]
  const [approved, setApproved] = useState<boolean>(false)
  const { address } = useAccount()

  const toast = useToast()

  // check approval
  const { data: approvedAddress } = useContractRead({
    address: nft.contractAddress as Address,
    abi: simpleNftABI,
    functionName: 'getApproved',
    args: [BigInt(nft.tokenId)],
    watch: true,
  })

  const { data: isApprovedForAll } = useContractRead({
    address: nft.contractAddress as Address,
    abi: simpleNftABI,
    functionName: 'isApprovedForAll',
    args: [address || '0x', anonExchangeAddr],
    watch: true,
  })

  const approveWrite = useContractWrite({
    address: nft.contractAddress as Address,
    abi: simpleNftABI,
    functionName: 'approve',
    args: [anonExchangeAddr, BigInt(nft.tokenId)],
  })
  const approveWait = useWaitForTransaction({ hash: approveWrite.data?.hash })

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
    setApproved(approvedAddress === anonExchangeAddr || !!isApprovedForAll)
    if (listNftWait.isSuccess) {
      updateNftStatus(nft, 'Listed')
      setSemaphoreId(undefined)
      toast({
        status: 'success',
        description: (
          <>
            Success! Check on block explorer:
            <a href={`${chain?.blockExplorers?.default.url}/tx/${listNftWait.data?.transactionHash}`} target="_blank" rel="noopener noreferrer">
              {`${chain?.blockExplorers?.default.url}/tx/${listNftWait.data?.transactionHash}`}
            </a>
          </>
        ),
      })
      // refreshSecret()
    }
  }, [
    anonExchangeAddr,
    approvedAddress,
    listNftWait.isSuccess,
    nft,
    setSemaphoreId,
    updateNftStatus,
    // refreshSecret,
    isApprovedForAll,
    listNftWait.data?.transactionHash,
    toast,
    chain?.blockExplorers?.default.url,
  ])

  if (!approved) {
    return (
      <Button onClick={handleApprove} isLoading={approveWait.isLoading}>
        Approve
      </Button>
    )
  } else {
    return (
      <Button onClick={handleListNft} isLoading={listNftWait.isLoading}>
        List
      </Button>
    )
  }
}
