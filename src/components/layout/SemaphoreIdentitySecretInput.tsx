import { Heading, Text, Input } from '@chakra-ui/react'
import { Dispatch, SetStateAction, useState } from 'react'

interface Props {
  // identity: Identity
  // setIdentity: Dispatch<SetStateAction<Identity>>
}

export function SemaphoreIdentitySecretInput(props: Props) {
  const [secret, setSecret] = useState('')

  return (
    <div>
      <Heading as="h2" fontSize="2xl" my={4}>
        Semaphore Identity
      </Heading>

      <Text>Input a secret message to generate Semaphore Identity</Text>
      <Input type="text" placeholder="Enter your secret message..." value={secret} onChange={(e) => setSecret(e.target.value)} />
      <Text>
        Note:
        <br /> 1. Each secret message is associated with each NFT listing / ETH deposit. Do not reuse same value.
        <br /> 2. The secret message is needed when you are claiming the ETH after NFT is sold / Buying the NFT with deposit. Keep it private and do
        not lose it.
      </Text>
    </div>
  )
}
