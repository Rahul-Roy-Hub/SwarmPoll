"use client"

import { useQuery } from "@apollo/client/react"
import { useAccount } from "wagmi"
import { GET_USER_STAKES, GET_USER_CLAIMS } from "@/lib/subgraph"
import { ClaimableReward } from "@/components/claimable-reward"
import { StakeHistoryItem } from "@/components/stake-history-item"
import { UserStats } from "@/components/user-stats"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Wallet, Trophy, History, TrendingUp, AlertCircle } from "lucide-react"
import { useMemo } from "react"

export default function ProfilePage() {
  const { address, isConnected } = useAccount()

  const {
    data: stakesData,
    loading: stakesLoading,
    error: stakesError,
  } = useQuery<{ stakes: any[] }>(GET_USER_STAKES, {
    variables: { userAddress: address || "0x0000000000000000000000000000000000000000" },
    skip: !address,
    pollInterval: 15000,
  })

  const { data: claimsData, loading: claimsLoading } = useQuery<{ claims: any[] }>(GET_USER_CLAIMS, {
    variables: { userAddress: address || "0x0000000000000000000000000000000000000000" },
    skip: !address,
    pollInterval: 15000,
  })

  const userStats = useMemo(() => {
    if (!stakesData?.stakes) {
      return {
        totalStaked: 0,
        totalWon: 0,
        totalLost: 0,
        winRate: 0,
        activePolls: 0,
        claimableRewards: 0,
      }
    }

    const stakes = stakesData.stakes
    const claims = claimsData?.claims || []

    let totalStaked = 0
    let totalWon = 0
    let totalLost = 0
    let wins = 0
    let losses = 0
    let activePolls = 0
    let claimableRewards = 0

    stakes.forEach((stake: any) => {
      const stakeAmount = Number.parseFloat(stake.amount) / 1e6
      totalStaked += stakeAmount

      if (!stake.poll.isEnded) {
        activePolls++
      } else if (stake.poll.winningOption === stake.option.id) {
        wins++
        // Check if already claimed
        const claimed = claims.some((claim: any) => claim.poll.id === stake.poll.id)
        if (!claimed) {
          // Estimate reward (simplified calculation)
          const estimatedReward = stakeAmount * 2 // Placeholder multiplier
          claimableRewards += estimatedReward
        }
      } else {
        losses++
        totalLost += stakeAmount
      }
    })

    // Add claimed rewards to totalWon
    claims.forEach((claim: any) => {
      totalWon += Number.parseFloat(claim.amount) / 1e6
    })

    const winRate = wins + losses > 0 ? (wins / (wins + losses)) * 100 : 0

    return {
      totalStaked,
      totalWon,
      totalLost,
      winRate,
      activePolls,
      claimableRewards,
    }
  }, [stakesData, claimsData])

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-muted-foreground">Connect your wallet to view your SwarmPoll activity</p>
        </div>

        <Card className="text-center py-12">
          <CardContent>
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-4">Connect Your Wallet</h3>
            <p className="text-muted-foreground mb-6">
              View your stake history, claimable rewards, and performance statistics
            </p>
            <ConnectButton />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (stakesLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (stakesError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load your profile data. Please try again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const stakes = stakesData?.stakes || []
  const claimableStakes = stakes.filter(
    (stake: any) =>
      stake.poll.isEnded &&
      stake.poll.winningOption === stake.option.id &&
      !claimsData?.claims?.some((claim: any) => claim.poll.id === stake.poll.id),
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <p className="text-muted-foreground">Track your SwarmPoll performance and claim your winnings</p>
      </div>

      {/* Stats */}
      <UserStats {...userStats} />

      {/* Claimable Rewards */}
      {claimableStakes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-green-500" />
            <h2 className="text-xl font-semibold">Claimable Rewards</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {claimableStakes.map((stake: any) => (
              <ClaimableReward
                key={`${stake.poll.id}-${stake.option.id}`}
                pollId={stake.poll.id}
                pollQuestion={stake.poll.question}
                winningOption={stake.option.label}
                userStake={stake.amount}
                estimatedReward={(Number.parseFloat(stake.amount) * 2).toString()} // Simplified calculation
                endTime={stake.poll.endTime}
              />
            ))}
          </div>
        </div>
      )}

      {/* Stake History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Your Stakes</h2>
        </div>

        {stakes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Stakes Yet</h3>
              <p className="text-muted-foreground mb-6">Start participating in polls to see your activity here</p>
              <Button asChild>
                <a href="/">Browse Active Polls</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {stakes.map((stake: any) => (
              <StakeHistoryItem
                key={`${stake.poll.id}-${stake.option.id}`}
                pollId={stake.poll.id}
                pollQuestion={stake.poll.question}
                optionLabel={stake.option.label}
                userStake={stake.amount}
                isEnded={stake.poll.isEnded}
                isWinner={stake.poll.isEnded && stake.poll.winningOption === stake.option.id}
                totalStaked={stake.poll.totalStaked}
                endTime={stake.poll.endTime}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
