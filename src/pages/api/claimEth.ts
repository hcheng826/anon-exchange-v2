import type { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'
import { anonExchangeABI, anonExchangeAddress } from 'abis'
import { decodeError } from 'ethers-decode-error'
import { localhost } from 'viem/chains'
import { sepolia } from 'wagmi'

export default async function claimEth(req: NextApiRequest, res: NextApiResponse) {
  const { fullProof, recipient, chain } = req.body

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

  if (chain.id === localhost.id) {
    if (!process.env.LOCAL_RELAYER_PRIVATE_KEY) {
      res.status(500).json({ message: 'env var not set' })
      return
    }
    relayerPk = process.env.LOCAL_RELAYER_PRIVATE_KEY
  } else {
    if (!process.env.RELAYER_PRIVATE_KEY) {
      res.status(500).json({ message: 'env var not set' })
      return
    }
    relayerPk = process.env.RELAYER_PRIVATE_KEY
  }

  const relayer = new ethers.Wallet(relayerPk, new ethers.providers.JsonRpcProvider(chain.rpcUrls.default.http[0]))

  const anonExchangeAddr = anonExchangeAddress[chain.id as keyof typeof anonExchangeAddress]
  const anonExchange = new ethers.Contract(anonExchangeAddr, anonExchangeABI, relayer)

  try {
    await anonExchange.callStatic.claimETH(recipient, {
      merkleTreeRoot: fullProof.merkleTreeRoot,
      nullifierHash: fullProof.nullifierHash,
      proof: fullProof.proof,
    })

    const tx = await anonExchange.claimETH(recipient, {
      merkleTreeRoot: fullProof.merkleTreeRoot,
      nullifierHash: fullProof.nullifierHash,
      proof: fullProof.proof,
    })
    const rc = await tx.wait()
    res.status(200).json({ tx_hash: rc.transactionHash })
    return
  } catch (e) {
    const err = decodeError(e)

    let errorMsg = ''
    if (err.error === '0x948d0674') {
      errorMsg = 'Semaphore Id has been used'
    } else {
      errorMsg = 'Unknown error'
    }

    res.status(400).json({ message: errorMsg })
    return
  }
}
