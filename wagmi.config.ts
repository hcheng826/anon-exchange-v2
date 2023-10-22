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
          11155111: '0x26C494FE4878053504e20d13483dd5aea1EF5dF3',
          5001: '0x0BE79aC6873bff6763F930736dfc10498D69cCfe',
          80001: '0x583521cc9695B8Ac6a911e8a0fEb666637A1f090',
        },
        SimpleNFT: {
          1337: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
          11155111: '0x816D176a7A925D60099AEd94e9ae953928650fcC',
        },
        Simple20: {
          1337: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
          5001: '0x816D176a7A925D60099AEd94e9ae953928650fcC',
          11155111: '0x67cFA4c3B6928f0e474dCFa5398849f00ff164F1',
          80001: '0x0EFEDB298eA02F9c096144dD187B35e0E15d37E2',
        },
        Simple721: {
          1337: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
          5001: '0xD8F9f30FeDa001D48E3C38E32207D67369476d07',
          11155111: '0xB0051553B53C92976DC6e241A384ec3Dd837dfeE',
          80001: '0x43b7e7d9a59421d4871F9F1DA65bb940EE0c4A5f',
        },
        Simple1155: {
          1337: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
          5001: '0x1E63B72E225De7BB4B4eC71D57952c7FD6e58701',
          11155111: '0x9dB7f4FD1DdfBd1792475D5034BB7A27F2235a0F',
          80001: '0x127A1a306D7b0794DFD349a2fb793622150B0c2D',
        },
        AnonExchange: {
          1337: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
          11155111: '0xaBD2eE1c3b629Ec786e5dDAC3E6A2c2ca39c4c48',
          5001: '0xDD98f5E7269f8eCfb62b77CC8bCbf791BEFF8cC2',
          80001: '0x7ffECBf39DB1c1E1BF8266A55157bA61D63823D2',
        },
      },
    }),
  ],
})
