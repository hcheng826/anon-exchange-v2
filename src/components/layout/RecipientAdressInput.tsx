import { Heading, Text, Input } from '@chakra-ui/react'
import { Dispatch, SetStateAction, useState } from 'react'

interface Props {
  recipient: string
  setRecipient: Dispatch<SetStateAction<string>>
}

export function RecipientAdressInput(props: Props) {
  return (
    <div>
      <Heading as="h2" fontSize="2xl" my={4}>
        Recipient Address
      </Heading>

      <Text>Input the recipient address for the asset</Text>
      <Input type="text" placeholder="Enter the recipient address..." value={props.recipient} onChange={(e) => props.setRecipient(e.target.value)} />
    </div>
  )
}
