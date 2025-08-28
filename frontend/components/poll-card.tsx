"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, TrendingUp, Users, Target, Zap } from "lucide-react"
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
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20 hover:from-background hover:to-muted/30">
      <CardHeader className="pb-4 space-y-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-tight pr-4 font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
            {poll.question}
          </CardTitle>
          <Badge 
            variant={isExpired ? "destructive" : "secondary"} 
            className="shrink-0 px-3 py-1 font-medium border-0"
          >
            <Clock className="w-3 h-3 mr-1" />
            {timeRemaining}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">
            <TrendingUp className="w-4 h-4" />
            <span>${totalStaked.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{poll.options.length} options</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          {sortedOptions.slice(0, 3).map((option, index) => {
            const optionStaked = Number.parseFloat(option.totalStaked) / 1e6
            const percentage = totalStaked > 0 ? (optionStaked / totalStaked) * 100 : 0
            const isLeading = index === 0

            return (
              <div key={option.id} className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {isLeading && (
                      <Badge variant="default" className="px-2 py-0.5 text-xs bg-primary text-primary-foreground">
                        <Target className="w-3 h-3 mr-1" />
                        Leading
                      </Badge>
                    )}
                    <span className="font-medium text-sm truncate pr-2">{option.label}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold text-foreground">${optionStaked.toFixed(2)}</span>
                    <Badge variant="outline" className="text-xs px-2 py-0.5 border-primary/20 text-primary">
                      {percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                <div className="relative">
                  <Progress 
                    value={percentage} 
                    className="h-3 bg-muted/50" 
                    style={{
                      '--progress-background': isLeading ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'
                    } as React.CSSProperties}
                  />
                  {isLeading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full" />
                  )}
                </div>
              </div>
            )
          })}

          {poll.options.length > 3 && (
            <div className="text-center">
              <Badge variant="outline" className="text-xs px-3 py-1 border-dashed">
                +{poll.options.length - 3} more options
              </Badge>
            </div>
          )}
        </div>

        <Link href={`/poll/${poll.id}`} className="block">
          <Button 
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200 font-semibold py-3" 
            disabled={isExpired}
            variant={isExpired ? "outline" : "default"}
          >
            {isExpired ? (
              <>
                <Clock className="w-4 h-4 mr-2" />
                View Results
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                View Poll & Stake
              </>
            )}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
