import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction, useNetwork, Address, Chain } from 'wagmi'
import { Button, Heading, Text, Flex, Input, Table, Thead, Tr, Th, Tbody, Td, InputGroup, InputLeftAddon } from '@chakra-ui/react'
import { NextSeo } from 'next-seo'
import { LinkComponent } from 'components/layout/LinkComponent'
import { anonExchangeABI, anonExchangeAddress, simpleNftABI, simpleNftAddress } from 'abis'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Identity } from '@semaphore-protocol/identity'
import { ethers } from 'ethers'
import { SemaphoreIdentitySecretInput } from 'components/layout/SemaphoreIdentitySecretInput'
import { HeadingComponent } from 'components/layout/HeadingComponent'

type Deposit = {
  date: Date
  semaphoreId: string // replace with Semaphore Identity Type
}

function DepositETH({ chain, setDeposits }: { chain: Chain; setDeposits: Dispatch<SetStateAction<Deposit[]>> }) {
  // sign message "user-addr+nonce" to generate semaphore id
  const prepareContractWrite = usePrepareContractWrite({
    address: anonExchangeAddress[chain.id as keyof typeof anonExchangeAddress],
    abi: anonExchangeABI,
    functionName: 'depositETH',
    value: ethers.utils.parseEther('0.1').toBigInt(),
    args: [BigInt(0)],
  })

  const contractWrite = useContractWrite(prepareContractWrite.config)
  const waitForTransaction = useWaitForTransaction({ hash: contractWrite.data?.hash })

  const handleSendTransation = () => {
    contractWrite.write?.()
  }

  useEffect(() => {
    if (waitForTransaction.isSuccess) {
      // Execute your logic here
      setDeposits((prevDeposits) => [
        ...prevDeposits,
        {
          date: new Date(),
          semaphoreId: '123',
        },
      ])
    }
  }, [setDeposits, waitForTransaction.isSuccess])

  return (
    <div>
      {!contractWrite.write && <p>Please connect to Sepolia testnet</p>}
      <Button
        width="full"
        disabled={waitForTransaction.isLoading || contractWrite.isLoading || !contractWrite.write}
        mt={4}
        onClick={handleSendTransation}>
        {waitForTransaction.isLoading ? 'Depositing ETH...' : contractWrite.isLoading ? 'Check your wallet' : 'Deposit 0.01 ETH'}
      </Button>
      {waitForTransaction.isSuccess && (
        <div>
          <Text mt={2} fontSize="lg">
            Successfully Deposited ETH!
          </Text>
          <Text fontSize="lg" fontWeight="bold">
            <LinkComponent href={`${chain?.blockExplorers?.default.url}/tx/${contractWrite.data?.hash}`}>Check on block explorer</LinkComponent>
          </Text>
        </div>
      )}
      {waitForTransaction.isError && (
        <div>
          <Text mt={2} color="red" fontSize="lg">
            Error deposited ETH
          </Text>
          <Text color="red" fontSize="lg" fontWeight="bold">
            {waitForTransaction.error?.message}
          </Text>
        </div>
      )}
    </div>
  )
}

export default function DepositEth() {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()

  // TODO: initialize NFT list from localStorage
  const [deposits, setDeposits] = useState<Deposit[]>([])

  if (isConnected && address && chain) {
    return (
      <div>
        <NextSeo title="Deposit ETH" />

        <HeadingComponent as="h2">Deposit ETH</HeadingComponent>

        <SemaphoreIdentitySecretInput />

        <Heading as="h2" fontSize="2xl" my={4}>
          Deposit ETH
        </Heading>

        {/* TODO: pass in deposits array and add to the list when deposit is successful */}
        <DepositETH chain={chain} setDeposits={setDeposits} />

        <Heading as="h2" fontSize="1xl" my={4}>
          Deposit Records
        </Heading>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Semaphore Id</Th>
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
