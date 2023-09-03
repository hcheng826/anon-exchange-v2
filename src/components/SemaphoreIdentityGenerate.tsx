import { Heading, Text, Input, Flex, Button, useToast, Alert, AlertIcon } from '@chakra-ui/react'
import { Identity } from '@semaphore-protocol/identity'
import { Dispatch, SetStateAction, useState } from 'react'

interface Props {
  semaphoreId: Identity | undefined
  setSemaphoreId: Dispatch<SetStateAction<Identity | undefined>>
  secret: string
  refreshSecret: () => void
}

export function SemaphoreIdentityGenerate(props: Props) {
  const { secret, refreshSecret } = props
  const toast = useToast()

  const handleConfirmSecret = () => {
    const identity = new Identity(secret)
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
            Semaphore Identity created successfully with secret: {secret} (note it down, it will NOT appear again)
          </Alert>
        )}
      </Flex>
      <Text>
        Note: The secret message is needed when you are claiming the ETH after the NFT is sold / Buying the NFT with a deposit. Carefully keep it
        private and do not lose it.
      </Text>
    </div>
  )
}
