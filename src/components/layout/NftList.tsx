import React from 'react'
import { Button, Table, Thead, Tr, Th, Tbody, Td } from '@chakra-ui/react'

export type NftListItem = {
  contractAddress: string
  tokenId: number
  action: 'List NFT' | 'Delist NFT' | 'Sold' | 'Buy'
}

interface Props {
  nfts?: NftListItem[]
}

export function NftList(props: Props) {
  // mock data
  if (props.nfts?.length === 0) {
    props.nfts.push({
      contractAddress: '0x123',
      tokenId: 1,
      action: 'Sold',
    })

    props.nfts.push({
      contractAddress: '0x123',
      tokenId: 1,
      action: 'List NFT',
    })
  }

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
              <Button colorScheme="blue" size="sm">
                {/* onClick List NFT: prompt user to sign message on nft addr + token id to generate semaphore id */}
                {/* onClick Delist NFT: send tx directly */}
                {/* onClick Buy NFT: sign message and send to relayer */}
                {/* disable Sold*/}
                {nft.action}
              </Button>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  )
}
