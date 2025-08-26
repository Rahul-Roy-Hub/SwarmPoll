"use client"

import { useState } from "react"
import { useAccount, useWriteContract, useReadContract } from "wagmi"
import { parseUnits } from "viem"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, TrendingUp, Wallet } from "lucide-react"
import { SWARMPOLL_CONTRACT_ADDRESS, SWARMPOLL_ABI, USDC_CONTRACT_ADDRESS, USDC_ABI } from "@/lib/constants"
import { useToast } from "@/hooks/use-toast"

interface StakeOptionProps {
  pollId: string
  option: {
    id: string
    label: string
    totalStaked: string
  }
  totalPollStaked: string
  userStake?: string
  isEnded: boolean
  winningOption?: string
}

export function StakeOption({ pollId, option, totalPollStaked, userStake, isEnded, winningOption }: StakeOptionProps) {
  const [stakeAmount, setStakeAmount] = useState("")
  const [isApproving, setIsApproving] = useState(false)
  const [isStaking, setIsStaking] = useState(false)
  const { address } = useAccount()
  const { toast } = useToast()
  const { writeContract } = useWriteContract()

  // Read USDC balance and allowance
  const { data: usdcBalance } = useReadContract({
    address: USDC_CONTRACT_ADDRESS,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  })

  const { data: allowance } = useReadContract({
    address: USDC_CONTRACT_ADDRESS,
    abi: USDC_ABI,
    functionName: "allowance",
    args: address ? [address, SWARMPOLL_CONTRACT_ADDRESS] : undefined,
  })

  const optionStaked = Number.parseFloat(option.totalStaked) / 1e6
  const totalStaked = Number.parseFloat(totalPollStaked) / 1e6
  const percentage = totalStaked > 0 ? (optionStaked / totalStaked) * 100 : 0
  const userStakeAmount = userStake ? Number.parseFloat(userStake) / 1e6 : 0

  // Calculate potential payout multiplier
  const otherOptionsStaked = totalStaked - optionStaked
  const potentialMultiplier = optionStaked > 0 ? totalStaked / optionStaked : 1

  const isWinningOption = isEnded && winningOption === option.id
  const isLosingOption = isEnded && winningOption !== option.id

  const handleApprove = async () => {
    if (!stakeAmount || !address) return

    setIsApproving(true)
    try {
      const amount = parseUnits(stakeAmount, 6) // USDC has 6 decimals

      await writeContract({
        address: USDC_CONTRACT_ADDRESS,
        abi: USDC_ABI,
        functionName: "approve",
        args: [SWARMPOLL_CONTRACT_ADDRESS, amount],
      })

      toast({
        title: "Approval submitted",
        description: "Please wait for the transaction to confirm",
      })
    } catch (error) {
      toast({
        title: "Approval failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
    }
  }

  const handleStake = async () => {
    if (!stakeAmount || !address) return

    setIsStaking(true)
    try {
      const amount = parseUnits(stakeAmount, 6)

      await writeContract({
        address: SWARMPOLL_CONTRACT_ADDRESS,
        abi: SWARMPOLL_ABI,
        functionName: "stake",
        args: [BigInt(pollId), BigInt(option.id), amount],
      })

      toast({
        title: "Stake submitted",
        description: "Your stake is being processed",
      })
      setStakeAmount("")
    } catch (error) {
      toast({
        title: "Staking failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsStaking(false)
    }
  }

  const needsApproval = stakeAmount && allowance && parseUnits(stakeAmount, 6) > allowance
  const hasBalance = usdcBalance && parseUnits(stakeAmount || "0", 6) <= usdcBalance

  return (
    <Card
      className={`transition-all duration-200 ${isWinningOption ? "ring-2 ring-green-500 bg-green-50 dark:bg-green-950" : isLosingOption ? "opacity-75" : "hover:shadow-md"}`}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Option Header */}
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg leading-tight pr-4">{option.label}</h3>
            <div className="flex gap-2 shrink-0">
              {isWinningOption && <Badge className="bg-green-500">Winner</Badge>}
              {isLosingOption && <Badge variant="secondary">Lost</Badge>}
              <Badge variant="outline">{percentage.toFixed(1)}%</Badge>
            </div>
          </div>

          {/* Stakes Info */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Staked</span>
              <span className="font-medium">${optionStaked.toFixed(2)}</span>
            </div>
            <Progress value={percentage} className="h-2" />
            {userStakeAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Your Stake</span>
                <span className="font-medium text-primary">${userStakeAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Potential Payout */}
          {!isEnded && (
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Potential multiplier:</span>
                <span className="font-bold text-primary">{potentialMultiplier.toFixed(2)}x</span>
              </div>
            </div>
          )}

          {/* Staking Interface */}
          {!isEnded && address && (
            <div className="space-y-3 pt-2 border-t">
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Amount (USDC)"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
                {needsApproval ? (
                  <Button onClick={handleApprove} disabled={isApproving || !hasBalance} className="shrink-0">
                    {isApproving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Approve
                  </Button>
                ) : (
                  <Button
                    onClick={handleStake}
                    disabled={isStaking || !stakeAmount || !hasBalance}
                    className="shrink-0"
                  >
                    {isStaking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Stake
                  </Button>
                )}
              </div>
              {!hasBalance && stakeAmount && <p className="text-sm text-destructive">Insufficient USDC balance</p>}
            </div>
          )}

          {/* Connect Wallet Prompt */}
          {!isEnded && !address && (
            <div className="text-center py-4 border-t">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Wallet className="w-4 h-4" />
                <span className="text-sm">Connect wallet to stake</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
