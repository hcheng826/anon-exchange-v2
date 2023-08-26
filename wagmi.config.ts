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
          1337: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
          11155111: '0xC170Dabb31F278d3024f70c2117a4532D86B9aBc',
        },
        SimpleNFT: {
          1337: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
          11155111: '0x816D176a7A925D60099AEd94e9ae953928650fcC',
        },
        AnonExchange: {
          1337: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
          11155111: '0xFFFE3c238718f3a5CfcEDA18AaFFd6203F1FA642',
        },
      },
    }),
  ],
})
