import { useContractWrite, usePrepareContractWrite, useWaitForTransaction, Address, Chain, useContractRead, sepolia } from 'wagmi'
import { Button, useToast } from '@chakra-ui/react'
import { anonExchangeABI, anonExchangeAddress, simpleNftABI, simpleNftAddress } from 'abis'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { NftListing, NftStatus } from 'context/AnonExchangeContext'
import { Identity } from '@semaphore-protocol/identity'
import { localhost } from 'viem/chains'
import { ContractTransaction, ethers } from 'ethers'
import { FullProof } from '@semaphore-protocol/proof'

interface BuyNFTProps {
  nft: NftListing
  chain: Chain
  fullProof: FullProof
  resetSemaphoreId: () => void
  recipient: string
  setRecipient: Dispatch<SetStateAction<string>>
}

export function BuyNFT({ nft, chain, fullProof, resetSemaphoreId, recipient, setRecipient }: BuyNFTProps) {
  const toast = useToast()

  function buyNftLocalhost() {
    if (!process.env.NEXT_PUBLIC_LOCAL_RELAYER_PRIVATE_KEY) {
      console.error('NEXT_LOCAL_RELAYER_PRIVATE_KEY undefined')
      return
    }

    const relayer = new ethers.Wallet(
      process.env.NEXT_PUBLIC_LOCAL_RELAYER_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(localhost.rpcUrls.default.http[0])
    )

    const anonExchangeAddr = anonExchangeAddress[chain.id as keyof typeof anonExchangeAddress]
    const anonExchange = new ethers.Contract(anonExchangeAddr, anonExchangeABI, relayer)
    try {
      anonExchange
        .connect(relayer)
        .buyAndClaimNFT(nft.contractAddress, nft.tokenId, fullProof.merkleTreeRoot, fullProof.nullifierHash, fullProof.proof, recipient)
        .then((tx: ContractTransaction) => {
          tx.wait().then((rc) => {
            setRecipient('')
            resetSemaphoreId()
          })
        })
    } catch (error) {
      console.error('Error calling buyAndClaimNFT:', error)
    }
  }

  function buyNftSepolia() {}

  const handleBuyNft = () => {
    if (chain.id === localhost.id) {
      buyNftLocalhost()
    } else if (chain.id === sepolia.id) {
      buyNftSepolia()
    } else {
      toast({ description: 'unsupported chain', status: 'error' })
    }
  }

  return <Button onClick={handleBuyNft}>Buy</Button>
}
