import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction, useNetwork, Address, Chain, useContractRead } from 'wagmi'
import { Button, Heading, Text, Flex, Input, Table, Thead, Tr, Th, Tbody, Td, InputGroup, InputLeftAddon } from '@chakra-ui/react'
import { NextSeo } from 'next-seo'
import { LinkComponent } from 'components/layout/LinkComponent'
import { anonExchangeABI, anonExchangeAddress, simpleNftABI, simpleNftAddress } from 'abis'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Identity } from '@semaphore-protocol/identity'
import { ethers } from 'ethers'
import { SemaphoreIdentityGenerate } from 'components/SemaphoreIdentityGenerate'
import { HeadingComponent } from 'components/layout/HeadingComponent'

export type Deposit = {
  date: Date
  semaphoreId: string // replace with Semaphore Identity TypeemaphoreId
}

interface DepositEthProps {
  chain: Chain
  // setDeposits: Dispatch<SetStateAction<Deposit[]>>
  semaphoreId: Identity
  setSemaphoreId: Dispatch<SetStateAction<Identity | undefined>>
  refreshSecret: () => void
}

export function DepositETH(props: DepositEthProps) {
  const { chain, semaphoreId, setSemaphoreId, refreshSecret } = props
  const { data: nftPrice } = useContractRead({
    address: anonExchangeAddress[chain.id as keyof typeof anonExchangeAddress],
    abi: anonExchangeABI,
    functionName: 'NFT_PRICE',
  })

  const prepareContractWrite = usePrepareContractWrite({
    address: anonExchangeAddress[chain.id as keyof typeof anonExchangeAddress],
    abi: anonExchangeABI,
    functionName: 'depositETH',
    value: nftPrice || BigInt(0),
    args: [semaphoreId.getCommitment()],
  })

  const contractWrite = useContractWrite(prepareContractWrite.config)
  const waitForTransaction = useWaitForTransaction({ hash: contractWrite.data?.hash })

  const handleSendTransation = () => {
    contractWrite.write?.()
  }

  useEffect(() => {
    if (waitForTransaction.isSuccess) {
      // setDeposits((prevDeposits) => [
      //   ...prevDeposits,
      //   {
      //     date: new Date(),
      //     semaphoreId: semaphoreId.getCommitment().toString(),
      //   },
      // ])
      setSemaphoreId(undefined)
      refreshSecret()
    }
  }, [semaphoreId, waitForTransaction.isSuccess, setSemaphoreId, refreshSecret])

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
