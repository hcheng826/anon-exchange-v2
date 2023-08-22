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

    const anonExchange = await anonExchangeFactory.deploy(semaphoreAddress)

    await anonExchange.deployed()

    const SimpleNFTFactory = await ethers.getContractFactory('SimpleNFT')
    const SimpleNFT = await SimpleNFTFactory.deploy()

    if (logs) {
      console.info(`SimpleNFT contract addr: ${SimpleNFT.address}`)
      console.info(`AnonExchange contract has been deployed to: ${anonExchange.address}`)
    }

    return anonExchange
  })
