import { Chain, sepolia } from 'wagmi'
import { Button, useToast } from '@chakra-ui/react'
import { useState } from 'react'
import { localhost } from 'viem/chains'
import { FullProof } from '@semaphore-protocol/proof'
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

  function claimEth() {
    setLoading(true)

    fetch('/api/claimEth', {
      method: 'POST',
      body: JSON.stringify({
        fullProof,
        recipient,
      }),
      headers: {
        'content-type': 'application/json',
      },
    })
      .then((res) => {
        if (res.status === 200) {
          res
            .json()
            .then((data) => {
              toast({
                status: 'success',
                description: (
                  <>
                    Success! Check on block explorer:
                    <a href={`${chain?.blockExplorers?.default.url}/tx/${data.tx_hash}`} target="_blank" rel="noopener noreferrer">
                      {`${chain?.blockExplorers?.default.url}/tx/${data.tx_hash}`}
                    </a>
                  </>
                ),
              })
              setLoading(false)
            })
            .catch((e) => {
              console.error(e)
            })
        } else {
          res
            .json()
            .then((data) => {
              toast({
                status: 'error',
                description: data.message,
              })
            })
            .catch((e) => {
              console.error(e)
            })
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleBuyNft = () => {
    if (chain.id === localhost.id || chain.id === sepolia.id) {
      claimEth()
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
