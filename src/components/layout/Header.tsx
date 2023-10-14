import React from 'react'
import { Flex, useColorModeValue, Spacer, Heading, Button } from '@chakra-ui/react'
import { SITE_NAME } from 'utils/config'
import { LinkComponent } from './LinkComponent'
import { ThemeSwitcher } from './ThemeSwitcher'
import { PassportScore } from './PassportScore'
import { Web3Button } from '@web3modal/react'
import { useWeb3Auth } from 'providers/SafeWeb3AuthProvider'

interface Props {
  className?: string
}

export function Header(props: Props) {
  const className = props.className ?? ''
  const { isInitialized, isConnected, handleSignIn } = useWeb3Auth()

  return (
    <Flex as="header" className={className} bg={useColorModeValue('gray.100', 'gray.900')} px={4} py={2} mb={8} alignItems="center">
      <LinkComponent href="/">
        <Heading as="h1" size="md">
          {SITE_NAME}
        </Heading>
      </LinkComponent>

      <Spacer />

      <Flex alignItems="center" px={4}>
        <LinkComponent href="/list-nft">
          <Heading as="h1" size="ms">
            List NFT
          </Heading>
        </LinkComponent>
      </Flex>

      <Flex alignItems="center" px={4}>
        <LinkComponent href="/deposit-eth">
          <Heading as="h3" size="ms">
            Deposit ETH
          </Heading>
        </LinkComponent>
      </Flex>

      <Flex alignItems="center" px={4}>
        <LinkComponent href="/buy-nft">
          <Heading as="h3" size="ms">
            Buy NFT
          </Heading>
        </LinkComponent>
      </Flex>

      <Flex alignItems="center" px={4}>
        <LinkComponent href="/claim-eth">
          <Heading as="h3" size="ms">
            Claim ETH
          </Heading>
        </LinkComponent>
      </Flex>

      <Flex alignItems="center" gap={4}>
        <PassportScore />
        {isInitialized ? (
          isConnected ? (
            <Button>Connected</Button>
          ) : (
            <Button label="ConnectSafe" onClick={handleSignIn}>
              connect safe
            </Button>
          )
        ) : (
          <Button isLoading>Initializing...</Button>
        )}
      </Flex>

      <Flex alignItems="center" gap={4}>
        <ThemeSwitcher />
      </Flex>
    </Flex>
  )
}
