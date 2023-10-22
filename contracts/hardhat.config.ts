import { HardhatUserConfig } from 'hardhat/config'
import { join } from 'path'
import dotenv from 'dotenv'
import '@nomicfoundation/hardhat-toolbox'
import '@semaphore-protocol/hardhat'
import '@typechain/hardhat'
import './tasks/deploy'
import 'hardhat-contract-sizer'

dotenv.config({ path: join(process.cwd(), '../.env') })

const deployerKey = process.env.DEPLOYER_KEY
if (!deployerKey) {
  console.warn('DEPLOYER_KEY not found in .env file. Running with default config')
}
const etherscanApiKey = process.env.ETHERSCAN_API_KEY ?? ''
if (!etherscanApiKey) {
  console.warn('ETHERSCAN_API_KEY not found in .env file. Will skip Etherscan verification')
}
const polygonApiKey = process.env.POLYSCAN_API_KEY ?? ''
if (!polygonApiKey) {
  // console.warn('POLYSCAN_API_KEY not found in .env file. Will skip Etherscan verification')
}

const config: HardhatUserConfig = {
  solidity: '0.8.4',
  defaultNetwork: 'hardhat',
  etherscan: {
    apiKey: {
      mainnet: etherscanApiKey,
      sepolia: etherscanApiKey,
      polygonMumbai: polygonApiKey,
      mantleTest: etherscanApiKey,
    },
    customChains: [
      {
        network: 'mantleTest',
        chainId: 5001,
        urls: {
          apiURL: 'https://explorer.testnet.mantle.xyz/api',
          browserURL: 'https://explorer.testnet.mantle.xyz',
        },
      },
    ],
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      chainId: 1337,
      url: 'http://127.0.0.1:8545',
    },
    sepolia: {
      chainId: 11155111,
      url: 'https://eth-sepolia.public.blastapi.io',
      accounts: [deployerKey as string],
    },
    mumbai: {
      chainId: 80001,
      url: 'https://rpc-mumbai.maticvigil.com/',
      accounts: [deployerKey as string],
    },
    scroll_sepolia: {
      chainId: 534351,
      url: 'https://sepolia-rpc.scroll.io',
      accounts: [deployerKey as string],
    },
    polygon_zkevm_testnet: {
      chainId: 1442,
      url: 'https://rpc.public.zkevm-test.net',
      accounts: [deployerKey as string],
    },
    mantle_testnet: {
      chainId: 5001,
      url: 'https://rpc.testnet.mantle.xyz',
      accounts: [deployerKey as string],
    },
  },
}

export default config
