import React from 'react'
import { Group } from '@semaphore-protocol/group'
import { ETH_DEPOSITED_GROUP_ID, NFT_SOLD_GROUP_ID } from 'utils/config'

export type SemaphoreContextType = {
  nftSoldGroup: Group | undefined
  ethDepositedGroup: Group | undefined
  refreshGroups: () => Promise<void>
}

export default React.createContext<SemaphoreContextType>({
  nftSoldGroup: new Group(NFT_SOLD_GROUP_ID),
  ethDepositedGroup: new Group(ETH_DEPOSITED_GROUP_ID),
  refreshGroups: () => Promise.resolve(),
})
