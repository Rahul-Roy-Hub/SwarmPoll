"use client"

import { useQuery } from "@apollo/client/react"
import { useAccount } from "wagmi"
import { GET_POLL_BY_ID } from "@/lib/subgraph"
import { StakeOption } from "@/components/stake-option"
import { PollTimer } from "@/components/poll-timer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Users, TrendingUp, Trophy, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function PollDetailPage() {
  const params = useParams()
  const pollId = params.id as string
  const { address } = useAccount()

  const { data, loading, error, refetch } = useQuery(GET_POLL_BY_ID, {
    variables: {
      id: pollId,
      userAddress: address || "0x0000000000000000000000000000000000000000",
    },
    pollInterval: 10000, // Refetch every 10 seconds
    skip: !pollId,
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !data?.poll) {
    return (
      <div className="space-y-6">
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Polls
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error ? "Failed to load poll data" : "Poll not found"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const poll = data.poll
  const totalStaked = Number.parseFloat(poll.totalStaked) / 1e6
  const userStakes = poll.stakes || []

  // Create a map of user stakes by option ID
  const userStakeMap = userStakes.reduce((acc: any, stake: any) => {
    acc[stake.option.id] = stake.amount
    return acc
  }, {})

  const sortedOptions = [...poll.options].sort(
    (a, b) => Number.parseFloat(b.totalStaked) - Number.parseFloat(a.totalStaked),
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Polls
          </Button>
        </Link>
        <PollTimer endTime={poll.endTime} isEnded={poll.isEnded} />
      </div>

      {/* Poll Info */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <CardTitle className="text-2xl leading-tight">{poll.question}</CardTitle>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Total Staked:</span>
                <span className="font-semibold">${totalStaked.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Options:</span>
                <span className="font-semibold">{poll.options.length}</span>
              </div>
              {poll.isEnded && poll.winningOption && (
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-green-500" />
                  <span className="text-muted-foreground">Winner:</span>
                  <Badge className="bg-green-500">
                    {sortedOptions.find((opt) => opt.id === poll.winningOption)?.label}
                  </Badge>
                </div>
              )}
            </div>

            {poll.isEnded && (
              <Alert>
                <Trophy className="h-4 w-4" />
                <AlertDescription>
                  This poll has ended.{" "}
                  {poll.winningOption ? "Winners can claim their rewards!" : "Results are being finalized."}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Options */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{poll.isEnded ? "Final Results" : "Choose Your Prediction"}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {sortedOptions.map((option) => (
            <StakeOption
              key={option.id}
              pollId={pollId}
              option={option}
              totalPollStaked={poll.totalStaked}
              userStake={userStakeMap[option.id]}
              isEnded={poll.isEnded}
              winningOption={poll.winningOption}
            />
          ))}
        </div>
      </div>

      {/* User Summary */}
      {address && userStakes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Stakes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userStakes.map((stake: any) => {
                const stakeAmount = Number.parseFloat(stake.amount) / 1e6
                const isWinner = poll.isEnded && poll.winningOption === stake.option.id

                return (
                  <div key={stake.id} className="flex justify-between items-center">
                    <span className="text-sm">{stake.option.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">${stakeAmount.toFixed(2)}</span>
                      {isWinner && <Badge className="bg-green-500 text-xs">Winner!</Badge>}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
