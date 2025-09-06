"use client";

import { useState } from "react";
import { useStaking } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, TrendingUp } from "lucide-react";

export function StakingExample() {
  const [pollId] = useState("0"); // Example poll ID
  const [optionId] = useState("0"); // Example option ID
  const [stakeAmount, setStakeAmount] = useState("");
  
  const {
    isConnected,
    usdcBalance,
    userStake,
    optionStake,
    needsApproval,
    hasBalance,
    isApproving,
    isStaking,
    handleStake,
  } = useStaking(pollId, optionId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;
    
    await handleStake(stakeAmount);
    setStakeAmount("");
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">Please connect your wallet to stake</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>USDC Staking Example</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Your Balance</p>
              <p className="font-semibold">{usdcBalance} USDC</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Your Stake</p>
              <p className="font-semibold">{userStake} USDC</p>
            </div>
          </div>
        </div>

        {/* Staking Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="text-sm font-medium">
              Stake Amount (USDC)
            </label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Status Messages */}
          {stakeAmount && needsApproval(stakeAmount) && (
            <Badge variant="outline" className="text-amber-600">
              Approval needed
            </Badge>
          )}

          {stakeAmount && !hasBalance(stakeAmount) && (
            <Badge variant="destructive">
              Insufficient balance
            </Badge>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={
              !stakeAmount ||
              parseFloat(stakeAmount) <= 0 ||
              !hasBalance(stakeAmount) ||
              isApproving ||
              isStaking
            }
            className="w-full"
          >
            {isApproving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isStaking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isApproving ? "Approving..." : isStaking ? "Staking..." : "Stake USDC"}
          </Button>
        </form>

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Poll ID: {pollId}</p>
          <p>• Option ID: {optionId}</p>
          <p>• Option Total Staked: {optionStake} USDC</p>
        </div>
      </CardContent>
    </Card>
  );
}
