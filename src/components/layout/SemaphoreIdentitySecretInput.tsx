import { Heading, Text, Input } from '@chakra-ui/react'
import { Dispatch, SetStateAction } from 'react'

interface Props {
  secret: string
  setSecret: Dispatch<SetStateAction<string>>
}

export function SemaphoreIdentitySecretInput(props: Props) {
  return (
    <div>
      <Heading as="h2" fontSize="2xl" my={4}>
        Semaphore Identity
      </Heading>

      <Text>Input a secret message to generate Semaphore Identity</Text>
      <Input type="text" placeholder="Enter your secret message..." value={props.secret} onChange={(e) => props.setSecret(e.target.value)} />
      <Text>
        Note:
        <br /> 1. Each secret message is associated with each NFT listing / ETH deposit. Do not reuse same value.
        <br /> 2. The secret message is needed when you are claiming the ETH after NFT is sold / Buying the NFT with deposit. Keep it private and do
        not lose it.
      </Text>
    </div>
  )
}
