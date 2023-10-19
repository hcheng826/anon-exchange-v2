import React from 'react'
import { Button, Table, Thead, Tr, Th, Tbody, Td } from '@chakra-ui/react'
import { Listing, AssetStatus } from 'context/AnonExchangeContext'
import { Chain } from 'wagmi'
import { Identity } from '@semaphore-protocol/identity'

interface Props {
  assets?: Listing[]
  statusAction?: Record<
    Listing['status'],
    {
      renderButton?: (
        asset: Listing,
        chain: Chain,
        identity?: Identity,
        updateListingStatus?: (asset: Listing, newStatus: AssetStatus) => void
      ) => JSX.Element
    }
  >
  chain: Chain
  identity?: Identity
  updateListingStatus?: (asset: Listing, newStatus: AssetStatus) => void
}

export function Listings(props: Props) {
  const defaultRenderButton = (asset: Listing) => <Button>{asset.status}</Button>

  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Asset Type</Th>
          <Th>Contract Address</Th>
          <Th>Token ID</Th>
          <Th>Amount</Th>
          <Th>Action</Th>
        </Tr>
      </Thead>
      <Tbody>
        {props.assets?.map((asset, idx) => {
          const renderButton = props.statusAction?.[asset.status]?.renderButton
          return (
            <Tr key={idx}>
              <Td>{asset.listingType}</Td>
              <Td>{asset.contractAddress}</Td>
              <Td>{asset.tokenId}</Td>
              <Td>{asset.amount}</Td>
              <Td>{renderButton ? renderButton(asset, props.chain, props.identity, props.updateListingStatus) : defaultRenderButton(asset)}</Td>
            </Tr>
          )
        })}
      </Tbody>
    </Table>
  )
}
