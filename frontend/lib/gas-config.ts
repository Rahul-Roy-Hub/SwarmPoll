// Gas configuration for contract interactions
// These are reasonable gas limits for Arbitrum Sepolia testnet

export const GAS_LIMITS = {
  // USDC operations
  USDC_APPROVE: 100000n,
  
  // SwarmPoll operations
  SWARMPOLL_STAKE: 200000n,
  SWARMPOLL_CREATE_POLL: 300000n,
  SWARMPOLL_DECLARE_WINNER: 150000n,
  SWARMPOLL_CLAIM_REWARD: 150000n,
} as const;

// Gas price configuration (in wei)
export const GAS_PRICE = {
  // Arbitrum Sepolia typically has very low gas prices
  // These are conservative estimates
  SLOW: 1000000000n, // 1 gwei
  STANDARD: 2000000000n, // 2 gwei
  FAST: 5000000000n, // 5 gwei
} as const;

// Helper function to get gas configuration for different operations
export function getGasConfig(operation: keyof typeof GAS_LIMITS) {
  return {
    gas: GAS_LIMITS[operation],
    gasPrice: GAS_PRICE.STANDARD,
  };
}

// Helper function for USDC approval
export function getUSDCApprovalGasConfig() {
  return getGasConfig('USDC_APPROVE');
}

// Helper function for staking
export function getStakingGasConfig() {
  return getGasConfig('SWARMPOLL_STAKE');
}

// Helper function for creating polls
export function getCreatePollGasConfig() {
  return getGasConfig('SWARMPOLL_CREATE_POLL');
}

// Helper function for declaring winners
export function getDeclareWinnerGasConfig() {
  return getGasConfig('SWARMPOLL_DECLARE_WINNER');
}
