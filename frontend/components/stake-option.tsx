"use client"

import { useState } from "react"
import { useAccount, useReadContract } from "wagmi"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Wallet } from "lucide-react"
import { SWARMPOLL_CONTRACT_ADDRESS, SWARMPOLL_ABI } from "@/contracts"
import { StakingModal } from "@/components/staking-modal"

interface StakeOptionProps {
  pollId: string
  pollQuestion: string
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

export function StakeOption({ pollId, pollQuestion, option, totalPollStaked, userStake, isEnded, winningOption }: StakeOptionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { address } = useAccount()

  const optionStaked = Number.parseFloat(option.totalStaked) / 1e6
  const totalStaked = Number.parseFloat(totalPollStaked) / 1e6
  const percentage = totalStaked > 0 ? (optionStaked / totalStaked) * 100 : 0
  const userStakeAmount = userStake ? Number.parseFloat(userStake) / 1e6 : 0

  // Calculate potential payout multiplier
  const otherOptionsStaked = totalStaked - optionStaked
  const potentialMultiplier = optionStaked > 0 ? totalStaked / optionStaked : 1

  const isWinningOption = isEnded && winningOption === option.id
  const isLosingOption = isEnded && winningOption !== option.id


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
            <div className="pt-2 border-t">
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="w-full"
                variant="outline"
              >
                Stake USDC
              </Button>
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
      
      {/* Staking Modal */}
      <StakingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pollId={pollId}
        pollQuestion={pollQuestion}
        option={option}
        totalPollStaked={totalPollStaked}
      />
    </Card>
  )
}
