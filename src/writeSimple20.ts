import { writeContract, WriteContractMode, WriteContractArgs, WriteContractPreparedArgs, WriteContractUnpreparedArgs } from 'wagmi/actions'
import { simple20Address, simple20ABI } from 'abis'

/**
 * Wraps __{@link writeContract}__ with `abi` set to __{@link simple20ABI}__.
 *
 * -
 * - [__View Contract on Sepolia Etherscan__](https://sepolia.etherscan.io/address/0x452E240953D94623F63b8422A6bf2E87f8584AeA)
 */

export function writeSimple20<TFunctionName extends string, TMode extends WriteContractMode, TChainId extends number = keyof typeof simple20Address>(
  config:
    | (Omit<WriteContractPreparedArgs<typeof simple20ABI, TFunctionName>, 'abi' | 'address'> & {
        mode: TMode
        chainId?: TMode extends 'prepared' ? TChainId : keyof typeof simple20Address
      })
    | (Omit<WriteContractUnpreparedArgs<typeof simple20ABI, TFunctionName>, 'abi' | 'address'> & {
        mode: TMode
        chainId?: TMode extends 'prepared' ? TChainId : keyof typeof simple20Address
      })
) {
  return writeContract({
    abi: simple20ABI,
    address: simple20Address[config.chainId as keyof typeof simple20Address],
    ...config,
  } as unknown as WriteContractArgs<typeof simple20ABI, TFunctionName>)
}
