import { useContractWrite, usePrepareContractWrite, useWaitForTransaction, Chain, useContractRead } from 'wagmi'
import { Button, Text } from '@chakra-ui/react'

import { LinkComponent } from 'components/layout/LinkComponent'
import { anonExchangeABI, anonExchangeAddress } from 'abis'
import { Dispatch, SetStateAction, useEffect } from 'react'
import { Identity } from '@semaphore-protocol/identity'

export type Deposit = {
  date: Date
  semaphoreId: string
}

interface DepositEthProps {
  chain: Chain
  semaphoreId: Identity
  setSemaphoreId: Dispatch<SetStateAction<Identity | undefined>>
  refreshSecret: () => void
}

export function DepositETH(props: DepositEthProps) {
  const { chain, semaphoreId, setSemaphoreId, refreshSecret } = props
  const { data: price } = useContractRead({
    address: anonExchangeAddress[chain.id as keyof typeof anonExchangeAddress],
    abi: anonExchangeABI,
    functionName: 'LISTING_PRICE',
  })

  const prepareContractWrite = usePrepareContractWrite({
    address: anonExchangeAddress[chain.id as keyof typeof anonExchangeAddress],
    abi: anonExchangeABI,
    functionName: 'depositETH',
    value: price || BigInt(0),
    args: [semaphoreId.getCommitment()],
    chainId: chain.id,
  })

  const contractWrite = useContractWrite(prepareContractWrite.config)
  const waitForTransaction = useWaitForTransaction({ hash: contractWrite.data?.hash })

  const handleSendTransation = () => {
    contractWrite.write?.()
  }

  useEffect(() => {
    if (waitForTransaction.isSuccess) {
      // setSemaphoreId(undefined)
      // refreshSecret()
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
