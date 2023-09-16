import type { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'
import { anonExchangeABI, anonExchangeAddress } from 'abis'
import { decodeError } from 'ethers-decode-error'
import { localhost } from 'viem/chains'
import { sepolia } from 'wagmi'
import { chainInUse } from 'utils/config'

export default async function buyNft(req: NextApiRequest, res: NextApiResponse) {
  const { nft, fullProof, recipient } = req.body

  // Approach 1: OpenZeppelin relayer (tx often stuck: https://forum.openzeppelin.com/t/ethereum-goerli-testnet-relayer-stuck/36929)

  // if (!process.env.NEXT_OZ_RELAY_API_KEY || !process.env.NEXT_OZ_RELAY_API_SECRET) {
  //   console.error('NEXT_OZ_RELAY_API_KEY or NEXT_OZ_RELAY_API_SECRET undefined')
  //   res.status(500).json({ message: 'env var not set' })
  //   return
  // }

  // const credentials = { apiKey: process.env.OZ_RELAY_API_KEY, apiSecret: process.env.NEXT_OZ_RELAY_API_SECRET }
  // const provider = new DefenderRelayProvider(credentials)
  // const relayer = new DefenderRelaySigner(credentials, provider, { speed: 'fastest' })

  // Approach 2: put relayer pk as env var

  let relayerPk = ''

  if (chainInUse.id === localhost.id) {
    if (!process.env.LOCAL_RELAYER_PRIVATE_KEY) {
      res.status(500).json({ message: 'env var not set' })
      return
    }
    relayerPk = process.env.LOCAL_RELAYER_PRIVATE_KEY
  } else if (chainInUse.id === sepolia.id) {
    if (!process.env.SEPOLOA_RELAYER_PRIVATE_KEY) {
      res.status(500).json({ message: 'env var not set' })
      return
    }
    relayerPk = process.env.SEPOLOA_RELAYER_PRIVATE_KEY
  } else {
    res.status(500).json({ message: 'unsupported chain' })
    return
  }

  const relayer = new ethers.Wallet(relayerPk, new ethers.providers.JsonRpcProvider(chainInUse.rpcUrls.default.http[0]))

  const anonExchangeAddr = anonExchangeAddress[chainInUse.id as keyof typeof anonExchangeAddress]
  const anonExchange = new ethers.Contract(anonExchangeAddr, anonExchangeABI, relayer)

  try {
    await anonExchange.callStatic.buyAndClaimNFT(
      nft.contractAddress,
      nft.tokenId,
      fullProof.merkleTreeRoot,
      fullProof.nullifierHash,
      fullProof.proof,
      recipient
    )

    const tx = await anonExchange.buyAndClaimNFT(
      nft.contractAddress,
      nft.tokenId,
      fullProof.merkleTreeRoot,
      fullProof.nullifierHash,
      fullProof.proof,
      recipient
    )
    const rc = await tx.wait()
    res.status(200).json({ tx_hash: rc.transactionHash })
    return
  } catch (e) {
    const err = decodeError(e)
    console.log(err)

    let errorMsg = ''
    if (err.error === 'ERC721: transfer to non ERC721Receiver implementer') {
      errorMsg = 'Invalid recipient address (non ERC721Receiver implementer)'
    } else if (err.error === '0x948d0674') {
      errorMsg = 'Semaphore Id has been used'
    } else {
      errorMsg = 'Unknown error'
    }

    res.status(400).json({ message: errorMsg })
    return
  }
}
