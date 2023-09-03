import React from 'react'
import { Group } from '@semaphore-protocol/group'

export type SemaphoreContextType = {
  // nftSoldGroup: string[]
  // ethDepositedGroup: string[]
  nftSoldGroup: Group | undefined
  ethDepositedGroup: Group | undefined
  refreshGroups: () => Promise<void>
}

// export default React.createContext<SemaphoreContextType>({
//   nftSoldGroup: {},
//   ethDepositedGroup: [],
//   refreshGroups: () => Promise.resolve(),
// })
