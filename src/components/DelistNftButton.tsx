import { useContractWrite, usePrepareContractWrite, useWaitForTransaction, Address, Chain, useContractRead } from 'wagmi'
import { Button, useToast } from '@chakra-ui/react'
import { anonExchangeABI, anonExchangeAddress } from 'abis'
import { NftListing, NftStatus } from 'context/AnonExchangeContext'
import { useEffect } from 'react'

interface DelistNFTProps {
  nft: NftListing
  chain: Chain
  updateNftStatus: (nft: NftListing, newStatus: NftStatus) => void
}

export function DelistNFT({ nft, chain, updateNftStatus }: DelistNFTProps) {
  const toast = useToast()

  const prepareDelistNFT = usePrepareContractWrite({
    address: anonExchangeAddress[chain.id as keyof typeof anonExchangeAddress] as Address,
    abi: anonExchangeABI,
    functionName: 'delistNFT',
    args: [nft.contractAddress as Address, BigInt(nft.tokenId)],
    chainId: chain.id,
  })

  const delistNftWrite = useContractWrite(prepareDelistNFT.config)
  const delistNftWait = useWaitForTransaction({ hash: delistNftWrite.data?.hash })

  useEffect(() => {
    if (delistNftWait.isSuccess) {
      updateNftStatus(nft, 'Delisted')
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
  }, [chain?.blockExplorers?.default.url, delistNftWait.data?.transactionHash, delistNftWait.isSuccess, nft, toast, updateNftStatus])

  const handleDelistNft = () => {
    delistNftWrite.write?.()
  }

  return <Button onClick={handleDelistNft}>Delist</Button>
}
