"use client"

import type React from "react"
import { useEffect } from "react"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { arbitrum } from "wagmi/chains"
import { useAccount } from "wagmi"
import { ApolloProvider } from "@apollo/client/react"
import { config } from "@/lib/wagmi"
import { client } from "@/lib/subgraph"
import { useRouter } from "next/navigation"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
})

function WalletOnboarder() {
  const router = useRouter()
  const { address, isConnected } = useAccount()

  useEffect(() => {
    if (!isConnected || !address) return
    try {
      const existing = localStorage.getItem(`sp_profile_${address}`)
      if (!existing) router.push("/profile")
    } catch {
      // ignore storage access issues
    }
  }, [isConnected, address, router])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={arbitrum}>
          <ApolloProvider client={client}>
            <WalletOnboarder />
            {children}
          </ApolloProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
