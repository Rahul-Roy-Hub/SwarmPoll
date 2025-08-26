"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, TrendingUp, Users } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface PollOption {
  id: string
  label: string
  totalStaked: string
}

interface Poll {
  id: string
  question: string
  endTime: string
  totalStaked: string
  options: PollOption[]
}

interface PollCardProps {
  poll: Poll
}

export function PollCard({ poll }: PollCardProps) {
  const [timeRemaining, setTimeRemaining] = useState("")
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now()
      const endTime = Number.parseInt(poll.endTime) * 1000
      const diff = endTime - now

      if (diff <= 0) {
        setTimeRemaining("Ended")
        setIsExpired(true)
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h`)
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`)
      } else {
        setTimeRemaining(`${minutes}m`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [poll.endTime])

  const totalStaked = Number.parseFloat(poll.totalStaked) / 1e6 // Convert from USDC decimals
  const sortedOptions = [...poll.options].sort(
    (a, b) => Number.parseFloat(b.totalStaked) - Number.parseFloat(a.totalStaked),
  )

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-tight pr-4">{poll.question}</CardTitle>
          <Badge variant={isExpired ? "destructive" : "secondary"} className="shrink-0">
            <Clock className="w-3 h-3 mr-1" />
            {timeRemaining}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>${totalStaked.toFixed(2)} staked</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{poll.options.length} options</span>
          </div>
        </div>

        <div className="space-y-3">
          {sortedOptions.slice(0, 3).map((option, index) => {
            const optionStaked = Number.parseFloat(option.totalStaked) / 1e6
            const percentage = totalStaked > 0 ? (optionStaked / totalStaked) * 100 : 0

            return (
              <div key={option.id} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium truncate pr-2">{option.label}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-muted-foreground">${optionStaked.toFixed(2)}</span>
                    <Badge variant="outline" className="text-xs">
                      {percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}

          {poll.options.length > 3 && (
            <p className="text-xs text-muted-foreground text-center">+{poll.options.length - 3} more options</p>
          )}
        </div>

        <Link href={`/poll/${poll.id}`} className="block">
          <Button className="w-full" disabled={isExpired}>
            {isExpired ? "View Results" : "View Poll & Stake"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
