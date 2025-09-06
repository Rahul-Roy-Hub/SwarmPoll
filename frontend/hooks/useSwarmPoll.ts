import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { SWARMPOLL_CONTRACT_ADDRESS, SWARMPOLL_ABI } from "@/contracts";
import { useToast } from "@/hooks/use-toast";

export function useSwarmPoll() {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  const { toast } = useToast();

  // Get contract owner
  const { data: ownerAddress } = useReadContract({
    address: SWARMPOLL_CONTRACT_ADDRESS,
    abi: SWARMPOLL_ABI,
    functionName: "owner",
  });

  // Get total poll count
  const { data: pollCount } = useReadContract({
    address: SWARMPOLL_CONTRACT_ADDRESS,
    abi: SWARMPOLL_ABI,
    functionName: "getPollCount",
  });

  const isOwner = address && ownerAddress && 
    address.toLowerCase() === (ownerAddress as string).toLowerCase();

  const createPoll = async (question: string, options: string[], endTime: bigint) => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a poll.",
        variant: "destructive",
      });
      return;
    }

    try {
      await writeContract({
        address: SWARMPOLL_CONTRACT_ADDRESS,
        abi: SWARMPOLL_ABI,
        functionName: "createPoll",
        args: [question, options, endTime],
        gas: 300000n, // Fixed gas limit for creating poll
      });
      
      toast({
        title: "Poll created!",
        description: "Your poll has been successfully created.",
      });
    } catch (error) {
      toast({
        title: "Failed to create poll",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const declareWinner = async (pollId: bigint, winningOptionId: bigint) => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to declare winner.",
        variant: "destructive",
      });
      return;
    }

    try {
      await writeContract({
        address: SWARMPOLL_CONTRACT_ADDRESS,
        abi: SWARMPOLL_ABI,
        functionName: "declareWinner",
        args: [pollId, winningOptionId],
        gas: 150000n, // Fixed gas limit for declaring winner
      });
      
      toast({
        title: "Winner declared!",
        description: "The poll winner has been successfully declared.",
      });
    } catch (error) {
      toast({
        title: "Failed to declare winner",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    isConnected,
    address,
    isOwner,
    ownerAddress,
    pollCount,
    createPoll,
    declareWinner,
  };
}
