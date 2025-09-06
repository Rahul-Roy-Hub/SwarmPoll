"use client";

import { useState } from "react";
import { useSimpleStaking } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, CheckCircle, AlertCircle } from "lucide-react";

export function SimpleStakingTest() {
  const [pollId] = useState("0"); // Test poll ID
  const [optionId] = useState("0"); // Test option ID
  const [stakeAmount, setStakeAmount] = useState("");
  
  const {
    isConnected,
    usdcBalance,
    allowance,
    needsApproval,
    hasBalance,
    isApproving,
    isStaking,
    handleStake,
  } = useSimpleStaking(pollId, optionId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;
    
    console.log("Attempting to stake:", stakeAmount, "USDC");
    console.log("Needs approval:", needsApproval(stakeAmount));
    console.log("Has balance:", hasBalance(stakeAmount));
    
    await handleStake(stakeAmount);
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="font-semibold">Wallet Not Connected</h3>
              <p className="text-muted-foreground">Please connect your wallet to test staking</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Simple USDC Staking Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Your USDC Balance</p>
            <p className="text-2xl font-bold">{usdcBalance} USDC</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Current Allowance</p>
            <p className="text-2xl font-bold">{allowance} USDC</p>
          </div>
        </div>

        {/* Test Info */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Test Configuration</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>• Poll ID: {pollId}</p>
            <p>• Option ID: {optionId}</p>
            <p>• Gas Price: 1 gwei (very low for testnet)</p>
            <p>• Gas Limit: 200,000 (fixed)</p>
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
          {stakeAmount && (
            <div className="space-y-2">
              {needsApproval(stakeAmount) && (
                <Badge variant="outline" className="text-amber-600">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Approval needed first
                </Badge>
              )}

              {!hasBalance(stakeAmount) && (
                <Badge variant="destructive">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Insufficient balance
                </Badge>
              )}

              {hasBalance(stakeAmount) && !needsApproval(stakeAmount) && (
                <Badge variant="default" className="text-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Ready to stake
                </Badge>
              )}
            </div>
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
            size="lg"
          >
            {isApproving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isStaking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isApproving ? "Approving USDC..." : isStaking ? "Staking..." : "Test Stake"}
          </Button>
        </form>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• This uses sendTransaction with fixed gas parameters</p>
          <p>• Gas price is set to 1 gwei (very low for testnet)</p>
          <p>• Gas limit is fixed to prevent estimation errors</p>
          <p>• Check browser console for detailed logs</p>
        </div>
      </CardContent>
    </Card>
  );
}
