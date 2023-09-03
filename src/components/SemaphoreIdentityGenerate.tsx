import { Heading, Text, Input, Flex, Button, useToast, Alert, AlertIcon, useEditable } from '@chakra-ui/react'
import { Identity } from '@semaphore-protocol/identity'
import { Dispatch, SetStateAction, useState } from 'react'
import { generateProof } from '@semaphore-protocol/proof'
import { useAccount } from 'wagmi'

interface Props {
  semaphoreId: Identity | undefined
  setSemaphoreId: Dispatch<SetStateAction<Identity | undefined>>
  secret: string
  refreshSecret: () => void
}

export function SemaphoreIdentityGenerate(props: Props) {
  const { secret, refreshSecret } = props
  const { address } = useAccount()
  const toast = useToast()

  const handleConfirmSecret = () => {
    const processedSecret = `${address}-${secret}`
    const identity = new Identity(processedSecret)
    props.setSemaphoreId(identity)
    toast({ description: 'Semaphore Identity created successfully' })
  }

  const handleRefreshSecret = () => {
    refreshSecret()
  }

  return (
    <div>
      <Heading as="h2" fontSize="2xl" my={4}>
        Semaphore Identity
      </Heading>

      <Text>Your secret to generate Semaphore Identity</Text>
      <Flex align="center" mb={4} direction="column">
        <Flex align="center" mb={2} width="100%">
          <Input type="text" value={secret} readOnly mr={2} disabled={props.semaphoreId !== undefined} />
          <Button onClick={handleRefreshSecret} disabled={props.semaphoreId !== undefined}>
            Refresh
          </Button>
          <Button onClick={handleConfirmSecret} ml={2} disabled={props.semaphoreId !== undefined}>
            Confirm
          </Button>
          <Button
            onClick={() => {
              props.setSemaphoreId(undefined)
            }}
            ml={2}
            disabled={!props.semaphoreId}>
            Reset
          </Button>
        </Flex>
        {props.semaphoreId !== undefined && (
          <Alert status="success">
            <AlertIcon />
            Semaphore Identity created successfully with secret: {secret} (do not reuse or lose it)
          </Alert>
        )}
      </Flex>
      <Text>
        Note:
        <br /> 1. Each secret message is associated with each NFT listing / ETH deposit. Do not reuse the same value.
        <br /> 2. The secret message is needed when you are claiming the ETH after the NFT is sold / Buying the NFT with a deposit. Carefully keep it
        private and do not lose it.
      </Text>
    </div>
  )
}
