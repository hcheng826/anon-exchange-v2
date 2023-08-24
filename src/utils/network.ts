export function GetNetworkColor(chain?: string) {
  if (chain === 'homestead') return 'green'
  if (chain === 'arbitrum') return 'blue'
  if (chain === 'optimism') return 'red'
  if (chain === 'matic') return 'purple'

  return 'grey'
}

export const networkRpcUrl: { [key: number]: string } = {
  31337: 'http://localhost:8545',
  11155111: 'https://api.zan.top/node/v1/eth/sepolia/public	',
}
