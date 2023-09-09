import { Button, Text } from '@chakra-ui/react'
import { NextSeo } from 'next-seo'
import { useState } from 'react'
import { RecipientAdressInput } from 'components/layout/RecipientAdressInput'
import { HeadingComponent } from 'components/layout/HeadingComponent'
import { Identity } from '@semaphore-protocol/identity'
import { SemaphoreIdentityVerify } from 'components/SemaphoreIdentityVerify'
import { FullProof } from '@semaphore-protocol/proof'
import { Signal } from 'context/AnonExchangeContext'
import { ClaimEthButton } from 'components/ClaimEthButton'

export default function ClaimEth() {
  const [recipient, setRecipient] = useState<string>('')
  const [semaphoreId, setSemaphoreId] = useState<Identity>()
  const [fullProof, setFullProof] = useState<FullProof>()
  const [secret, setSecret] = useState('')

  return (
    <div>
      <NextSeo title="Claim ETH" />

      <HeadingComponent as="h2">Claim ETH</HeadingComponent>
      <Text>{"Note that you don't need to connect a wallet to perform operations on this page"}</Text>
      <SemaphoreIdentityVerify
        semaphoreId={semaphoreId}
        setSemaphoreId={setSemaphoreId}
        setFullProof={setFullProof}
        secret={secret}
        setSecret={setSecret}
        signal={Signal.SELLER_CLAIM_ETH}
      />

      <RecipientAdressInput {...{ recipient, setRecipient }} />

      {fullProof ? (
        <ClaimEthButton fullProof={fullProof} recipient={recipient} />
      ) : (
        <Button mt={2} disabled={true} width={'full'}>
          Input secret to generate Proof before you can claim ETH
        </Button>
      )}
    </div>
  )
}
