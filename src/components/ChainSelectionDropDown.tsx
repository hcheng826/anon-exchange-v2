import { Select } from '@chakra-ui/react'
import { Chain, mantleTestnet, polygonZkEvm, scrollSepolia, sepolia } from '@wagmi/chains'
import { Dispatch, SetStateAction, FC } from 'react'

const chainOptions = [
  { label: 'Sepolia', value: sepolia },
  { label: 'Mantle testnet', value: mantleTestnet },
  { label: 'Scroll sepolia', value: scrollSepolia },
  { label: 'Polygon zkEVM', value: polygonZkEvm },
]

interface ChainDropdownProps {
  chain: Chain | undefined
  setChain: Dispatch<SetStateAction<Chain | undefined>>
}

export const ChainDropdown: FC<ChainDropdownProps> = ({ chain, setChain }) => {
  const handleChainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedChain = chainOptions[parseInt(e.target.value)].value
    setChain(selectedChain)
  }

  return (
    <Select value={chain ? chainOptions.findIndex((opt) => opt.value === chain) : ''} onChange={handleChainChange}>
      {!chain && (
        <option value="" disabled>
          Select chain
        </option>
      )}
      {chainOptions.map((option, index) => (
        <option key={index} value={index}>
          {option.label}
        </option>
      ))}
    </Select>
  )
}
