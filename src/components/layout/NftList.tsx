import React from 'react'
import { Button, Table, Thead, Tr, Th, Tbody, Td } from '@chakra-ui/react'
import { NftListing } from 'context/AnonExchangeContext'

interface Props {
  nfts?: NftListing[]
  statusAction?: Record<
    NftListing['status'],
    {
      displayAction?: string
      renderButton?: (nft: NftListing) => JSX.Element
    }
  >
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
        {props.nfts?.map((nft, idx) => (
          <Tr key={idx}>
            <Td>{nft.contractAddress}</Td>
            <Td>{nft.tokenId}</Td>
            <Td>{(props.statusAction?.[nft.status]?.renderButton || defaultRenderButton)(nft)}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  )
}
