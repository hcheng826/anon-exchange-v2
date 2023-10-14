// https://docs.safe.global/safe-core-aa-sdk/auth-kit/web3auth

import { Web3AuthModalPack, Web3AuthConfig } from '@safe-global/auth-kit'
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from '@web3auth/base'
import { Web3AuthOptions } from '@web3auth/modal'
import { OpenloginAdapter } from '@web3auth/openlogin-adapter'
import React from 'react'
import { createContext, useEffect, useState } from 'react'

// https://web3auth.io/docs/sdk/pnp/web/modal/initialize#arguments
const options: Web3AuthOptions = {
  clientId: 'YOUR_WEB3_AUTH_CLIENT_ID', // https://dashboard.web3auth.io/
  web3AuthNetwork: 'testnet',
  chainConfig: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: '0x5',
    // https://chainlist.org/
    rpcTarget: 'https://rpc.ankr.com/eth_goerli',
  },
  // uiConfig: {
  //   loginMethodsOrder: ['google', 'facebook'],
  // },
}

// https://web3auth.io/docs/sdk/pnp/web/modal/initialize#configuring-adapters
const modalConfig = {
  [WALLET_ADAPTERS.TORUS_EVM]: {
    label: 'torus',
    showOnModal: false,
  },
  [WALLET_ADAPTERS.METAMASK]: {
    label: 'metamask',
    showOnDesktop: true,
    showOnMobile: false,
  },
}

// https://web3auth.io/docs/sdk/pnp/web/modal/whitelabel#whitelabeling-while-modal-initialization
const openloginAdapter = new OpenloginAdapter({
  loginSettings: {
    mfaLevel: 'mandatory',
  },
  adapterSettings: {
    uxMode: 'popup',
    whiteLabel: {
      name: 'Safe',
    },
  },
})

const web3AuthConfig: Web3AuthConfig = {
  txServiceUrl: 'https://safe-transaction-goerli.safe.global',
}

// Instantiate and initialize the pack
const web3AuthModalPack = new Web3AuthModalPack(web3AuthConfig)

const Web3AuthContext = createContext({
  isInitialized: false,
  isConnected: false,
  web3AuthModalPack: null,
})

export const SafeWeb3AuthProvider: React.FC = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    web3AuthModalPack.init({ options, adapters: [openloginAdapter], modalConfig }).then(() => {
      setIsInitialized(true)
    })
  }, []) // Run this effect only once, when the provider component is mounted.

  const handleSignIn = async () => {
    const authKitSignData = await web3AuthModalPack.signIn()
    if (authKitSignData && authKitSignData.eoa) {
      setIsConnected(true)
    }
  }

  return <Web3AuthContext.Provider value={{ isInitialized, isConnected, web3AuthModalPack, handleSignIn }}>{children}</Web3AuthContext.Provider>
}

export const useWeb3Auth = () => React.useContext(Web3AuthContext)
