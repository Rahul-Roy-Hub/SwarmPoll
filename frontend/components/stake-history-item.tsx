"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, X, Clock } from "lucide-react"
import Link from "next/link"

interface StakeHistoryItemProps {
  pollId: string
  pollQuestion: string
  optionLabel: string
  userStake: string
  isEnded: boolean
  isWinner?: boolean
  totalStaked: string
  endTime: string
}

export function StakeHistoryItem({
  pollId,
  pollQuestion,
  optionLabel,
  userStake,
  isEnded,
  isWinner,
  totalStaked,
  endTime,
}: StakeHistoryItemProps) {
  const stakeAmount = Number.parseFloat(userStake) / 1e6
  const totalAmount = Number.parseFloat(totalStaked) / 1e6

  const getStatusIcon = () => {
    if (!isEnded) return <Clock className="w-4 h-4 text-blue-500" />
    if (isWinner) return <Trophy className="w-4 h-4 text-green-500" />
    return <X className="w-4 h-4 text-red-500" />
  }

  const getStatusBadge = () => {
    if (!isEnded) return <Badge variant="secondary">Active</Badge>
    if (isWinner) return <Badge className="bg-green-500">Won</Badge>
    return <Badge variant="destructive">Lost</Badge>
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <Link href={`/poll/${pollId}`} className="hover:underline">
              <h3 className="font-medium leading-tight pr-4">{pollQuestion}</h3>
            </Link>
            {getStatusBadge()}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {getStatusIcon()}
            <span>
              Staked on: <span className="font-medium text-foreground">{optionLabel}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Your Stake</span>
              <p className="font-semibold">${stakeAmount.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Pool</span>
              <p className="font-medium">${totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
