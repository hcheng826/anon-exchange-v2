import { Heading, Text, Input, Flex, Button, useToast, Alert, AlertIcon } from '@chakra-ui/react'
import { Identity } from '@semaphore-protocol/identity'
import { Dispatch, SetStateAction, useState } from 'react'
import { generateProof } from '@semaphore-protocol/proof'
import { useAccount } from 'wagmi'
import useSemaphore from 'hooks/useSemaphore'

interface Props {
  semaphoreId: Identity | undefined
  setSemaphoreId: Dispatch<SetStateAction<Identity | undefined>>
}

export function SemaphoreIdentitySecretInput(props: Props) {
  const [secret, setSecret] = useState('')
  const { address } = useAccount()
  // const { nftSoldGroup } = useSemaphore()

  const toast = useToast()

  const handleConfirmSecret = () => {
    const processedSecret = `${address}-${secret}`
    const identity = new Identity(processedSecret)
    props.setSemaphoreId(identity)
    toast({ description: 'Semaphore Identity created successfully' })
    // setSecret('')
  }

  const isLocked = props.semaphoreId !== undefined // Determine if the semaphoreId is set

  return (
    <div>
      <Heading as="h2" fontSize="2xl" my={4}>
        Semaphore Identity
      </Heading>

      <Text>Input a secret message to generate Semaphore Identity</Text>
      <Flex align="center" mb={4} direction="column">
        <Flex align="center" mb={2} width="100%">
          <Input
            type="text"
            placeholder="Enter your secret message..."
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            mr={2} // adds a margin to the right for spacing
            disabled={isLocked} // Disable input if semaphoreId is set
          />
          <Button onClick={handleConfirmSecret} disabled={isLocked}>
            Confirm
          </Button>
        </Flex>
        {isLocked && (
          <Alert status="success">
            <AlertIcon />
            Semaphore Identity created successfully with secret: {secret} (do not reuse or lose it)
          </Alert>
        )}
      </Flex>
      <Text>
        Note:
        <br /> 1. Each secret message is associated with each NFT listing / ETH deposit. Do not reuse same value.
        <br /> 2. The secret message is needed when you are claiming the ETH after NFT is sold / Buying the NFT with deposit. Carefully keep it
        private and do not lose it.
      </Text>
    </div>
  )
}
