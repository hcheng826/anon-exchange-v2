import React from 'react'
import { Button, Table, Thead, Tr, Th, Tbody, Td } from '@chakra-ui/react'
import { Listing, ListingStatus } from 'context/AnonExchangeContext'
import { Chain } from 'wagmi'
import { Identity } from '@semaphore-protocol/identity'

interface Props {
  nfts?: Listing[]
  statusAction?: Record<
    Listing['status'],
    {
      renderButton?: (
        nft: Listing,
        chain: Chain,
        identity?: Identity,
        updateListingStatus?: (nft: Listing, newStatus: ListingStatus) => void
      ) => JSX.Element
    }
  >
  chain: Chain
  identity?: Identity
  updateListingStatus?: (nft: Listing, newStatus: ListingStatus) => void
}

export function NftList(props: Props) {
  const defaultRenderButton = (nft: Listing) => <Button>{nft.status}</Button>

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
              <Td>{renderButton ? renderButton(nft, props.chain, props.identity, props.updateListingStatus) : defaultRenderButton(nft)}</Td>
            </Tr>
          )
        })}
      </Tbody>
    </Table>
  )
}
