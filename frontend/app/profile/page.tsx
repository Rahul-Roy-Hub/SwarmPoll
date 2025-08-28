"use client"

import { useQuery } from "@apollo/client/react"
import { useAccount } from "wagmi"
import { GET_USER_STAKES, GET_USER_CLAIMS } from "@/lib/subgraph"
import { ClaimableReward } from "@/components/claimable-reward"
import { StakeHistoryItem } from "@/components/stake-history-item"
import { UserStats } from "@/components/user-stats"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Wallet, Trophy, History, TrendingUp, AlertCircle } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

export default function ProfilePage() {
  const { address, isConnected } = useAccount()

  type LocalProfile = {
    displayName: string
    bio: string
    avatarUrl: string
  }

  const [profile, setProfile] = useState<LocalProfile>({
    displayName: "",
    bio: "",
    avatarUrl: "/placeholder-user.jpg",
  })
  const [isSaving, setIsSaving] = useState(false)

  // Load profile from localStorage when wallet connects/changes
  useEffect(() => {
    if (!address) return
    try {
      const raw = localStorage.getItem(`sp_profile_${address}`)
      if (raw) {
        const parsed = JSON.parse(raw) as LocalProfile
        setProfile({
          displayName: parsed.displayName || "",
          bio: parsed.bio || "",
          avatarUrl: parsed.avatarUrl || "/placeholder-user.jpg",
        })
      } else {
        setProfile((prev) => ({ ...prev, displayName: "", bio: "" }))
      }
    } catch {
      // ignore malformed data
    }
  }, [address])

  const handleSaveProfile = () => {
    if (!address) return
    setIsSaving(true)
    try {
      localStorage.setItem(`sp_profile_${address}`, JSON.stringify(profile))
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result) {
        setProfile((p) => ({ ...p, avatarUrl: result }))
      }
    }
    reader.readAsDataURL(file)
  }

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

  const isLoading = stakesLoading

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

      {/* Data load error (non-blocking) */}
      {stakesError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load your on-chain activity. Profile editing still works.</AlertDescription>
        </Alert>
      )}

      {/* Profile Settings (always visible when connected) */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-[144px_1fr] items-start">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatarUrl} alt="avatar" />
                <AvatarFallback>
                  {address ? `${address.slice(2, 4)}${address.slice(-2)}`.toUpperCase() : "SP"}
                </AvatarFallback>
              </Avatar>
              <div className="w-full">
                <Label htmlFor="avatarFile">Upload Avatar</Label>
                <Input
                  id="avatarFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-xs"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display name</Label>
                <Input
                  id="displayName"
                  placeholder={address || "Your name"}
                  value={profile.displayName}
                  onChange={(e) => setProfile((p) => ({ ...p, displayName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell others about you"
                  value={profile.bio}
                  onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSaveProfile} disabled={!address || isSaving}>
                  {isSaving ? "Saving..." : "Save profile"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <UserStats {...userStats} />
      )}

      {/* Claimable Rewards */}
      {!isLoading && claimableStakes.length > 0 && (
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

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : stakes.length === 0 ? (
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
