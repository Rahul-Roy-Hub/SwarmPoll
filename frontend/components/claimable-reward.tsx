"use client"

import { useState } from "react"
import { useWriteContract } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Trophy } from "lucide-react"
import { SWARMPOLL_CONTRACT_ADDRESS, SWARMPOLL_ABI } from "@/contracts"
import { useToast } from "@/hooks/use-toast"

interface ClaimableRewardProps {
  pollId: string
  pollQuestion: string
  winningOption: string
  userStake: string
  estimatedReward: string
  endTime: string
}

export function ClaimableReward({
  pollId,
  pollQuestion,
  winningOption,
  userStake,
  estimatedReward,
  endTime,
}: ClaimableRewardProps) {
  const [isClaiming, setIsClaiming] = useState(false)
  const { writeContract } = useWriteContract()
  const { toast } = useToast()

  const handleClaim = async () => {
    setIsClaiming(true)
    try {
      await writeContract({
        address: SWARMPOLL_CONTRACT_ADDRESS,
        abi: SWARMPOLL_ABI,
        functionName: "claim",
        args: [BigInt(pollId)],
      })

      toast({
        title: "Claim submitted",
        description: "Your reward is being processed",
      })
    } catch (error) {
      toast({
        title: "Claim failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsClaiming(false)
    }
  }

  const stakeAmount = Number.parseFloat(userStake) / 1e6
  const rewardAmount = Number.parseFloat(estimatedReward) / 1e6
  const multiplier = stakeAmount > 0 ? rewardAmount / stakeAmount : 0

  return (
    <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-tight pr-4">{pollQuestion}</CardTitle>
          <Badge className="bg-green-500 shrink-0">
            <Trophy className="w-3 h-3 mr-1" />
            Winner
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Your Stake</span>
            <p className="font-semibold">${stakeAmount.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Estimated Reward</span>
            <p className="font-semibold text-green-600">${rewardAmount.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Winning Option</span>
            <p className="font-medium">{winningOption}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Multiplier</span>
            <p className="font-semibold text-primary">{multiplier.toFixed(2)}x</p>
          </div>
        </div>

        <Button onClick={handleClaim} disabled={isClaiming} className="w-full bg-green-600 hover:bg-green-700">
          {isClaiming && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Claim ${rewardAmount.toFixed(2)}
        </Button>
      </CardContent>
    </Card>
  )
}
