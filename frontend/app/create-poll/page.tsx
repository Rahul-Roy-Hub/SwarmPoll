"use client"

import { useAccount, useReadContract } from "wagmi"
import { useQuery } from "@apollo/client/react"
import { GET_ACTIVE_POLLS } from "@/lib/subgraph"
import { CreatePollForm } from "@/components/create-poll-form"
import { AdminPollsList } from "@/components/admin-polls-list"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Shield, Crown, Wallet, AlertTriangle } from "lucide-react"
import { SWARMPOLL_CONTRACT_ADDRESS, SWARMPOLL_ABI, ADMIN_ADDRESS } from "@/lib/constants"

type ActivePollsData = { polls: any[] }

export default function CreatePollPage() {
  const { address, isConnected } = useAccount()
  const uiAdmin = ADMIN_ADDRESS?.toLowerCase?.() || ""

  // Check if connected user is the contract owner
  const { data: ownerAddress, isLoading: ownerLoading } = useReadContract({
    address: SWARMPOLL_CONTRACT_ADDRESS,
    abi: SWARMPOLL_ABI,
    functionName: "owner",
  })

  // Get all polls for admin management
  const { data: pollsData, loading: pollsLoading } = useQuery<ActivePollsData>(GET_ACTIVE_POLLS, {
    pollInterval: 30000,
    skip:
      !address ||
      (!ownerAddress && (!uiAdmin || address.toLowerCase() !== uiAdmin)) ||
      (ownerAddress &&
        address.toLowerCase() !== (ownerAddress as string)?.toLowerCase() &&
        (!uiAdmin || address.toLowerCase() !== uiAdmin)),
  })

  const isOwner =
    !!address && (
      (ownerAddress && address.toLowerCase() === (ownerAddress as string).toLowerCase()) ||
      (uiAdmin && address.toLowerCase() === uiAdmin)
    )

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Crown className="w-8 h-8 text-emerald-600" />
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">Admin Panel</span>
          </h1>
          <p className="text-muted-foreground">Connect your wallet to access admin features</p>
        </div>

        <Card className="text-center py-12 bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 border border-emerald-500/20">
          <CardContent>
            <Wallet className="h-12 w-12 mx-auto text-emerald-600 mb-4" />
            <h3 className="text-lg font-semibold mb-4 text-emerald-700 dark:text-emerald-400">Connect Your Wallet</h3>
            <p className="text-muted-foreground mb-6">Only the contract owner can create and manage polls</p>
            <ConnectButton />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (ownerLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Crown className="w-8 h-8 text-emerald-600" />
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">Admin Panel</span>
          </h1>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Access denied. Only the contract owner can create and manage polls.</AlertDescription>
        </Alert>

        <Card className="text-center py-12 bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 border border-emerald-500/20">
          <CardContent>
            <Shield className="h-12 w-12 mx-auto text-emerald-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-emerald-700 dark:text-emerald-400">Unauthorized Access</h3>
            <p className="text-muted-foreground">This page is restricted to the contract owner only.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Crown className="w-8 h-8 text-emerald-600" />
          <span className="bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">Admin Panel</span>
        </h1>
        <p className="text-muted-foreground">Create new polls and manage existing ones</p>
      </div>

      {/* Create Poll Form */}
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Crown className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-semibold text-emerald-700 dark:text-emerald-400 text-center">Create New Poll</h2>
        </div>
        <CreatePollForm />
      </div>

      {/* Manage Existing Polls */}
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-semibold text-emerald-700 dark:text-emerald-400 text-center">Manage Polls</h2>
        </div>
        {pollsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <AdminPollsList polls={pollsData?.polls || []} />
        )}
      </div>
    </div>
  )
}
