import { useContractWrite, usePrepareContractWrite, useWaitForTransaction, Address, Chain, useContractRead } from 'wagmi'
import { Button } from '@chakra-ui/react'
import { anonExchangeABI, anonExchangeAddress, simpleNftABI, simpleNftAddress } from 'abis'
import { useEffect, useState } from 'react'
import { NftListing } from 'context/AnonExchangeContext'
import { Identity } from '@semaphore-protocol/identity'

interface ListNFTProps {
  nft: NftListing
  chain: Chain
  identity: Identity
}

export const ListNFT: React.FC<ListNFTProps> = ({ nft, chain, identity }) => {
  const anonExchangeAddr = anonExchangeAddress[chain.id as keyof typeof anonExchangeAddress]
  const [approved, setApproved] = useState<boolean>(false)
  const [listed, setListed] = useState<boolean>(false)

  // check approval
  const { data: approvedAddress } = useContractRead({
    address: nft.contractAddress as Address,
    abi: simpleNftABI,
    functionName: 'getApproved',
    args: [BigInt(nft.tokenId)],
    watch: true,
  })

  // prepare contract write
  const prepareApprove = usePrepareContractWrite({
    address: nft.contractAddress as Address,
    abi: simpleNftABI,
    functionName: 'approve',
    args: [anonExchangeAddr, BigInt(nft.tokenId)],
  })

  const approveWrite = useContractWrite(prepareApprove.config)

  const prepareListNFT = usePrepareContractWrite({
    address: anonExchangeAddress[chain.id as keyof typeof anonExchangeAddress] as Address,
    abi: anonExchangeABI,
    functionName: 'listNFT',
    args: [nft.contractAddress as Address, BigInt(nft.tokenId), identity.commitment],
  })

  console.log('prepareListNFT', prepareListNFT.config)

  const listNftWrite = useContractWrite(prepareListNFT.config)
  const listNftWait = useWaitForTransaction({ hash: listNftWrite.data?.hash })

  const prepareDelistNFT = usePrepareContractWrite({
    address: anonExchangeAddress[chain.id as keyof typeof anonExchangeAddress] as Address,
    abi: anonExchangeABI,
    functionName: 'delistNFT',
    args: [nft.contractAddress as Address, BigInt(nft.tokenId)],
  })

  console.log('prepareDelistNFT', prepareDelistNFT.config)

  const delistNftWrite = useContractWrite(prepareDelistNFT.config)
  const delistNftWait = useWaitForTransaction({ hash: delistNftWrite.data?.hash })

  console.log('a', approveWrite.write)
  console.log('l', listNftWrite.write)
  console.log('d', delistNftWrite.write)

  const handleApprove = () => {
    approveWrite.writeAsync?.().then(() => {
      prepareListNFT?.refetch()
    })
  }

  const handleListNft = () => {
    listNftWrite.writeAsync?.().then(() => {
      prepareDelistNFT?.refetch()
    })
  }

  const handleDelistNft = () => {
    delistNftWrite.write?.()
  }

  useEffect(() => {
    setApproved(approvedAddress === anonExchangeAddr)
  }, [anonExchangeAddr, approvedAddress, nft.contractAddress, nft.tokenId, prepareDelistNFT, prepareListNFT])

  if (listNftWait.isSuccess && !delistNftWait.isSuccess) {
    return <Button onClick={handleDelistNft}>Delist</Button>
  } else {
    if (!approved) {
      return <Button onClick={handleApprove}>Approve</Button>
    } else {
      return <Button onClick={handleListNft}>List</Button>
    }
  }
}
