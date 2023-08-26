import { Address, useAccount, useNetwork } from 'wagmi'
import { Button, Heading } from '@chakra-ui/react'
import { NextSeo } from 'next-seo'
import { useState } from 'react'
import { SemaphoreIdentitySecretInput } from 'components/layout/SemaphoreIdentitySecretInput'
import { RecipientAdressInput } from 'components/layout/RecipientAdressInput'
import { HeadingComponent } from 'components/layout/HeadingComponent'
import { Identity } from '@semaphore-protocol/identity'

export default function ClaimEth() {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()

  const [recipient, setRecipient] = useState<string>('')
  const [semaphoreId, setSemaphoreId] = useState<Identity>()

  if (isConnected && address && chain) {
    return (
      <div>
        <NextSeo title="Claim ETH" />

        <HeadingComponent as="h2">Claim ETH</HeadingComponent>

        <SemaphoreIdentitySecretInput semaphoreId={semaphoreId} setSemaphoreId={setSemaphoreId} />

        <RecipientAdressInput {...{ recipient, setRecipient }} />

        <Button
          width="full"
          // disabled={waitForTransaction.isLoading || contractWrite.isLoading || !contractWrite.write}
          mt={4}
          // onClick={handleSendTransation}
        >
          Claim
        </Button>
      </div>
    )
  }

  return <div>Connect your wallet first to deposit ETH.</div>
}
