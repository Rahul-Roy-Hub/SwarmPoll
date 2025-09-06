import { useState } from "react";
import { useAccount, useReadContract, useWriteContract, useSendTransaction, useChainId } from "wagmi";
import { parseUnits, formatUnits, encodeFunctionData } from "viem";
import { SWARMPOLL_CONTRACT_ADDRESS, SWARMPOLL_ABI, USDC_CONTRACT_ADDRESS, USDC_ABI } from "@/contracts";
import { useToast } from "@/hooks/use-toast";
import { getGasConfig, GAS_PRICE } from "@/lib/gas-config";

export function useStaking(pollId: string, optionId: string) {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  const { sendTransaction } = useSendTransaction();
  const { toast } = useToast();
  const chainId = useChainId();
  
  const [isApproving, setIsApproving] = useState(false);
  const [isStaking, setIsStaking] = useState(false);

  // Get appropriate gas configuration based on network
  const getGasConfigForNetwork = (operation: 'USDC_APPROVE' | 'SWARMPOLL_STAKE') => {
    const config = getGasConfig(operation);
    
    console.log(`Current chain ID: ${chainId}`);
    console.log(`Operation: ${operation}`);
    
    // For Arbitrum Sepolia (421614), use very low gas prices
    if (chainId === 421614) {
      console.log('Using Arbitrum Sepolia gas config (1 gwei)');
      return {
        gas: config.gas,
        gasPrice: GAS_PRICE.SLOW, // 1 gwei for testnet
      };
    }
    
    // For Arbitrum mainnet (42161), use higher gas prices
    if (chainId === 42161) {
      console.log('Using Arbitrum mainnet gas config (2 gwei)');
      return {
        gas: config.gas,
        gasPrice: GAS_PRICE.STANDARD, // 2 gwei for mainnet
      };
    }
    
    // For other networks, use standard configuration
    console.log(`Using default gas config for chain ${chainId}`);
    return config;
  };

  // Get USDC balance
  const { data: usdcBalance, refetch: refetchBalance } = useReadContract({
    address: USDC_CONTRACT_ADDRESS,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  // Get allowance for SwarmPoll contract
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_CONTRACT_ADDRESS,
    abi: USDC_ABI,
    functionName: "allowance",
    args: address ? [address, SWARMPOLL_CONTRACT_ADDRESS] : undefined,
  });

  // Get current user stake for this option
  const { data: userStake, refetch: refetchUserStake } = useReadContract({
    address: SWARMPOLL_CONTRACT_ADDRESS,
    abi: SWARMPOLL_ABI,
    functionName: "getUserStake",
    args: address ? [BigInt(pollId), address, BigInt(optionId)] : undefined,
  });

  // Get total stake for this option
  const { data: optionStake, refetch: refetchOptionStake } = useReadContract({
    address: SWARMPOLL_CONTRACT_ADDRESS,
    abi: SWARMPOLL_ABI,
    functionName: "getOptionStake",
    args: [BigInt(pollId), BigInt(optionId)],
  });

  const formatUSDC = (amount: bigint | undefined) => {
    if (!amount) return "0.00";
    return formatUnits(amount, 6);
  };

  const parseUSDC = (amount: string) => {
    return parseUnits(amount, 6);
  };

  const checkNeedsApproval = (amount: string) => {
    if (!amount || !allowance) return false;
    const amountBigInt = parseUSDC(amount);
    return amountBigInt > allowance;
  };

  const checkHasBalance = (amount: string) => {
    if (!amount || !usdcBalance) return false;
    const amountBigInt = parseUSDC(amount);
    return amountBigInt <= usdcBalance;
  };

  // Check if we're on a supported network
  const isSupportedNetwork = () => {
    return chainId === 421614 || chainId === 42161; // Arbitrum Sepolia or Arbitrum
  };

  // Get network name for display
  const getNetworkName = () => {
    switch (chainId) {
      case 421614:
        return "Arbitrum Sepolia";
      case 42161:
        return "Arbitrum";
      default:
        return `Chain ${chainId}`;
    }
  };

  const approve = async (amount: string) => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to approve USDC.",
        variant: "destructive",
      });
      return false;
    }

    setIsApproving(true);
    try {
      const amountBigInt = parseUSDC(amount);
      const gasConfig = getGasConfigForNetwork('USDC_APPROVE');
      
      // Use sendTransaction with encoded data for better gas control
      const data = encodeFunctionData({
        abi: USDC_ABI,
        functionName: "approve",
        args: [SWARMPOLL_CONTRACT_ADDRESS, amountBigInt],
      });

      await sendTransaction({
        to: USDC_CONTRACT_ADDRESS,
        data,
        gas: gasConfig.gas,
        gasPrice: gasConfig.gasPrice,
      });
      
      toast({
        title: "USDC approved!",
        description: "You can now stake on this poll.",
      });
      
      // Refetch allowance after approval
      await refetchAllowance();
      return true;
    } catch (error) {
      console.error("Approval error:", error);
      toast({
        title: "Approval failed",
        description: "Please try again or check your wallet.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsApproving(false);
    }
  };

  const stake = async (amount: string) => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to stake.",
        variant: "destructive",
      });
      return false;
    }

    setIsStaking(true);
    try {
      const amountBigInt = parseUSDC(amount);
      const gasConfig = getGasConfigForNetwork('SWARMPOLL_STAKE');
      
      // Use sendTransaction with encoded data for better gas control
      const data = encodeFunctionData({
        abi: SWARMPOLL_ABI,
        functionName: "stake",
        args: [BigInt(pollId), BigInt(optionId), amountBigInt],
      });

      await sendTransaction({
        to: SWARMPOLL_CONTRACT_ADDRESS,
        data,
        gas: gasConfig.gas,
        gasPrice: gasConfig.gasPrice,
      });
      
      toast({
        title: "Stake successful!",
        description: `You staked ${amount} USDC on this option.`,
      });
      
      // Refetch all relevant data after staking
      await Promise.all([
        refetchBalance(),
        refetchAllowance(),
        refetchUserStake(),
        refetchOptionStake(),
      ]);
      
      return true;
    } catch (error) {
      console.error("Staking error:", error);
      toast({
        title: "Staking failed",
        description: "Please try again or check your wallet.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsStaking(false);
    }
  };

  const handleStake = async (amount: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid stake amount.",
        variant: "destructive",
      });
      return;
    }

    if (!checkHasBalance(amount)) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough USDC to stake this amount.",
        variant: "destructive",
      });
      return;
    }

    // Check if approval is needed
    if (checkNeedsApproval(amount)) {
      const approved = await approve(amount);
      if (!approved) return;
    }

    // Now stake
    await stake(amount);
  };

  return {
    // State
    isApproving,
    isStaking,
    isConnected,
    address,
    
    // Data
    usdcBalance: formatUSDC(usdcBalance),
    allowance: formatUSDC(allowance),
    userStake: formatUSDC(userStake),
    optionStake: formatUSDC(optionStake),
    
    // Network info
    chainId,
    networkName: getNetworkName(),
    isSupportedNetwork: isSupportedNetwork(),
    
    // Computed values
    needsApproval: checkNeedsApproval,
    hasBalance: checkHasBalance,
    
    // Actions
    approve,
    stake,
    handleStake,
    
    // Refetch functions
    refetchBalance,
    refetchAllowance,
    refetchUserStake,
    refetchOptionStake,
  };
}
