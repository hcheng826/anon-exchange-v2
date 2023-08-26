import React from 'react'
import { Button, Table, Thead, Tr, Th, Tbody, Td } from '@chakra-ui/react'
import { NftListing } from 'context/AnonExchangeContext'

interface Props {
  nfts?: NftListing[]
  statusAction?: Record<
    NftListing['status'],
    {
      displayAction?: string
      buttonProps?: React.ComponentProps<typeof Button>
    }
  >
}

export function NftList(props: Props) {
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
            <Td>
              {props.statusAction && props.statusAction[nft.status] ? (
                <Button
                  size="sm"
                  {...props.statusAction[nft.status].buttonProps} // Spread the button props here
                >
                  {props.statusAction[nft.status].displayAction ?? nft.status}
                </Button>
              ) : (
                nft.status // If no matching action is provided, just display the status.
              )}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  )
}
