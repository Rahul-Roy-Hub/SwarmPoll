import type { Address } from "viem";

// Contract addresses from environment variables
export const SWARMPOLL_CONTRACT_ADDRESS: Address = process.env
  .NEXT_PUBLIC_SWARM_POLL_ADDRESS as Address;

export const USDC_CONTRACT_ADDRESS: Address = process.env
  .NEXT_PUBLIC_MOCK_USDC_ADDRESS as Address;

export const SWARM_TOKEN_ADDRESS: Address = process.env
  .NEXT_PUBLIC_SWARM_TOKEN_ADDRESS as Address;

// Optional admin override address for UI gating
export const ADMIN_ADDRESS: string =
  (process.env.NEXT_PUBLIC_ADMIN_ADDRESS as string) || "";

// Network configuration
export const SUPPORTED_CHAINS = {
  ARBITRUM: 42161,
  ARBITRUM_SEPOLIA: 421614,
} as const;

// Contract addresses by network (for future multi-chain support)
export const CONTRACT_ADDRESSES = {
  [SUPPORTED_CHAINS.ARBITRUM_SEPOLIA]: {
    SWARMPOLL: SWARMPOLL_CONTRACT_ADDRESS,
    USDC: USDC_CONTRACT_ADDRESS,
    SWARM: SWARM_TOKEN_ADDRESS,
  },
  [SUPPORTED_CHAINS.ARBITRUM]: {
    SWARMPOLL: SWARMPOLL_CONTRACT_ADDRESS, // Update when deployed to mainnet
    USDC: USDC_CONTRACT_ADDRESS, // Update when deployed to mainnet
    SWARM: SWARM_TOKEN_ADDRESS,
  },
} as const;
