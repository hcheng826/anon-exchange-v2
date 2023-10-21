import { Chain, sepolia } from 'wagmi'
import { Button, useToast } from '@chakra-ui/react'
import { useState } from 'react'
import { Listing } from 'context/AnonExchangeContext'
import { localhost } from 'viem/chains'
import { FullProof } from '@semaphore-protocol/proof'

interface BuyProps {
  listing: Listing
  chain: Chain
  fullProof: FullProof
  resetSemaphoreId: () => void
  recipient: string
  updateNfts: () => void
}

export function Buy({ listing, chain, fullProof, resetSemaphoreId, recipient, updateNfts }: BuyProps) {
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  function buy() {
    setLoading(true)

    fetch('/api/buy', {
      method: 'POST',
      body: JSON.stringify({
        listing,
        fullProof,
        recipient,
        chain,
      }),
      headers: {
        'content-type': 'application/json',
      },
    }).then((res) => {
      console.log('res', res)
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
            updateNfts()
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
            setLoading(false)
          })
          .catch((e) => {
            console.error(e)
          })
      }
    })
  }

  const handleBuyNft = () => {
    if (chain.id === localhost.id || chain.id === sepolia.id) {
      buy()
    } else {
      toast({ description: 'unsupported chain', status: 'error' })
    }
  }

  return (
    <Button onClick={handleBuyNft} isLoading={loading}>
      Buy
    </Button>
  )
}
