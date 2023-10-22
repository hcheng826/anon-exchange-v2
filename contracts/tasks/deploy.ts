import { task, types } from 'hardhat/config'

task('deploy', 'Deploy Semaphore, AnonExchange and SimpleNFT')
  .addOptionalParam('semaphore', 'Semaphore contract address', undefined, types.string)
  .addOptionalParam('group', 'Group id', '42', types.string)
  .addOptionalParam('logs', 'Print the logs', true, types.boolean)
  .setAction(async ({ logs, semaphore: semaphoreAddress, group: groupId }, { ethers, run }) => {
    const [deployer, ...accounts] = await ethers.getSigners()
    if (!semaphoreAddress) {
      const { semaphore } = await run('deploy:semaphore', {
        logs,
      })

      semaphoreAddress = semaphore.address
    }

    const anonExchangeFactory = await ethers.getContractFactory('AnonExchange')

    const anonExchange = await anonExchangeFactory.deploy(semaphoreAddress, { gasLimit: 5000000, gasPrice: ethers.utils.parseUnits('5', 'gwei') })

    await anonExchange.deployed()

    const Simple20Factory = await ethers.getContractFactory('Simple20')
    const Simple20 = await Simple20Factory.deploy()

    const Simple721Factory = await ethers.getContractFactory('Simple721')
    const Simple721 = await Simple721Factory.deploy()

    const Simple1155Factory = await ethers.getContractFactory('Simple1155')
    const Simple1155 = await Simple1155Factory.deploy()

    if (logs) {
      console.info(`Simple20 contract addr: ${Simple20.address}`)
      console.info(`Simple721 contract addr: ${Simple721.address}`)
      console.info(`Simple1155 contract addr: ${Simple1155.address}`)
      console.info(`AnonExchange contract has been deployed to: ${anonExchange.address}`)
    }

    return anonExchange
  })
