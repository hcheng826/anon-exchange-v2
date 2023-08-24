import React from 'react'

export type SemaphoreContextType = {
  nftSoldGroup: string[]
  ethDepositedGroup: string[]
  refreshGroups: () => Promise<void>
}

export default React.createContext<SemaphoreContextType>({
  nftSoldGroup: [],
  ethDepositedGroup: [],
  refreshGroups: () => Promise.resolve(),
})
