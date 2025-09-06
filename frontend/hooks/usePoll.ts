import { useReadContract } from "wagmi";
import { SWARMPOLL_CONTRACT_ADDRESS, SWARMPOLL_ABI } from "@/contracts";

export function usePoll(pollId: bigint) {
  // Get poll details
  const { data: pollData, isLoading: pollLoading } = useReadContract({
    address: SWARMPOLL_CONTRACT_ADDRESS,
    abi: SWARMPOLL_ABI,
    functionName: "getPoll",
    args: [pollId],
  });

  return {
    poll: pollData,
    isLoading: pollLoading,
  };
}

export function usePollStakes(pollId: bigint, optionCount: number) {
  const stakes = [];
  
  // Get stakes for each option
  for (let i = 0; i < optionCount; i++) {
    const { data: stake } = useReadContract({
      address: SWARMPOLL_CONTRACT_ADDRESS,
      abi: SWARMPOLL_ABI,
      functionName: "getOptionStake",
      args: [pollId, BigInt(i)],
    });
    stakes.push(stake || 0n);
  }

  return stakes;
}

export function useUserStakes(pollId: bigint, userAddress: string, optionCount: number) {
  const userStakes = [];
  
  if (!userAddress) return userStakes;

  // Get user stakes for each option
  for (let i = 0; i < optionCount; i++) {
    const { data: stake } = useReadContract({
      address: SWARMPOLL_CONTRACT_ADDRESS,
      abi: SWARMPOLL_ABI,
      functionName: "getUserStake",
      args: [pollId, userAddress as `0x${string}`, BigInt(i)],
    });
    userStakes.push(stake || 0n);
  }

  return userStakes;
}

export function useUserClaimStatus(pollId: bigint, userAddress: string) {
  const { data: hasClaimed } = useReadContract({
    address: SWARMPOLL_CONTRACT_ADDRESS,
    abi: SWARMPOLL_ABI,
    functionName: "hasUserClaimed",
    args: userAddress ? [pollId, userAddress as `0x${string}`] : undefined,
  });

  return hasClaimed;
}
