"use client"

import { useQuery } from "@apollo/client/react"
import { GET_ACTIVE_POLLS } from "@/lib/subgraph"
import { PollCard } from "./poll-card"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, TrendingUp } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

type ActivePollsData = { polls: any[] }

export function PollsList() {
  const { data, loading, error } = useQuery<ActivePollsData>(GET_ACTIVE_POLLS, {
    pollInterval: 30000, // Refetch every 30 seconds
  })

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-2 bg-muted rounded"></div>
                  <div className="h-2 bg-muted rounded w-4/5"></div>
                  <div className="h-2 bg-muted rounded w-3/5"></div>
                </div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load polls. Please check your connection and try again.</AlertDescription>
      </Alert>
    )
  }

  const polls = data?.polls || []

  if (polls.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image 
              src="/swarmpoll-logo.png" 
              alt="SwarmPoll Logo" 
              width={48} 
              height={48} 
              className="w-12 h-12"
            />
            <TrendingUp className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Active Polls</h3>
          <p className="text-muted-foreground">
            There are no active polls at the moment. Check back later or create a new poll!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {polls.map((poll: any) => (
        <PollCard key={poll.id} poll={poll} />
      ))}
    </div>
  )
}
