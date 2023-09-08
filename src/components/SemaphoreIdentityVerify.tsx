import { Heading, Text, Input, Flex, Button, useToast, Alert, AlertIcon, useEditable } from '@chakra-ui/react'
import { Identity } from '@semaphore-protocol/identity'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { FullProof, generateProof, verifyProof } from '@semaphore-protocol/proof'
import { useAccount } from 'wagmi'
import useSemaphore from 'hooks/useSemaphore'

const BUYER_BUY_AND_CLAIM_NFT_SIGNAL = 1

interface Props {
  semaphoreId: Identity | undefined
  setSemaphoreId: Dispatch<SetStateAction<Identity | undefined>>
  setFullProof: Dispatch<SetStateAction<FullProof | undefined>>
  secret: string
  setSecret: Dispatch<SetStateAction<string>>
}

export function SemaphoreIdentityVerify(props: Props) {
  const { secret, setSecret } = props
  const toast = useToast()
  const { ethDepositedGroup, refreshGroups } = useSemaphore()

  useEffect(() => {
    refreshGroups()
  }, [refreshGroups])

  const handleConfirmSecret = () => {
    const identity = new Identity(secret)

    if (!ethDepositedGroup) {
      return
    }

    generateProof(identity, ethDepositedGroup, ethDepositedGroup.id, BUYER_BUY_AND_CLAIM_NFT_SIGNAL)
      .then((proof) => {
        verifyProof(proof, 20).then((success) => {
          if (success) {
            toast({ description: 'Valid Semaphore Identity!' })
            props.setSemaphoreId(identity)
          } else {
            toast({ description: 'Invalid Semaphore Identity!', status: 'error' })
          }
        })
        props.setFullProof(proof)
      })
      .catch((e) => {
        toast({ description: `Error: ${e.message ?? e}`, status: 'error' })
      })
  }

  return (
    <div>
      <Heading as="h2" fontSize="2xl" my={4}>
        Semaphore Identity
      </Heading>

      <Text>Input your secret to verify Semaphore Identity</Text>
      <Flex align="center" mb={4} direction="column">
        <Flex align="center" mb={2} width="100%">
          <Input type="text" value={secret} onChange={(e) => setSecret(e.target.value)} mr={2} disabled={props.semaphoreId !== undefined} />
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
            Semaphore Identity verified successfully with secret: {secret}.
          </Alert>
        )}
      </Flex>
    </div>
  )
}
