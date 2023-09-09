import { useContractWrite, usePrepareContractWrite, useWaitForTransaction, Address, Chain, useContractRead, useAccount } from 'wagmi'
import { Alert, AlertDescription, AlertIcon, AlertTitle, Button, Link, Text } from '@chakra-ui/react'
import { anonExchangeAddress, simpleNftABI, simpleNftAddress } from 'abis'

export function ApproveAllNFT({ chain }: { chain: Chain }) {
  const simpleNftAddr = simpleNftAddress[chain.id as keyof typeof simpleNftAddress]
  const anonExchangeAddr = anonExchangeAddress[chain.id as keyof typeof anonExchangeAddress]
  const { address } = useAccount()

  const { data: isApprovedForAll } = useContractRead({
    address: simpleNftAddr,
    abi: simpleNftABI,
    functionName: 'isApprovedForAll',
    args: [address || '0x', anonExchangeAddr],
    watch: true,
  })

  const prepareSetApproveForAll = usePrepareContractWrite({
    address: simpleNftAddr,
    abi: simpleNftABI,
    functionName: 'setApprovalForAll',
    args: [anonExchangeAddr, true],
  })

  const setApproveForAllWrite = useContractWrite(prepareSetApproveForAll.config)
  const waitForTransaction = useWaitForTransaction({ hash: setApproveForAllWrite.data?.hash })

  const handleSendTransation = () => {
    setApproveForAllWrite.write?.()
  }

  return isApprovedForAll ? (
    <></>
  ) : (
    <div>
      {!setApproveForAllWrite.write && <p>Please connect to Sepolia testnet</p>}
      <Button
        width="full"
        disabled={waitForTransaction.isLoading || setApproveForAllWrite.isLoading || !setApproveForAllWrite.write}
        isLoading={waitForTransaction.isLoading}
        mt={4}
        onClick={handleSendTransation}>
        {waitForTransaction.isLoading
          ? 'Approving NFT...'
          : setApproveForAllWrite.isLoading
          ? 'Check your wallet'
          : 'Approve All Test NFT to Anon Exchange'}
      </Button>
      {waitForTransaction.isSuccess && (
        <Alert status="success" mt={2}>
          <AlertIcon />
          <AlertTitle>Successfully Approved NFT!</AlertTitle>
          <AlertDescription>
            <Text>
              <Link href={`${chain?.blockExplorers?.default.url}/tx/${setApproveForAllWrite.data?.hash}`} isExternal>
                Check on block explorer
              </Link>
            </Text>
          </AlertDescription>
        </Alert>
      )}
      {waitForTransaction.isError && (
        <Alert status="error" mt={2}>
          <AlertIcon />
          <AlertTitle>Error approving NFT</AlertTitle>
          <AlertDescription>
            <Text>{waitForTransaction.error?.message}</Text>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
