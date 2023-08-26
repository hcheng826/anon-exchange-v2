import React from 'react'
import { GroupResponse } from '@semaphore-protocol/data'

export type SemaphoreContextType = {
  // nftSoldGroup: string[]
  // ethDepositedGroup: string[]
  nftSoldGroup: GroupResponse | undefined
  ethDepositedGroup: GroupResponse | undefined
  refreshGroups: () => Promise<void>
}

// export default React.createContext<SemaphoreContextType>({
//   nftSoldGroup: {},
//   ethDepositedGroup: [],
//   refreshGroups: () => Promise.resolve(),
// })
