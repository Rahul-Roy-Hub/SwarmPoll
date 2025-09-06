"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWriteContract,
  useChainId,
} from "wagmi";
import { SWARMPOLL_CONTRACT_ADDRESS, SWARMPOLL_ABI } from "@/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Loader2, Clock, Coins, Award, CheckCircle } from "lucide-react";
import { parseUnits } from "viem";
import { getGasConfig } from "@/lib/gas-config";

type RawPoll = readonly [
  string,
  string[],
  bigint,
  boolean,
  bigint,
  boolean,
  bigint,
];

interface Poll {
  id: number;
  question: string;
  options: string[];
  endTime: number;
  active: boolean;
  totalStaked: bigint;
  winnerDeclared: boolean;
  winningOptionId: bigint;
}

function Countdown({ endTime }: { endTime: number }) {
  const [timeLeft, setTimeLeft] = useState(endTime * 1000 - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(endTime * 1000 - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (timeLeft <= 0) return <span className="text-red-500">Ended</span>;

  const h = Math.floor(timeLeft / (1000 * 60 * 60));
  const m = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <span className="text-sm text-muted-foreground">
      {h}h {m}m {s}s
    </span>
  );
}

export function PollsList() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const chainId = useChainId();

  // Get appropriate gas configuration based on network
  const getGasConfigForNetwork = (operation: 'SWARMPOLL_STAKE' | 'SWARMPOLL_CLAIM_REWARD') => {
    const config = getGasConfig(operation);
    
    console.log(`Current chain ID: ${chainId}`);
    console.log(`Operation: ${operation}`);
    
    // For Arbitrum Sepolia (421614), use very low gas prices
    if (chainId === 421614) {
      console.log('Using Arbitrum Sepolia gas config (1 gwei)');
      return {
        gas: config.gas,
        gasPrice: BigInt(1000000000), // 1 gwei for testnet
      };
    }
    
    // For Arbitrum mainnet (42161), use higher gas prices
    if (chainId === 42161) {
      console.log('Using Arbitrum mainnet gas config (2 gwei)');
      return {
        gas: config.gas,
        gasPrice: BigInt(2000000000), // 2 gwei for mainnet
      };
    }
    
    // For other networks, use standard configuration
    console.log(`Using default gas config for chain ${chainId}`);
    return config;
  };

  // Poll count
  const { data: pollCount } = useReadContract({
    address: SWARMPOLL_CONTRACT_ADDRESS,
    abi: SWARMPOLL_ABI,
    functionName: "getPollCount",
  });

  // Poll queries
  const pollQueries =
    pollCount && Number(pollCount) > 0
      ? Array.from({ length: Number(pollCount) }, (_, i) => ({
          address: SWARMPOLL_CONTRACT_ADDRESS,
          abi: SWARMPOLL_ABI,
          functionName: "getPoll",
          args: [BigInt(i)],
        }))
      : [];

  const { data: pollsData } = useReadContracts({ contracts: pollQueries });
  const [polls, setPolls] = useState<Poll[]>([]);

  useEffect(() => {
    if (!pollsData) return;
    const parsed: Poll[] = pollsData
      .map((res, i) => {
        if (res.status !== "success" || !res.result) return null;
        const raw = res.result as unknown as RawPoll;
        return {
          id: i,
          question: raw[0],
          options: raw[1],
          endTime: Number(raw[2]),
          active: raw[3],
          totalStaked: raw[4],
          winnerDeclared: raw[5],
          winningOptionId: raw[6],
        };
      })
      .filter((p): p is Poll => !!p);
    setPolls(parsed);
  }, [pollsData]);

  // Stake dialog state
  const [open, setOpen] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // User stakes
  const userStakeQueries =
    polls.length > 0 && address
      ? polls.flatMap((poll) =>
          poll.options.map((_, idx) => ({
            address: SWARMPOLL_CONTRACT_ADDRESS,
            abi: SWARMPOLL_ABI,
            functionName: "getUserStake",
            args: [BigInt(poll.id), address, BigInt(idx)],
          }))
        )
      : [];

  const { data: userStakesData } = useReadContracts({
    contracts: userStakeQueries,
  });

  const userStakes: Record<number, Record<number, bigint>> = {};
  if (userStakesData && address) {
    let idx = 0;
    for (const poll of polls) {
      userStakes[poll.id] = {};
      for (let opt = 0; opt < poll.options.length; opt++) {
        const res = userStakesData[idx++];
        userStakes[poll.id][opt] =
          res?.status === "success" && res.result
            ? (res.result as bigint)
            : BigInt(0);
      }
    }
  }

  // Stake handler
  const handleStake = async () => {
    if (!selectedPoll || selectedOption === null || !stakeAmount) return;
    
    // Validate amount
    const amountNum = parseFloat(stakeAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      console.error("Invalid amount:", stakeAmount);
      return;
    }
    
    // Prevent extremely large amounts (safety check)
    if (amountNum > 1000000) { // 1 million USDC max
      console.error("Amount too large:", stakeAmount);
      return;
    }
    
    try {
      setLoading(true);
      const amount = parseUnits(stakeAmount, 6); // USDC has 6 decimals
      const gasConfig = getGasConfigForNetwork('SWARMPOLL_STAKE');
      
      console.log('Staking amount:', stakeAmount, 'USDC');
      console.log('Parsed amount:', amount.toString());
      
      console.log('Staking with gas config:', gasConfig);
      
      await writeContractAsync({
        address: SWARMPOLL_CONTRACT_ADDRESS,
        abi: SWARMPOLL_ABI,
        functionName: "stake",
        args: [BigInt(selectedPoll.id), BigInt(selectedOption), amount],
        gas: gasConfig.gas,
        gasPrice: gasConfig.gasPrice,
      });
      setOpen(false);
      setStakeAmount("");
      setSelectedOption(null);
    } catch (err) {
      console.error("Stake error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (pollId: number) => {
    try {
      setLoading(true);
      const gasConfig = getGasConfigForNetwork('SWARMPOLL_CLAIM_REWARD');
      
      console.log('Claiming with gas config:', gasConfig);
      
      await writeContractAsync({
        address: SWARMPOLL_CONTRACT_ADDRESS,
        abi: SWARMPOLL_ABI,
        functionName: "claimReward",
        args: [BigInt(pollId)],
        gas: gasConfig.gas,
        gasPrice: gasConfig.gasPrice,
      });
    } catch (err) {
      console.error("Claim error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Polls</TabsTrigger>
          <TabsTrigger value="ended">Ended Polls</TabsTrigger>
        </TabsList>

      {/* Active Polls */}
      <TabsContent value="active">
        <div className="grid gap-4">
          {polls
            .filter((p) => p.active)
            .map((poll) => (
              <Card key={poll.id} className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>
                      #{poll.id} – {poll.question}
                    </span>
                    <Countdown endTime={poll.endTime} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Coins className="w-4 h-4" />
                    Total Staked: {poll.totalStaked.toString()}
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedPoll(poll);
                      setOpen(true);
                    }}
                  >
                    Stake
                  </Button>

                  {userStakes[poll.id] &&
                    Object.entries(userStakes[poll.id]).map(([optId, amt]) =>
                      amt > BigInt(0) ? (
                        <p
                          key={optId}
                          className="text-sm text-muted-foreground"
                        >
                          You staked {amt.toString()} on{" "}
                          <span className="font-medium">
                            {poll.options[+optId]}
                          </span>
                        </p>
                      ) : null
                    )}
                </CardContent>
              </Card>
            ))}
        </div>
      </TabsContent>

      {/* Ended Polls */}
      <TabsContent value="ended">
        <div className="grid gap-4">
          {polls
            .filter((p) => !p.active)
            .map((poll) => (
              <Card key={poll.id} className="shadow-md">
                <CardHeader>
                  <CardTitle>
                    #{poll.id} – {poll.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4" />
                    Winner Declared:{" "}
                    {poll.winnerDeclared ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      "Pending"
                    )}
                  </div>

                  {poll.winnerDeclared && (
                    <p className="text-sm">
                      Winning Option:{" "}
                      <span className="font-medium">
                        {poll.options[Number(poll.winningOptionId)]}
                      </span>
                    </p>
                  )}

                  {userStakes[poll.id] &&
                    Object.entries(userStakes[poll.id]).map(([optId, amt]) => {
                      if (amt > BigInt(0)) {
                        const isWinner =
                          poll.winnerDeclared &&
                          Number(optId) === Number(poll.winningOptionId);
                        return (
                          <div key={optId} className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              You staked {amt.toString()} on{" "}
                              <span className="font-medium">
                                {poll.options[+optId]}
                              </span>
                            </p>
                            {isWinner && (
                              <Button
                                onClick={() => handleClaim(poll.id)}
                                disabled={loading}
                              >
                                {loading ? (
                                  <Loader2 className="animate-spin" />
                                ) : (
                                  "Claim Reward"
                                )}
                              </Button>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })}
                </CardContent>
              </Card>
            ))}
        </div>
      </TabsContent>

      {/* Stake Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stake in Poll</DialogTitle>
          </DialogHeader>
          {selectedPoll && (
            <div className="space-y-4">
              {selectedPoll.options.map((opt, idx) => (
                <Button
                  key={idx}
                  variant={selectedOption === idx ? "default" : "outline"}
                  onClick={() => setSelectedOption(idx)}
                  className="w-full"
                >
                  {opt}
                </Button>
              ))}
              <Input
                placeholder="Enter amount (USDC)"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleStake} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Confirm Stake"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </Tabs>
    </div>
  );
}
