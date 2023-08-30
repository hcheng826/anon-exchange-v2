import React from 'react'
import { Button, Table, Thead, Tr, Th, Tbody, Td } from '@chakra-ui/react'
import { NftListing } from 'context/AnonExchangeContext'
import { Chain } from 'wagmi'
import { Identity } from '@semaphore-protocol/identity'

interface Props {
  nfts?: NftListing[]
  statusAction?: Record<
    NftListing['status'],
    {
      renderButton?: (nft: NftListing, chain: Chain, identity: Identity) => JSX.Element
    }
  >
  chain: Chain
  identity?: Identity
}

export function NftList(props: Props) {
  const defaultRenderButton = (nft: NftListing) => <Button>{nft.status}</Button>

  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>NFT Address</Th>
          <Th>Token ID</Th>
          <Th>Action</Th>
        </Tr>
      </Thead>
      <Tbody>
        {props.nfts?.map((nft, idx) => {
          const renderButton = props.statusAction?.[nft.status]?.renderButton
          return (
            <Tr key={idx}>
              <Td>{nft.contractAddress}</Td>
              <Td>{nft.tokenId}</Td>
              <Td>
                {props.identity ? (
                  renderButton ? (
                    renderButton(nft, props.chain, props.identity)
                  ) : (
                    defaultRenderButton(nft)
                  )
                ) : (
                  <Button disabled={true}>Please generate Semaphore Id first</Button>
                )}
              </Td>
            </Tr>
          )
        })}
      </Tbody>
    </Table>
  )
}
