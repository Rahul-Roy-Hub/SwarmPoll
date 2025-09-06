"use client"

import { useState } from "react"
import { useWriteContract } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Crown, CheckCircle, Clock } from "lucide-react"
import { SWARMPOLL_CONTRACT_ADDRESS, SWARMPOLL_ABI } from "@/contracts"
import { useToast } from "@/hooks/use-toast"

interface AdminPollsListProps {
  polls: any[]
}

export function AdminPollsList({ polls }: AdminPollsListProps) {
  const [declaringWinner, setDeclaringWinner] = useState<string | null>(null)
  const { writeContract } = useWriteContract()
  const { toast } = useToast()

  const handleDeclareWinner = async (pollId: string, winningOptionId: string) => {
    setDeclaringWinner(pollId)
    try {
      await writeContract({
        address: SWARMPOLL_CONTRACT_ADDRESS,
        abi: SWARMPOLL_ABI,
        functionName: "declareWinner",
        args: [BigInt(pollId), BigInt(winningOptionId)],
      })

      toast({
        title: "Winner declaration submitted",
        description: "The winning option is being set",
      })
    } catch (error) {
      toast({
        title: "Declaration failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setDeclaringWinner(null)
    }
  }

  const endedPolls = polls.filter((poll) => {
    const endTime = Number.parseInt(poll.endTime) * 1000
    return Date.now() > endTime && !poll.isEnded
  })

  const activePolls = polls.filter((poll) => {
    const endTime = Number.parseInt(poll.endTime) * 1000
    return Date.now() <= endTime
  })

  const completedPolls = polls.filter((poll) => poll.isEnded)

  if (polls.length === 0) {
    return (
      <Alert>
        <Crown className="h-4 w-4" />
        <AlertDescription>No polls found. Create your first poll to get started!</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Polls Needing Winner Declaration */}
      {endedPolls.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-orange-600">Polls Needing Winner Declaration</h3>
          <div className="grid gap-4">
            {endedPolls.map((poll) => {
              const sortedOptions = [...poll.options].sort(
                (a, b) => Number.parseFloat(b.totalStaked) - Number.parseFloat(a.totalStaked),
              )
              const topOption = sortedOptions[0]

              return (
                <Card key={poll.id} className="border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-lg">{poll.question}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Leading option: <span className="font-medium">{topOption.label}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total staked: ${(Number.parseFloat(topOption.totalStaked) / 1e6).toFixed(2)}
                      </p>
                    </div>

                    <Button
                      onClick={() => handleDeclareWinner(poll.id, topOption.id)}
                      disabled={declaringWinner === poll.id}
                      className="w-full"
                    >
                      {declaringWinner === poll.id && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Declare "{topOption.label}" as Winner
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Active Polls */}
      {activePolls.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Active Polls ({activePolls.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {activePolls.map((poll) => (
              <Card key={poll.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base leading-tight pr-4">{poll.question}</CardTitle>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>Options: {poll.options.length}</p>
                    <p>Total Staked: ${(Number.parseFloat(poll.totalStaked) / 1e6).toFixed(2)}</p>
                    <p>Ends: {new Date(Number.parseInt(poll.endTime) * 1000).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Polls */}
      {completedPolls.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Completed Polls ({completedPolls.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {completedPolls.map((poll) => {
              const winningOption = poll.options.find((opt: any) => opt.id === poll.winningOption)

              return (
                <Card key={poll.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base leading-tight pr-4">{poll.question}</CardTitle>
                      <Badge className="bg-green-500">Complete</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p>
                        Winner: <span className="font-medium">{winningOption?.label}</span>
                      </p>
                      <p>Total Staked: ${(Number.parseFloat(poll.totalStaked) / 1e6).toFixed(2)}</p>
                      <p>Ended: {new Date(Number.parseInt(poll.endTime) * 1000).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
