import { Address, sepolia, useAccount, useNetwork } from 'wagmi'
import { Button, Heading, list } from '@chakra-ui/react'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import { NftList } from 'components/NftList'
import { SemaphoreIdentityGenerate } from 'components/SemaphoreIdentityGenerate'
import { HeadingComponent } from 'components/layout/HeadingComponent'
import { NftListing, NftStatus } from 'context/AnonExchangeContext'
import { Identity } from '@semaphore-protocol/identity'
import { MintNFT } from 'components/MintNftButton'
import { ImportNft } from 'components/ImportNftButton'
import { ListNFT } from 'components/ListNftButton'
import { DelistNFT } from 'components/DelistNftButton'
import { v4 as uuidv4 } from 'uuid'
import { ApproveAllNFT } from 'components/ApproveAllNftButton'
import useAnonExchange from 'hooks/useAnonExchange'
import { ListNftSold } from 'components/ListNftSoldButton'
import { ethers } from 'ethers'
import { simpleNftABI } from 'abis'
import { localhost } from 'viem/chains'

export default function ListNftPage() {
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()

  const [contractAddressInput, setContractAddressInput] = useState<string>('')
  const [tokenIdInput, setTokenIdInput] = useState<number | null>(null)
  const [semaphoreId, setSemaphoreId] = useState<Identity>()
  const [secret, setSecret] = useState(uuidv4())
  const { refreshNftListing } = useAnonExchange()

  const [nfts, setNfts] = useState<NftListing[]>([])

  useEffect(() => {
    const fetchAndSetListings = async () => {
      const nftListings = await refreshNftListing()

      const updatedNfts = nftListings
        .filter((nft) => nft.lister === address)
        .map((nft) => {
          return nft
        })

      const updateNftsPromises = updatedNfts.map((updatedNft) => {
        if (updatedNft.status === 'Sold') {
          const nftContract = new ethers.Contract(
            updatedNft.contractAddress,
            simpleNftABI,
            new ethers.providers.JsonRpcProvider(chain?.rpcUrls.default.http[0])
          )
          return nftContract.ownerOf(updatedNft.tokenId).then((owner: Address) => {
            if (owner === address) {
              updatedNft.status = 'NotListed'
            }
            return updatedNft
          })
        } else {
          return Promise.resolve(updatedNft)
        }
      })

      Promise.all(updateNftsPromises).then((resolvedNfts) => {
        setNfts((prevNfts) => {
          const newNftsArray = [...prevNfts]

          resolvedNfts.forEach((nft) => {
            const idx = newNftsArray.findIndex(
              (currentNft) => currentNft.contractAddress === nft.contractAddress && currentNft.tokenId === nft.tokenId
            )
            if (idx !== -1) {
              newNftsArray[idx] = nft
            } else {
              newNftsArray.push(nft)
            }
          })

          return newNftsArray
        })
      })
    }

    fetchAndSetListings() // Call once immediately when component mounts

    const intervalId = setInterval(fetchAndSetListings, 5000)

    return () => clearInterval(intervalId) // Cleanup interval when component unmounts
  }, [address, refreshNftListing, chain])

  function refreshSecret() {
    setSecret(uuidv4())
  }

  function updateNftStatus(nftToUpdate: NftListing, newStatus: NftStatus) {
    setNfts((currentNfts) =>
      currentNfts.map((nft) => {
        if (nftToUpdate.tokenId === nft.tokenId && nftToUpdate.contractAddress === nft.contractAddress) {
          return { ...nft, status: newStatus }
        }
        return nft
      })
    )
  }

  if (isConnected && address && (chain?.id === sepolia.id || chain?.id === localhost.id)) {
    return (
      <div>
        <NextSeo title="Mint NFT" />

        <HeadingComponent as="h2">List NFT</HeadingComponent>

        <Heading as="h2" fontSize="2xl" my={4}>
          Mint Test NFT
        </Heading>
        <MintNFT address={address} chain={chain} setNfts={setNfts} />
        <ApproveAllNFT chain={chain} />

        <SemaphoreIdentityGenerate semaphoreId={semaphoreId} setSemaphoreId={setSemaphoreId} secret={secret} refreshSecret={refreshSecret} />

        <Heading as="h2" fontSize="2xl" my={4}>
          NFT List
        </Heading>

        <ImportNft
          {...{
            contractAddressInput,
            setContractAddressInput,
            tokenIdInput,
            setTokenIdInput,
            nfts,
            setNfts,
            address,
          }}
        />

        <NftList
          nfts={nfts}
          statusAction={{
            NotListed: {
              renderButton: semaphoreId
                ? (nft, chain) => (
                    <ListNFT
                      nft={nft}
                      chain={chain}
                      identity={semaphoreId}
                      updateNftStatus={updateNftStatus}
                      setSemaphoreId={setSemaphoreId}
                      refreshSecret={refreshSecret}
                    />
                  )
                : () => <Button disabled={true}>Please generate Semaphore Id first</Button>,
            },
            Sold: { renderButton: (nft) => <ListNftSold nft={nft} updateNftStatus={updateNftStatus} /> },
            Delisted: {
              renderButton: semaphoreId
                ? (nft, chain) => (
                    <ListNFT
                      nft={nft}
                      chain={chain}
                      identity={semaphoreId}
                      updateNftStatus={updateNftStatus}
                      setSemaphoreId={setSemaphoreId}
                      refreshSecret={refreshSecret}
                    />
                  )
                : () => <Button disabled={true}>Please generate Semaphore Id first</Button>,
            },
            Listed: { renderButton: (nft, chain) => <DelistNFT nft={nft} chain={chain} updateNftStatus={updateNftStatus} /> },
          }}
          chain={chain}
          identity={semaphoreId}
          updateNftStatus={updateNftStatus}
        />
      </div>
    )
  }

  return <div>Connect your wallet to Sepolia</div>
}
