// Contract configuration
import type { Address } from "viem"

export const SWARMPOLL_CONTRACT_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address) ??
  "0x0000000000000000000000000000000000000000"

// Optional admin override address for UI gating
export const ADMIN_ADDRESS: string =
  (process.env.NEXT_PUBLIC_ADMIN_ADDRESS as string) || ""

// SwarmPoll contract ABI - simplified for hackathon
export const SWARMPOLL_ABI = [
  {
    inputs: [
      { name: "pollId", type: "uint256" },
      { name: "optionId", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    name: "stake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "pollId", type: "uint256" }],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "question", type: "string" },
      { name: "options", type: "string[]" },
      { name: "endTime", type: "uint256" },
    ],
    name: "createPoll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "pollId", type: "uint256" },
      { name: "winningOptionId", type: "uint256" },
    ],
    name: "declareWinner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "uint256" }],
    name: "polls",
    outputs: [
      { name: "question", type: "string" },
      { name: "endTime", type: "uint256" },
      { name: "totalStaked", type: "uint256" },
      { name: "winningOption", type: "uint256" },
      { name: "isEnded", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const

// USDC contract address on Arbitrum Sepolia
export const USDC_CONTRACT_ADDRESS: Address =
  "0x0000000000000000000000000000000000000000" // Replace with actual USDC address

export const USDC_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const
