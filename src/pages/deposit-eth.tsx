import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction, useNetwork, Address, Chain } from 'wagmi'
import { Button, Heading, Text, Flex, Input, Table, Thead, Tr, Th, Tbody, Td, InputGroup, InputLeftAddon } from '@chakra-ui/react'
import { NextSeo } from 'next-seo'
import { LinkComponent } from 'components/layout/LinkComponent'
import { anonExchangeABI, anonExchangeAddress, simpleNftABI, simpleNftAddress } from 'abis'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Identity } from '@semaphore-protocol/identity'
import { ethers } from 'ethers'
import { SemaphoreIdentityGenerate } from 'components/SemaphoreIdentityGenerate'
import { HeadingComponent } from 'components/layout/HeadingComponent'
import { Deposit, DepositETH } from 'components/DepositEthButton'
import { v4 as uuidv4 } from 'uuid'

export default function DepositEth() {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()

  // TODO: initialize NFT list from localStorage
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [semaphoreId, setSemaphoreId] = useState<Identity>()
  const [secret, setSecret] = useState(uuidv4())

  function refreshSecret() {
    setSecret(uuidv4())
  }

  if (isConnected && address && chain) {
    return (
      <div>
        <NextSeo title="Deposit ETH" />

        <HeadingComponent as="h2">Deposit ETH</HeadingComponent>

        <SemaphoreIdentityGenerate semaphoreId={semaphoreId} setSemaphoreId={setSemaphoreId} secret={secret} refreshSecret={refreshSecret} />

        <Heading as="h2" fontSize="2xl" my={4}>
          Deposit ETH
        </Heading>

        {semaphoreId ? (
          <DepositETH
            chain={chain}
            setDeposits={setDeposits}
            semaphoreId={semaphoreId}
            setSemaphoreId={setSemaphoreId}
            refreshSecret={refreshSecret}
          />
        ) : (
          <Button disabled={true}>Please generate Semaphore Id first</Button>
        )}

        <Heading as="h2" fontSize="1xl" my={4}>
          Deposit Records
        </Heading>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Semaphore Id Commitment</Th>
            </Tr>
          </Thead>
          <Tbody>
            {deposits.map((deposit, idx) => (
              <Tr key={idx}>
                <Td>{deposit.date.toUTCString()}</Td>
                <Td>{deposit.semaphoreId.toString()}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    )
  }

  return <div>Connect your wallet first to deposit ETH.</div>
}
