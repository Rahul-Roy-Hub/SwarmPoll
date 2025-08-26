"use client"

import { PollsList } from "@/components/polls-list"
import { Button } from "@/components/ui/button"
import { Plus, Zap, Users, Trophy } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome to SwarmPoll
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            The social prediction game where you bet on what others will choose. Predict crowd psychology, not facts,
            and win rewards from the collective pool!
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span>Real-time staking</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span>Social prediction</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <span>Winner takes all</span>
          </div>
        </div>

        <Link href="/create-poll">
          <Button size="lg" className="gap-2">
            <Plus className="w-4 h-4" />
            Create New Poll
          </Button>
        </Link>
      </div>

      {/* Active Polls Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Active Polls</h2>
            <p className="text-muted-foreground">Join the crowd and predict what others will choose</p>
          </div>
        </div>

        <PollsList />
      </div>
    </div>
  )
}
