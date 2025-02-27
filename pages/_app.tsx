import '@/styles/globals.css'
import type { AppProps } from 'next/app'

import { useState } from 'react'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { arbitrum, mainnet, polygon, goerli } from 'wagmi/chains'

const chains = [arbitrum, mainnet, polygon, goerli]
const projectId = '53d64fe780a387be9269a04412507ccc'



const { provider } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  provider
})
if (typeof window !== 'undefined') {

  (window as any).wagmi = wagmiClient
  console.log("wagmiClient")
  console.log(wagmiClient)
}
const ethereumClient = new EthereumClient(wagmiClient, chains)

if (typeof window !== 'undefined') {

  // (window as any).wagmi = wagmiClient
  (window as any).ethereumClient = ethereumClient
}


export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <Component {...pageProps} />
      </WagmiConfig>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
 
    </>
    
  )
}
