import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { USDC_CONTRACT_ADDRESS, USDC_ABI, SWARMPOLL_CONTRACT_ADDRESS } from "@/contracts";
import { useToast } from "@/hooks/use-toast";

export function useUSDC() {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  const { toast } = useToast();

  // Get USDC balance
  const { data: balance } = useReadContract({
    address: USDC_CONTRACT_ADDRESS,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  // Get allowance for SwarmPoll contract
  const { data: allowance } = useReadContract({
    address: USDC_CONTRACT_ADDRESS,
    abi: USDC_ABI,
    functionName: "allowance",
    args: address ? [address, SWARMPOLL_CONTRACT_ADDRESS] : undefined,
  });

  const approve = async (amount: bigint) => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to approve USDC.",
        variant: "destructive",
      });
      return;
    }

    try {
      await writeContract({
        address: USDC_CONTRACT_ADDRESS,
        abi: USDC_ABI,
        functionName: "approve",
        args: [SWARMPOLL_CONTRACT_ADDRESS, amount],
        gas: 100000n, // Fixed gas limit for approval
      });
      
      toast({
        title: "USDC approved!",
        description: "You can now stake on polls.",
      });
    } catch (error) {
      toast({
        title: "Approval failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    balance,
    allowance,
    approve,
    isConnected,
    address,
  };
}
