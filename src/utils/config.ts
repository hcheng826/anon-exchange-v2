import { ThemingProps } from '@chakra-ui/react'
import { localhost, sepolia, mantleTestnet, polygonZkEvmTestnet, scrollSepolia } from '@wagmi/chains'

export const SITE_NAME = 'Anon Exchange'
export const SITE_DESCRIPTION = 'anonymous exhcange based on Semaphore protocol'
export const SITE_URL = 'https://anon-exchange.vercel.app'

export const THEME_INITIAL_COLOR = 'system'
export const THEME_COLOR_SCHEME: ThemingProps['colorScheme'] = 'gray'
export const THEME_CONFIG = {
  initialColorMode: THEME_INITIAL_COLOR,
}

export const SOCIAL_TWITTER = 'lilioo826'
export const SOCIAL_GITHUB = 'hcheng826/anon-exchange-v2'

export const supportedChains = [localhost, sepolia, mantleTestnet, polygonZkEvmTestnet, scrollSepolia]

export const SERVER_SESSION_SETTINGS = {
  cookieName: SITE_NAME,
  password: process.env.SESSION_PASSWORD ?? 'UPDATE_TO_complex_password_at_least_32_characters_long',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}

export const NFT_SOLD_GROUP_ID = '1'
export const ETH_DEPOSITED_GROUP_ID = '2'

export const chainInUse =
  process.env.NEXT_PUBLIC_USE_LOCAL_NETWORK && process.env.NEXT_PUBLIC_USE_LOCAL_NETWORK === 'true'
    ? localhost
    : {
        ...sepolia,
        rpcUrls: {
          ...sepolia.rpcUrls,
          default: {
            http: ['https://sepolia.infura.io/v3/3c979d1c554c4d5ebd6148011a794e1d'],
          },
        },
      }

export const semaphoreStartBlock = {
  11155111: 4152108,
  1337: 0,
  5001: 23750086,
}
