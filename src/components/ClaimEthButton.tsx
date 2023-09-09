import { Chain, sepolia } from 'wagmi'
import { Button, useToast } from '@chakra-ui/react'
import { anonExchangeABI, anonExchangeAddress } from 'abis'
import { useState } from 'react'
import { localhost } from 'viem/chains'
import { ContractTransaction, ethers } from 'ethers'
import { FullProof } from '@semaphore-protocol/proof'
import { decodeError } from 'ethers-decode-error'
import { chainInUse } from 'utils/config'

interface BuyNFTProps {
  fullProof: FullProof
  // resetSemaphoreId: () => void
  recipient: string
}

export function ClaimEthButton({ fullProof /*, resetSemaphoreId*/, recipient }: BuyNFTProps) {
  const chain: Chain = chainInUse
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  function claimEthLocalhost() {
    setLoading(true)
    if (!process.env.NEXT_PUBLIC_LOCAL_RELAYER_PRIVATE_KEY) {
      console.error('NEXT_PUBLIC_LOCAL_RELAYER_PRIVATE_KEY undefined')
      return
    }

    const relayer = new ethers.Wallet(
      process.env.NEXT_PUBLIC_LOCAL_RELAYER_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(localhost.rpcUrls.default.http[0])
    )

    const anonExchangeAddr = anonExchangeAddress[chain.id as keyof typeof anonExchangeAddress]
    const anonExchange = new ethers.Contract(anonExchangeAddr, anonExchangeABI, relayer)
    try {
      // callStatic for tx simulation
      anonExchange.callStatic
        .claimETH(recipient, fullProof.merkleTreeRoot, fullProof.nullifierHash, fullProof.proof)
        .then((tx: ContractTransaction) => {
          // inner call to actually submit the tx
          anonExchange.claimETH(recipient, fullProof.merkleTreeRoot, fullProof.nullifierHash, fullProof.proof).then((tx: ContractTransaction) => {
            tx.wait().then((rc) => {
              toast({
                status: 'success',
                description: `Success! check on block explorer: ${chain?.blockExplorers?.default.url}/tx/${rc.transactionHash}`,
              })
              setLoading(false)
              // resetSemaphoreId()
            })
          })
        })
        .catch((e) => {
          const err = decodeError(e)
          console.log(err)

          let toastErrorMsg = ''
          if (err.error === 'ERC721: transfer to non ERC721Receiver implementer') {
            toastErrorMsg = 'Invalid recipient address (non ERC721Receiver implementer)'
          } else if (err.error === '0x948d0674') {
            toastErrorMsg = 'Semaphore Id has been used'
          } else {
            toastErrorMsg = `Unknown error: ${err.error}`
          }

          toast({ status: 'error', description: toastErrorMsg })
          setLoading(false)
          return
        })
    } catch (error) {
      console.error('Error calling buyAndClaimNFT:', error)
    }
  }

  function claimEthSepolia() {
    // call OZ defender
  }

  const handleBuyNft = () => {
    if (chain.id === localhost.id) {
      claimEthLocalhost()
    } else if (chain.id === sepolia.id) {
      claimEthSepolia()
    } else {
      toast({ description: 'unsupported chain', status: 'error' })
    }
  }

  return (
    <Button onClick={handleBuyNft} isLoading={loading} mt={2} width={'full'}>
      Claim ETH
    </Button>
  )
}
