import { Heading, Text, Input, Flex, Button, useToast, Alert, AlertIcon, useEditable } from '@chakra-ui/react'
import { Identity } from '@semaphore-protocol/identity'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { FullProof, generateProof, verifyProof } from '@semaphore-protocol/proof'
import useSemaphore from 'hooks/useSemaphore'
import { Signal } from 'context/AnonExchangeContext'

interface Props {
  semaphoreId: Identity | undefined
  setSemaphoreId: Dispatch<SetStateAction<Identity | undefined>>
  setFullProof: Dispatch<SetStateAction<FullProof | undefined>>
  secret: string
  setSecret: Dispatch<SetStateAction<string>>
  signal: Signal
}

export function SemaphoreIdentityVerify(props: Props) {
  const { secret, setSecret, signal } = props
  const toast = useToast()
  const { ethDepositedGroup, nftSoldGroup, refreshGroups } = useSemaphore()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    refreshGroups()
  }, [refreshGroups])

  const handleConfirmSecret = () => {
    setLoading(true)

    const identity = new Identity(secret)

    const group = signal === Signal.BUYER_BUY_AND_CLAIM_NFT ? ethDepositedGroup : nftSoldGroup

    if (!group) {
      setLoading(false)
      return
    }

    generateProof(identity, group, group.id, signal)
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
      .finally(() => {
        setLoading(false)
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
          <Button onClick={handleConfirmSecret} ml={2} disabled={props.semaphoreId !== undefined || loading} isLoading={loading}>
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
            Semaphore Identity verified successfully with secret: <br /> {secret}
          </Alert>
        )}
      </Flex>
    </div>
  )
}
