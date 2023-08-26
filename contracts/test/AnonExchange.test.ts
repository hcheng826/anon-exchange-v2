import { expect } from 'chai'
import { ethers, run } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Identity } from '@semaphore-protocol/identity'
import { generateProof } from '@semaphore-protocol/proof'
import { Group } from '@semaphore-protocol/group'
import { AnonExchange, SimpleNFT, ISemaphore } from '../typechain-types'
import { config } from '../package.json'
import { BigNumber } from 'ethers'

describe('anonExchange', () => {
  let semaphore: ISemaphore
  let anonExchange: AnonExchange
  let simpleNFT: SimpleNFT
  let deployer: SignerWithAddress
  let accounts: SignerWithAddress[]

  let nftPrice: BigNumber

  const sellerIdentity = new Identity()
  const buyerIdentity = new Identity()

  const NFT_SOLD_GROUP_ID = 1
  const ETH_DEPOSITED_GROUP_ID = 2

  const BUYER_WITHDRAW_UNSPENT_ETH_SIGNAL = 0
  const BUYER_BUY_AND_CLAIM_NFT_SIGNAL = 1
  const SELLER_CLAIM_ETH_SIGNAL = 2

  const nftSoldGroup = new Group(NFT_SOLD_GROUP_ID, 20)
  const ethDepositedGroup = new Group(ETH_DEPOSITED_GROUP_ID, 20)

  const wasmFilePath = `${config.paths['snark-artifacts']}/semaphore.wasm`
  const zkeyFilePath = `${config.paths['snark-artifacts']}/semaphore.zkey`

  before(async () => {
    const anonExchangeFactory = await ethers.getContractFactory('AnonExchange')
    ;[deployer, ...accounts] = await ethers.getSigners()

    const semaphoreDeployment = await run('deploy:semaphore')
    semaphore = semaphoreDeployment.semaphore
    anonExchange = await anonExchangeFactory.deploy(semaphore.address)
    await anonExchange.deployed()

    nftPrice = await anonExchange.NFT_PRICE()
    const simpleNFTFactory = await ethers.getContractFactory('SimpleNFT')
    simpleNFT = await simpleNFTFactory.deploy()
  })

  it('Should properly deploy the contract', async () => {
    expect(anonExchange.address).to.not.equal('')
  })

  let tokenId: BigNumber
  it('seller can list NFT', async () => {
    tokenId = await simpleNFT._tokenIdCounter()
    await simpleNFT.connect(deployer).safeMint(accounts[0].address)
    await simpleNFT.connect(accounts[0]).approve(anonExchange.address, tokenId)

    await anonExchange.connect(accounts[0]).listNFT(simpleNFT.address, tokenId, sellerIdentity.commitment)

    const deposit = await anonExchange.nftListingRecords(simpleNFT.address, tokenId)
    expect(deposit.sellerAddr).to.equal(accounts[0].address)
    expect(deposit.idCommitment.toString()).to.equal(sellerIdentity.commitment.toString())
  })

  it('buyer can deposit ETH', async () => {
    const depositAmount = nftPrice

    const contractBalBefore = await ethers.provider.getBalance(anonExchange.address)
    await anonExchange.connect(accounts[1]).depositETH(buyerIdentity.commitment, {
      value: depositAmount,
    })
    ethDepositedGroup.addMember(buyerIdentity.commitment)
    const contractBalAfter = await ethers.provider.getBalance(anonExchange.address)

    expect(contractBalAfter.sub(contractBalBefore)).eq(depositAmount)
  })

  it('buyer can buy and claim NFT', async () => {
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
    expect(finalBalance.sub(initBalance)).to.eq(nftPrice)
  })

  it('seller can list NFT and delist NFT', async () => {
    const tokenId = await simpleNFT._tokenIdCounter()
    await simpleNFT.connect(deployer).safeMint(accounts[0].address)
    await simpleNFT.connect(accounts[0]).approve(anonExchange.address, tokenId)

    await anonExchange.connect(accounts[0]).listNFT(simpleNFT.address, tokenId, sellerIdentity.commitment)

    const nftListing = await anonExchange.nftListingRecords(simpleNFT.address, tokenId)
    expect(nftListing.sellerAddr).to.equal(accounts[0].address)
    expect(nftListing.idCommitment.toString()).to.equal(sellerIdentity.commitment.toString())

    await anonExchange.connect(accounts[0]).delistNFT(simpleNFT.address, tokenId)
    const nftListing2 = await anonExchange.nftListingRecords(simpleNFT.address, tokenId)
    expect(nftListing2.sellerAddr).to.equal(ethers.constants.AddressZero)
    expect(nftListing2.idCommitment.toString()).to.equal('0')
    expect(await simpleNFT.ownerOf(tokenId)).to.eq(accounts[0].address)
  })

  // - buyer and depositETH and withdrawETH unspent, and cannot withdraw twice
  let depositETHProof: any
  it('buyer can deposit ETH and then withdraw unspent ETH', async () => {
    const depositAmount = nftPrice
    const depositIdentity = new Identity()

    await anonExchange.connect(accounts[1]).depositETH(depositIdentity.commitment, {
      value: depositAmount,
    })
    ethDepositedGroup.addMember(depositIdentity.commitment)

    depositETHProof = await generateProof(depositIdentity, ethDepositedGroup, ethDepositedGroup.id, BUYER_WITHDRAW_UNSPENT_ETH_SIGNAL, {
      wasmFilePath,
      zkeyFilePath,
    })

    const balBefore = await ethers.provider.getBalance(accounts[4].address)

    await anonExchange
      .connect(accounts[1])
      .withdrawETH(depositETHProof.merkleTreeRoot, depositETHProof.nullifierHash, depositETHProof.proof, accounts[4].address)

    const balAfter = await ethers.provider.getBalance(accounts[4].address)

    expect(balAfter.sub(balBefore)).to.eq(depositAmount)
  })

  it('buyer cannot withdraw unspent ETH twice', async () => {
    await expect(
      anonExchange
        .connect(accounts[1])
        .withdrawETH(depositETHProof.merkleTreeRoot, depositETHProof.nullifierHash, depositETHProof.proof, accounts[1].address)
    ).to.be.revertedWithCustomError(semaphore, 'Semaphore__YouAreUsingTheSameNillifierTwice')
  })

  // - buyAndClaimNFT cannot double spend (seller list 2 NFTs and buyer deposit once, try to call buyAndClaimNFT with same proof for diff NFT)
  it('buyer cannot double spend on different NFTs', async () => {
    const tokenId1 = await simpleNFT._tokenIdCounter()
    await simpleNFT.connect(deployer).safeMint(accounts[0].address)
    const tokenId2 = await simpleNFT._tokenIdCounter()
    await simpleNFT.connect(deployer).safeMint(accounts[0].address)

    await simpleNFT.connect(accounts[0]).approve(anonExchange.address, tokenId1)
    await simpleNFT.connect(accounts[0]).approve(anonExchange.address, tokenId2)

    const sellerIdentity1 = new Identity()
    await anonExchange.connect(accounts[0]).listNFT(simpleNFT.address, tokenId1, sellerIdentity1.commitment)

    const sellerIdentity2 = new Identity()
    await anonExchange.connect(accounts[0]).listNFT(simpleNFT.address, tokenId2, sellerIdentity2.commitment)

    const depositAmount = nftPrice
    const depositIdentity = new Identity()

    await anonExchange.connect(accounts[1]).depositETH(depositIdentity.commitment, {
      value: depositAmount,
    })
    ethDepositedGroup.addMember(depositIdentity.commitment)

    const fullProof = await generateProof(depositIdentity, ethDepositedGroup, ethDepositedGroup.id, BUYER_BUY_AND_CLAIM_NFT_SIGNAL, {
      wasmFilePath,
      zkeyFilePath,
    })

    await anonExchange
      .connect(accounts[1])
      .buyAndClaimNFT(simpleNFT.address, tokenId1, fullProof.merkleTreeRoot, fullProof.nullifierHash, fullProof.proof, accounts[2].address)
    nftSoldGroup.addMember(sellerIdentity1.commitment)

    await expect(
      anonExchange
        .connect(accounts[1])
        .buyAndClaimNFT(simpleNFT.address, tokenId2, fullProof.merkleTreeRoot, fullProof.nullifierHash, fullProof.proof, accounts[2].address)
    ).to.be.revertedWithCustomError(semaphore, 'Semaphore__YouAreUsingTheSameNillifierTwice')
  })

  // - claimETH cannot double claim (list 1 NFT, buyer buy it. Seller try to call claimETH with same proof)
  it('seller cannot double claim ETH', async () => {
    const tokenId = await simpleNFT._tokenIdCounter()
    await simpleNFT.connect(deployer).safeMint(accounts[0].address)
    await simpleNFT.connect(accounts[0]).approve(anonExchange.address, tokenId)

    const sellerIdentity = new Identity()
    await anonExchange.connect(accounts[0]).listNFT(simpleNFT.address, tokenId, sellerIdentity.commitment)

    const depositAmount = nftPrice
    const depositIdentity = new Identity()

    await anonExchange.connect(accounts[1]).depositETH(depositIdentity.commitment, {
      value: depositAmount,
    })
    ethDepositedGroup.addMember(depositIdentity.commitment)

    const fullProofBuy = await generateProof(depositIdentity, ethDepositedGroup, ethDepositedGroup.id, BUYER_BUY_AND_CLAIM_NFT_SIGNAL, {
      wasmFilePath,
      zkeyFilePath,
    })

    await anonExchange
      .connect(accounts[1])
      .buyAndClaimNFT(simpleNFT.address, tokenId, fullProofBuy.merkleTreeRoot, fullProofBuy.nullifierHash, fullProofBuy.proof, accounts[2].address)

    nftSoldGroup.addMember(sellerIdentity.commitment)

    const fullProofSell = await generateProof(sellerIdentity, nftSoldGroup, nftSoldGroup.id, SELLER_CLAIM_ETH_SIGNAL, {
      wasmFilePath,
      zkeyFilePath,
    })

    await anonExchange
      .connect(accounts[0])
      .claimETH(accounts[0].address, fullProofSell.merkleTreeRoot, fullProofSell.nullifierHash, fullProofSell.proof)

    await expect(
      anonExchange.connect(accounts[0]).claimETH(accounts[0].address, fullProofSell.merkleTreeRoot, fullProofSell.nullifierHash, fullProofSell.proof)
    ).to.be.revertedWithCustomError(semaphore, 'Semaphore__YouAreUsingTheSameNillifierTwice')
  })

  // AnonExchange reverts
  it('delistNFT reverted if not called by lister', async () => {
    const tokenId = await simpleNFT._tokenIdCounter()
    await simpleNFT.connect(deployer).safeMint(accounts[0].address)
    await simpleNFT.connect(accounts[0]).approve(anonExchange.address, tokenId)

    await anonExchange.connect(accounts[0]).listNFT(simpleNFT.address, tokenId, sellerIdentity.commitment)

    const nftListing = await anonExchange.nftListingRecords(simpleNFT.address, tokenId)
    expect(nftListing.sellerAddr).to.equal(accounts[0].address)
    expect(nftListing.idCommitment.toString()).to.equal(sellerIdentity.commitment.toString())

    await expect(anonExchange.connect(accounts[1]).delistNFT(simpleNFT.address, tokenId)).to.be.revertedWithCustomError(
      anonExchange,
      'CallerInvalidOrNftNotAvailable'
    )
  })

  it('depositETH reverted if value not NFT price', async () => {
    const depositAmount = nftPrice.mul(2)

    await ethers.provider.getBalance(anonExchange.address)
    await expect(
      anonExchange.connect(accounts[1]).depositETH(buyerIdentity.commitment, {
        value: depositAmount,
      })
    ).to.be.revertedWithCustomError(anonExchange, 'InvalidDepositAmount')
  })

  it('EthTransferFailed if withdraw to address that cannot receive eth (withdrawETH)', async () => {
    const depositAmount = nftPrice
    const depositIdentity = new Identity()

    await anonExchange.connect(accounts[1]).depositETH(depositIdentity.commitment, {
      value: depositAmount,
    })
    ethDepositedGroup.addMember(depositIdentity.commitment)

    depositETHProof = await generateProof(depositIdentity, ethDepositedGroup, ethDepositedGroup.id, BUYER_WITHDRAW_UNSPENT_ETH_SIGNAL, {
      wasmFilePath,
      zkeyFilePath,
    })

    await ethers.provider.getBalance(accounts[4].address)

    const cantReceiveEthContract = await (await ethers.getContractFactory('CannotReceiveEthContract')).deploy()

    await expect(
      anonExchange
        .connect(accounts[1])
        .withdrawETH(depositETHProof.merkleTreeRoot, depositETHProof.nullifierHash, depositETHProof.proof, cantReceiveEthContract.address)
    ).to.be.revertedWithCustomError(anonExchange, 'EthTransferFailed')
  })

  it('EthTransferFailed if withdraw to address that cannot receive eth (claimETH)', async () => {
    const tokenId = await simpleNFT._tokenIdCounter()
    await simpleNFT.connect(deployer).safeMint(accounts[0].address)
    await simpleNFT.connect(accounts[0]).approve(anonExchange.address, tokenId)

    const sellerIdentity = new Identity()
    await anonExchange.connect(accounts[0]).listNFT(simpleNFT.address, tokenId, sellerIdentity.commitment)

    const depositAmount = nftPrice
    const depositIdentity = new Identity()

    await anonExchange.connect(accounts[1]).depositETH(depositIdentity.commitment, {
      value: depositAmount,
    })
    ethDepositedGroup.addMember(depositIdentity.commitment)

    const fullProofBuy = await generateProof(depositIdentity, ethDepositedGroup, ethDepositedGroup.id, BUYER_BUY_AND_CLAIM_NFT_SIGNAL, {
      wasmFilePath,
      zkeyFilePath,
    })

    await anonExchange
      .connect(accounts[1])
      .buyAndClaimNFT(simpleNFT.address, tokenId, fullProofBuy.merkleTreeRoot, fullProofBuy.nullifierHash, fullProofBuy.proof, accounts[2].address)

    nftSoldGroup.addMember(sellerIdentity.commitment)

    const fullProofSell = await generateProof(sellerIdentity, nftSoldGroup, nftSoldGroup.id, SELLER_CLAIM_ETH_SIGNAL, {
      wasmFilePath,
      zkeyFilePath,
    })

    const cantReceiveEthContract = await (await ethers.getContractFactory('CannotReceiveEthContract')).deploy()

    await expect(
      anonExchange
        .connect(accounts[0])
        .claimETH(cantReceiveEthContract.address, fullProofSell.merkleTreeRoot, fullProofSell.nullifierHash, fullProofSell.proof)
    ).to.be.revertedWithCustomError(anonExchange, 'EthTransferFailed')
  })

  it('EthTransferFailed if withdraw to address that cannot receive eth (claimETH)', async () => {
    const tokenId = await simpleNFT._tokenIdCounter()
    await simpleNFT.connect(deployer).safeMint(accounts[0].address)
    await simpleNFT.connect(accounts[0]).approve(anonExchange.address, tokenId)

    const sellerIdentity = new Identity()
    await anonExchange.connect(accounts[0]).listNFT(simpleNFT.address, tokenId, sellerIdentity.commitment)

    const depositAmount = nftPrice
    const depositIdentity = new Identity()

    await anonExchange.connect(accounts[1]).depositETH(depositIdentity.commitment, {
      value: depositAmount,
    })
    ethDepositedGroup.addMember(depositIdentity.commitment)

    const fullProofBuy = await generateProof(depositIdentity, ethDepositedGroup, ethDepositedGroup.id, BUYER_BUY_AND_CLAIM_NFT_SIGNAL, {
      wasmFilePath,
      zkeyFilePath,
    })

    await expect(
      anonExchange.connect(accounts[1]).buyAndClaimNFT(
        simpleNFT.address,
        tokenId.add(1), // invalid tokenId
        fullProofBuy.merkleTreeRoot,
        fullProofBuy.nullifierHash,
        fullProofBuy.proof,
        accounts[2].address
      )
    ).to.be.revertedWithCustomError(anonExchange, 'NftNotAvailable')

    // nftSoldGroup.addMember(sellerIdentity.commitment)

    // const fullProofSell = await generateProof(sellerIdentity, nftSoldGroup, nftSoldGroup.id, SELLER_CLAIM_ETH_SIGNAL, {
    //   wasmFilePath,
    //   zkeyFilePath,
    // })

    // await expect(
    //   anonExchange.connect(accounts[0]).claimETH(accounts[5].address, fullProofSell.merkleTreeRoot, fullProofSell.nullifierHash, fullProofSell.proof)
    // ).to.be.revertedWithCustomError(anonExchange, 'EthTransferFailed')
  })
})
