import { SemaphoreEthers } from '@semaphore-protocol/data'
import { useCallback, useState } from 'react'
import { SemaphoreContextType } from '../context/SemaphoreContext'
import { semaphoreAddress } from 'abis'
import { ETH_DEPOSITED_GROUP_ID, NFT_SOLD_GROUP_ID, semaphoreStartBlock, chainInUse } from 'utils/config'
import { Group } from '@semaphore-protocol/group'

export default function useSemaphore(): SemaphoreContextType {
  const [nftSoldGroup, setNftSoldGroup] = useState<Group>()
  const [ethDepositedGroup, setEthDepositedGroup] = useState<Group>()
  // need to get eth depositer nonce as well
  const chain = chainInUse

  const refreshGroups = useCallback(async (): Promise<void> => {
    if (!chain || !semaphoreAddress[chain.id as keyof typeof semaphoreAddress]) {
      return
    }
    const semaphore = new SemaphoreEthers(chain.rpcUrls.default.http[0], {
      address: semaphoreAddress[chain.id as keyof typeof semaphoreAddress],
      startBlock: semaphoreStartBlock[chain.id as keyof typeof semaphoreStartBlock],
    })

    const nftSoldGroupMembers = await semaphore.getGroupMembers(NFT_SOLD_GROUP_ID)
    const ethDepositedGroupMembers = await semaphore.getGroupMembers(ETH_DEPOSITED_GROUP_ID)

    setNftSoldGroup(new Group(NFT_SOLD_GROUP_ID, 20, nftSoldGroupMembers))
    setEthDepositedGroup(new Group(ETH_DEPOSITED_GROUP_ID, 20, ethDepositedGroupMembers))
  }, [chain])

  return {
    nftSoldGroup,
    ethDepositedGroup,
    refreshGroups,
  }
}
