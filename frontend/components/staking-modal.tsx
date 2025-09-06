"use client";

import { useState } from "react";
import { useStaking } from "@/hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Wallet, TrendingUp, DollarSign } from "lucide-react";

interface StakingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pollId: string;
  pollQuestion: string;
  option: {
    id: string;
    label: string;
    totalStaked: string;
  };
  totalPollStaked: string;
}

export function StakingModal({
  isOpen,
  onClose,
  pollId,
  pollQuestion,
  option,
  totalPollStaked,
}: StakingModalProps) {
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
  } = useStaking(pollId, option.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;
    
    const success = await handleStake(stakeAmount);
    if (success) {
      setStakeAmount("");
      onClose();
    }
  };

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toFixed(2);
  };

  const calculatePercentage = () => {
    const total = parseFloat(totalPollStaked) / 1e6;
    const optionTotal = parseFloat(option.totalStaked) / 1e6;
    return total > 0 ? (optionTotal / total) * 100 : 0;
  };

  const calculatePotentialMultiplier = () => {
    const total = parseFloat(totalPollStaked) / 1e6;
    const optionTotal = parseFloat(option.totalStaked) / 1e6;
    return optionTotal > 0 ? total / optionTotal : 1;
  };

  if (!isConnected) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription>
              Please connect your wallet to stake on polls.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <Wallet className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                Connect your wallet to start staking
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Stake in Poll</DialogTitle>
          <DialogDescription>
            Stake USDC on your prediction to win rewards
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Poll Info */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Poll Question:</p>
                <p className="font-medium text-sm">{pollQuestion}</p>
                
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-muted-foreground">Your Option:</span>
                  <Badge variant="outline">{option.label}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Option Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Staked</p>
                    <p className="font-semibold">${formatAmount(option.totalStaked)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Market Share</p>
                    <p className="font-semibold">{calculatePercentage().toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Potential Multiplier */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Potential Multiplier</p>
                <p className="text-2xl font-bold text-primary">
                  {calculatePotentialMultiplier().toFixed(2)}x
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  If this option wins, you could get {calculatePotentialMultiplier().toFixed(2)}x your stake back
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Staking Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stake-amount">Stake Amount (USDC)</Label>
              <Input
                id="stake-amount"
                type="number"
                placeholder="0.00"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                min="0"
                step="0.01"
                required
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Your Balance: ${usdcBalance} USDC</span>
                <span>Your Stake: ${userStake} USDC</span>
              </div>
            </div>

            {/* Error Messages */}
            {stakeAmount && !hasBalance(stakeAmount) && (
              <p className="text-sm text-destructive">
                Insufficient USDC balance
              </p>
            )}

            {stakeAmount && needsApproval(stakeAmount) && (
              <p className="text-sm text-amber-600">
                You need to approve USDC spending first
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !stakeAmount ||
                  parseFloat(stakeAmount) <= 0 ||
                  !hasBalance(stakeAmount) ||
                  isApproving ||
                  isStaking
                }
                className="flex-1"
              >
                {isApproving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isStaking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isApproving ? "Approving..." : isStaking ? "Staking..." : "Confirm Stake"}
              </Button>
            </div>
          </form>

          {/* Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• You can stake any amount of USDC</p>
            <p>• If your option wins, you'll receive rewards proportional to your stake</p>
            <p>• You can stake multiple times on the same option</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
