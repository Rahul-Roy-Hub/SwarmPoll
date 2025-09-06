import { useState } from "react";
import { useAccount, useReadContract, useSendTransaction } from "wagmi";
import { parseUnits, formatUnits, encodeFunctionData } from "viem";
import { SWARMPOLL_CONTRACT_ADDRESS, SWARMPOLL_ABI, USDC_CONTRACT_ADDRESS, USDC_ABI } from "@/contracts";
import { useToast } from "@/hooks/use-toast";

export function useSimpleStaking(pollId: string, optionId: string) {
  const { address, isConnected } = useAccount();
  const { sendTransaction } = useSendTransaction();
  const { toast } = useToast();
  
  const [isApproving, setIsApproving] = useState(false);
  const [isStaking, setIsStaking] = useState(false);

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

  const approveUSDC = async (amount: string) => {
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
      
      const data = encodeFunctionData({
        abi: USDC_ABI,
        functionName: "approve",
        args: [SWARMPOLL_CONTRACT_ADDRESS, amountBigInt],
      });

      await sendTransaction({
        to: USDC_CONTRACT_ADDRESS,
        data,
        gas: 100000n,
        gasPrice: 1000000000n, // 1 gwei - very low for testnet
      });
      
      toast({
        title: "USDC approved!",
        description: "You can now stake on this poll.",
      });
      
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

  const stakeUSDC = async (amount: string) => {
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
      
      const data = encodeFunctionData({
        abi: SWARMPOLL_ABI,
        functionName: "stake",
        args: [BigInt(pollId), BigInt(optionId), amountBigInt],
      });

      await sendTransaction({
        to: SWARMPOLL_CONTRACT_ADDRESS,
        data,
        gas: 200000n,
        gasPrice: 1000000000n, // 1 gwei - very low for testnet
      });
      
      toast({
        title: "Stake successful!",
        description: `You staked ${amount} USDC on this option.`,
      });
      
      await Promise.all([
        refetchBalance(),
        refetchAllowance(),
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
      const approved = await approveUSDC(amount);
      if (!approved) return;
    }

    // Now stake
    await stakeUSDC(amount);
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
    
    // Computed values
    needsApproval: checkNeedsApproval,
    hasBalance: checkHasBalance,
    
    // Actions
    approveUSDC,
    stakeUSDC,
    handleStake,
    
    // Refetch functions
    refetchBalance,
    refetchAllowance,
  };
}
