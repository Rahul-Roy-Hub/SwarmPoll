import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { arbitrum, arbitrumSepolia } from "wagmi/chains"

export const config = getDefaultConfig({
  appName: "SwarmPoll",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "your-project-id",
  chains: [arbitrum, arbitrumSepolia],
  ssr: true,
})
