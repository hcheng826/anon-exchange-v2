import { expect } from 'chai'
import { ethers, run } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Identity } from '@semaphore-protocol/identity'
import { generateProof } from '@semaphore-protocol/proof'
import { Group } from '@semaphore-protocol/group'
import { AnonExchange, SimpleNFT, ISemaphore } from '../typechain-types'
import path from 'path'

describe('anonExchange', () => {
  let semaphore: ISemaphore
  let anonExchange: AnonExchange
  let simpleNFT: SimpleNFT
  let deployer: SignerWithAddress
  let accounts: SignerWithAddress[]

  const sellerIdentity = new Identity()
  const buyerIdentity = new Identity()

  const NFT_SOLD_GROUP_ID = 1
  const ETH_DEPOSITED_GROUP_ID = 2

  const BUYER_BUY_AND_CLAIM_NFT_SIGNAL = 1
  const SELLER_CLAIM_ETH_SIGNAL = 2

  const nftSoldGroup = new Group(NFT_SOLD_GROUP_ID, 20)
  const ethDepositedGroup = new Group(ETH_DEPOSITED_GROUP_ID, 20)

  const wasmFilePath = path.join(__dirname, './semaphore/semaphore.wasm')
  const zkeyFilePath = path.join(__dirname, './semaphore/semaphore.zkey')

  before(async () => {
    const anonExchangeFactory = await ethers.getContractFactory('AnonExchange')
    ;[deployer, ...accounts] = await ethers.getSigners()

    const semaphoreDeployment = await run('deploy:semaphore')
    semaphore = semaphoreDeployment.semaphore
    anonExchange = await anonExchangeFactory.deploy(semaphore.address)
    await anonExchange.deployed()

    const simpleNFTFactory = await ethers.getContractFactory('SimpleNFT')
    simpleNFT = await simpleNFTFactory.deploy()
  })

  it('Should properly deploy the contract', async () => {
    expect(anonExchange.address).to.not.equal('')
  })

  it('seller can list NFT', async () => {
    const tokenId = 0
    await simpleNFT.connect(deployer).safeMint(accounts[0].address)
    await simpleNFT.connect(accounts[0]).approve(anonExchange.address, tokenId)

    await anonExchange.connect(accounts[0]).listNFT(simpleNFT.address, tokenId, sellerIdentity.commitment)

    const deposit = await anonExchange.nftListingRecords(simpleNFT.address, tokenId)
    expect(deposit.sellerAddr).to.equal(accounts[0].address)
    expect(deposit.idCommitment.toString()).to.equal(sellerIdentity.commitment.toString())
  })

  it('buyer can deposit ETH', async () => {
    const depositAmount = ethers.utils.parseEther('0.1')

    await anonExchange.connect(accounts[1]).depositETH(buyerIdentity.commitment, {
      value: depositAmount,
    })

    ethDepositedGroup.addMember(buyerIdentity.commitment)

    const ethDeposit = await anonExchange.ethDepositRecords(accounts[1].address)
    expect(ethDeposit).to.equal(buyerIdentity.commitment.toString())
  })

  it('buyer can buy and claim NFT', async () => {
    const tokenId = 0
    const nftRecipient = accounts[2]
    const fullProof = await generateProof(buyerIdentity, ethDepositedGroup, ethDepositedGroup.id, BUYER_BUY_AND_CLAIM_NFT_SIGNAL, {
      wasmFilePath,
      zkeyFilePath,
    })

    await anonExchange
      .connect(accounts[0])
      .buyAndClaimNFT(simpleNFT.address, tokenId, fullProof.merkleTreeRoot, fullProof.nullifierHash, fullProof.proof, nftRecipient.address)

    nftSoldGroup.addMember(sellerIdentity.commitment)

    expect(await simpleNFT.ownerOf(tokenId)).to.equal(nftRecipient.address)
  })

  it('NFT seller can claim ETH after NFT sold', async () => {
    const ethRecipient = accounts[3]
    const initBalance = await ethRecipient.getBalance()
    const fullProof = await generateProof(sellerIdentity, nftSoldGroup, nftSoldGroup.id, SELLER_CLAIM_ETH_SIGNAL, {
      wasmFilePath,
      zkeyFilePath,
    })

    await anonExchange.connect(accounts[0]).claimETH(ethRecipient.address, fullProof.merkleTreeRoot, fullProof.nullifierHash, fullProof.proof)

    const finalBalance = await ethRecipient.getBalance()
    expect(finalBalance.sub(initBalance)).to.eq(ethers.utils.parseEther('0.1'))
  })

  // TODO: Add more tests for each function in the contract
  // - withdrawNFT
  // - depositETH
  // - withdrawETH
  // - buyAndClaimNFT
  // - claimETH
})
