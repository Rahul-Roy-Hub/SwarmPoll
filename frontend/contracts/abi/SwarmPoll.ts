// SwarmPoll contract ABI
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
    // renamed to match your latest logic
    inputs: [{ name: "_pollId", type: "uint256" }],
    name: "claimReward",
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
  {
    name: "getPoll",
    inputs: [{ name: "_pollId", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "question", type: "string", internalType: "string" },
      { name: "options", type: "string[]", internalType: "string[]" },
      { name: "endTime", type: "uint256", internalType: "uint256" },
      { name: "active", type: "bool", internalType: "bool" },
      { name: "totalStaked", type: "uint256", internalType: "uint256" },
      { name: "winnerDeclared", type: "bool", internalType: "bool" },
      {
        name: "winningOptionId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    type: "function",
    name: "getPollCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    // ✅ new: per-option stake amount
    type: "function",
    name: "getOptionStake",
    inputs: [
      { name: "_pollId", type: "uint256" },
      { name: "_optionId", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    // ✅ new: user's stake per poll & option
    type: "function",
    name: "getUserStake",
    inputs: [
      { name: "_pollId", type: "uint256" },
      { name: "_user", type: "address" },
      { name: "_optionId", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    // ✅ new: check if user has already claimed
    type: "function",
    name: "hasUserClaimed",
    inputs: [
      { name: "_pollId", type: "uint256" },
      { name: "_user", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
] as const;
