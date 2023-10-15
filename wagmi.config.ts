import { Simple20 } from './contracts/typechain-types/contracts/Simple20'
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
          11155111: '0xDD98f5E7269f8eCfb62b77CC8bCbf791BEFF8cC2',
          5001: '0xC170Dabb31F278d3024f70c2117a4532D86B9aBc',
        },
        SimpleNFT: {
          1337: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
          11155111: '0x816D176a7A925D60099AEd94e9ae953928650fcC',
        },
        Simple20: {
          1337: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
          5001: '0x816D176a7A925D60099AEd94e9ae953928650fcC',
          11155111: '0x452E240953D94623F63b8422A6bf2E87f8584AeA',
        },
        Simple721: {
          1337: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
          5001: '0xD8F9f30FeDa001D48E3C38E32207D67369476d07',
          11155111: '0xa5E4675317e622c96f49a429577Fad19D0c2b32f',
        },
        Simple1155: {
          1337: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
          5001: '0x1E63B72E225De7BB4B4eC71D57952c7FD6e58701',
          11155111: '0xdB023884eF262577Ff50ea808978244527E289aC',
        },
        AnonExchange: {
          1337: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
          11155111: '0x18902d3c769aa7F6224CC261606Ded4158C552c1',
          5001: '0xFFFE3c238718f3a5CfcEDA18AaFFd6203F1FA642',
        },
      },
    }),
  ],
})
