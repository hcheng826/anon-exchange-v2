import { defineConfig } from '@wagmi/cli'
import { actions, hardhat } from '@wagmi/cli/plugins'

export default defineConfig({
  out: 'src/abis.ts',
  contracts: [],
  plugins: [
    actions({
      getContract: true,
      readContract: true,
      prepareWriteContract: true,
      watchContractEvent: true,
    }),
    hardhat({
      project: './contracts',
      deployments: {
        Semaphore: {
          31337: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
        },
        SimpleNFT: {
          31337: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
        },
        AnonExchange: {
          31337: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
        },
      },
    }),
  ],
})
