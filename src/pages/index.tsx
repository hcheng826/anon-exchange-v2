import { Text } from '@chakra-ui/react'
import { CardList } from 'components/layout/CardList'
import { Head } from 'components/layout/Head'
import { HeadingComponent } from 'components/layout/HeadingComponent'
import React from 'react'
import EtherIcon from 'assets/icons/ethereum.png'
import NFTIcon from 'assets/icons/nft.png'
import CartIcon from 'assets/icons/cart.png'
import WithdrawIcon from 'assets/icons/withdraw.png'

export const OperationItems = [
  {
    title: 'List Asset',
    description: 'Sellers can mint test asset for import their own asset or to list it on the exchange',
    image: NFTIcon.src,
    url: '/list-asset',
  },
  {
    title: 'Deposit ETH',
    description: 'NFT buyers deposit ETH to be eligible for purchasing NFTs',
    image: EtherIcon.src,
    url: '/deposit-eth',
  },
  {
    title: 'Buy Asset',
    description: 'With the secret associated with a valid ETH deposit, buyer can buy Asset and receive it at a desired address',
    image: CartIcon.src,
    url: '/buy-asset',
  },
  {
    title: 'Seller Claim ETH',
    description:
      'With the secret associated with a valid asset listing and after the asset is sold. Seller can claim the ETH and receive it at a desired address',
    image: WithdrawIcon.src,
    url: '/claim-eth',
  },
]

export default function Home() {
  return (
    <>
      <Head />

      <main>
        <HeadingComponent as="h2">Anon Exchange</HeadingComponent>
        <Text>An anonomyous NFT exchange based on Semaphore protocol</Text>
        <br />
        <CardList title="Operations" items={OperationItems} />
      </main>
    </>
  )
}
