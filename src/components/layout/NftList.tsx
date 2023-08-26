import React from 'react'
import { Button, Table, Thead, Tr, Th, Tbody, Td } from '@chakra-ui/react'
import { NftListing } from 'context/AnonExchangeContext'

interface Props {
  nfts?: NftListing[]
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
              <Button colorScheme="blue" size="sm">
                {/* onClick List NFT: prompt user to sign message on nft addr + token id to generate semaphore id */}
                {/* onClick Delist NFT: send tx directly */}
                {/* onClick Buy NFT: sign message and send to relayer */}
                {/* disable Sold*/}
                {nft.status}
              </Button>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  )
}
