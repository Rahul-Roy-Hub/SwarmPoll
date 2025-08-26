"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle } from "lucide-react"

interface PollTimerProps {
  endTime: string
  isEnded?: boolean
}

export function PollTimer({ endTime, isEnded }: PollTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState("")
  const [expired, setExpired] = useState(isEnded || false)

  useEffect(() => {
    if (isEnded) {
      setExpired(true)
      setTimeRemaining("Ended")
      return
    }

    const updateTimer = () => {
      const now = Date.now()
      const endTimeMs = Number.parseInt(endTime) * 1000
      const diff = endTimeMs - now

      if (diff <= 0) {
        setTimeRemaining("Ended")
        setExpired(true)
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`)
      } else {
        setTimeRemaining(`${seconds}s`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [endTime, isEnded])

  return (
    <Badge variant={expired ? "destructive" : "secondary"} className="gap-1">
      {expired ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      {timeRemaining}
    </Badge>
  )
}
