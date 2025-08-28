"use client"

import { PollsList } from "@/components/polls-list"
import { Button } from "@/components/ui/button"
import { Plus, Zap, Users, Trophy, TrendingUp, Clock, DollarSign, MessageSquare, Crown } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useDiscussion } from "@/hooks/useDiscussion"
import { DiscussionBoard } from "@/components/discussion-board"

export default function HomePage() {
  const { isOwner, isConnected, handleDiscussionSubmit, isSubmitting, discussionTopic, setDiscussionTopic } = useDiscussion()

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-background pointer-events-none" />
        
        <div className="relative text-center space-y-8 py-16">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              Social Prediction Markets
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-tight">
              SwarmPoll
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light">
              Predict what others will choose, not what will happen. 
              <span className="text-foreground font-medium"> Win rewards from the collective wisdom.</span>
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/50">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-medium">Real-time staking</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/50">
              <Users className="w-4 h-4 text-primary" />
              <span className="font-medium">Social prediction</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/50">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="font-medium">Winner takes all</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isOwner ? (
              <Link href="/create-poll">
                <Button size="lg" className="gap-2 px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                  <Crown className="w-5 h-5" />
                  Create New Poll (Admin)
                </Button>
              </Link>
            ) : (
              <Link href="/create-poll">
                <Button variant="outline" size="lg" className="gap-2 px-8 py-6 text-lg font-semibold border-2">
                  <MessageSquare className="w-5 h-5" />
                  Suggest New Poll
                </Button>
              </Link>
            )}
            <Link href="/profile">
              <Button variant="outline" size="lg" className="gap-2 px-8 py-6 text-lg font-semibold border-2">
                View Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center p-6 border-0 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-0 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">Active</p>
              <p className="text-sm text-muted-foreground">Polls Running</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="text-center p-6 border-0 bg-gradient-to-br from-green-500/5 to-green-500/10">
          <CardContent className="p-0 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">Total</p>
              <p className="text-sm text-muted-foreground">Staked Value</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="text-center p-6 border-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
          <CardContent className="p-0 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">24/7</p>
              <p className="text-sm text-muted-foreground">Trading</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Polls Section - Now First */}
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">Active Polls</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join the crowd and predict what others will choose. Every stake counts towards the collective wisdom.
          </p>
        </div>

        <PollsList />
      </div>

      {/* Discussion Section for Non-Admins - Now Second */}
      {!isOwner && isConnected && (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
              <MessageSquare className="w-8 h-8 text-primary" />
              Suggest New Poll Topics
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have an idea for a new poll? Share it with the community and discuss potential topics!
            </p>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <form onSubmit={handleDiscussionSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="discussionTopic">Poll Topic Suggestion</Label>
                  <Textarea
                    id="discussionTopic"
                    placeholder="What kind of poll would you like to see? Describe your idea..."
                    value={discussionTopic}
                    onChange={(e) => setDiscussionTopic(e.target.value)}
                    rows={3}
                    maxLength={300}
                  />
                  <p className="text-xs text-muted-foreground">{discussionTopic.length}/300 characters</p>
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !discussionTopic.trim()} 
                  className="w-full"
                >
                  {isSubmitting ? "Submitting..." : "Submit Topic"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Discussion Board */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-center mb-6">Recent Poll Suggestions</h3>
            <DiscussionBoard />
          </div>
        </div>
      )}
    </div>
  )
}
