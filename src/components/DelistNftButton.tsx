import { useContractWrite, usePrepareContractWrite, useWaitForTransaction, Address, Chain, useContractRead } from 'wagmi'
import { Button } from '@chakra-ui/react'
import { anonExchangeABI, anonExchangeAddress } from 'abis'
import { NftListing, NftStatus } from 'context/AnonExchangeContext'
import { useEffect } from 'react'

interface DelistNFTProps {
  nft: NftListing
  chain: Chain
  updateNftStatus: (nft: NftListing, newStatus: NftStatus) => void
}

export function DelistNFT({ nft, chain, updateNftStatus }: DelistNFTProps) {
  const prepareDelistNFT = usePrepareContractWrite({
    address: anonExchangeAddress[chain.id as keyof typeof anonExchangeAddress] as Address,
    abi: anonExchangeABI,
    functionName: 'delistNFT',
    args: [nft.contractAddress as Address, BigInt(nft.tokenId)],
  })

  const delistNftWrite = useContractWrite(prepareDelistNFT.config)
  const delistNftWait = useWaitForTransaction({ hash: delistNftWrite.data?.hash })

  useEffect(() => {
    if (delistNftWait.isSuccess) {
      updateNftStatus(nft, 'Delisted')
    }
  }, [delistNftWait.isSuccess, nft, updateNftStatus])

  const handleDelistNft = () => {
    delistNftWrite.write?.()
  }

  return <Button onClick={handleDelistNft}>Delist</Button>
}
