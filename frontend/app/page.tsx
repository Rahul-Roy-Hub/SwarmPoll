"use client"

import { PollsList } from "@/components/polls-list"
import { Button } from "@/components/ui/button"
import { Plus, Users, Trophy, TrendingUp, Clock, DollarSign, MessageSquare, Crown, ArrowRight, Sparkles, Target, Zap, Shield, Star, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAccount, useReadContract } from "wagmi"
import { SWARMPOLL_CONTRACT_ADDRESS, SWARMPOLL_ABI, ADMIN_ADDRESS } from "@/contracts"
import { useState, useEffect } from "react"

export default function HomePage() {
  const { address, isConnected } = useAccount()
  const [mounted, setMounted] = useState(false)
  const uiAdmin = ADMIN_ADDRESS?.toLowerCase?.() || ""
  
  // Check if connected user is the contract owner
  const { data: ownerAddress } = useReadContract({
    address: SWARMPOLL_CONTRACT_ADDRESS,
    abi: SWARMPOLL_ABI,
    functionName: "owner",
  })

  const isOwner =
    !!address && (
      (ownerAddress && address.toLowerCase() === (ownerAddress as string).toLowerCase()) ||
      (uiAdmin && address.toLowerCase() === uiAdmin)
    )

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-background">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02),transparent_50%)]" />
        </div>
        
        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-xl animate-pulse" />
          <div className="absolute top-40 right-20 w-24 h-24 bg-blue-500/5 rounded-full blur-xl animate-pulse delay-1000" />
          <div className="absolute bottom-40 left-20 w-40 h-40 bg-green-500/5 rounded-full blur-xl animate-pulse delay-2000" />
        </div>

        <div className="relative z-10 text-center space-y-12 max-w-6xl mx-auto px-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium backdrop-blur-sm animate-fade-in">
            <Sparkles className="w-4 h-4" />
            Revolutionary Social Prediction Markets
            <Sparkles className="w-4 h-4" />
          </div>
          
          {/* Main heading */}
          <div className="space-y-8">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Swarm</span>
              <span className="ml-2 bg-gradient-to-r from-amber-500 to-amber-400 bg-clip-text text-transparent">Poll</span>
              <div className="flex items-center justify-center gap-6 mt-4">
                <Image 
                  src="/swarmpoll-logo.png" 
                  alt="SwarmPoll Logo" 
                  width={100} 
                  height={100} 
                  className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 animate-bounce"
                />
              </div>
            </h1>
            
            <p className="text-2xl md:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light">
              Predict what others will choose, not what will happen. 
              <span className="text-foreground font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {" "}Win rewards from the collective wisdom.
              </span>
            </p>
          </div>

          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 backdrop-blur-sm border border-emerald-500/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:from-emerald-500/30 hover:to-emerald-600/30">
              <Target className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">Real-time Staking</span>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-blue-500/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:from-blue-500/30 hover:to-blue-600/30">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-blue-700 dark:text-blue-400">Social Prediction</span>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 backdrop-blur-sm border border-amber-500/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:from-amber-500/30 hover:to-amber-600/30">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span className="font-semibold text-amber-700 dark:text-amber-400">Winner Takes All</span>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-purple-600/20 backdrop-blur-sm border border-purple-500/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:from-purple-500/30 hover:to-purple-600/30">
              <Shield className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-purple-700 dark:text-purple-400">Decentralized</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            {isOwner ? (
              <Link href="/create-poll">
                <Button size="lg" className="gap-3 px-10 py-8 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
                  <Crown className="w-6 h-6" />
                  Create New Poll (Admin)
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/suggest">
                <Button variant="outline" size="lg" className="gap-3 px-10 py-8 text-xl font-bold border-2 border-blue-500/50 hover:bg-blue-500/10 transition-all duration-300 hover:scale-105 text-blue-600 hover:text-blue-700">
                  <MessageSquare className="w-6 h-6" />
                  Suggest a Poll
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            )}
            <Link href="/profile">
              <Button variant="outline" size="lg" className="gap-3 px-10 py-8 text-xl font-bold border-2 border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300 hover:scale-105 text-purple-600 hover:text-purple-700">
                <Users className="w-6 h-6" />
                View Profile
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center space-y-8 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join the swarm intelligence and predict what the crowd will choose. It's not about being right, it's about predicting the collective choice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">1. Choose Your Prediction</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Browse active polls and choose which option you think the majority will select. Trust your instincts or analyze the crowd.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 bg-gradient-to-br from-green-500/5 to-green-500/10">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-bold">2. Stake Your Tokens</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Stake your USDC tokens on your chosen option. The more you stake, the more you can win, but also the more you can lose.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Trophy className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold">3. Win Rewards</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-lg leading-relaxed">
                  When the poll ends, winners split the entire pot. The more accurate your prediction, the bigger your share of the rewards.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center space-y-8 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">Platform Statistics</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join thousands of users making predictions and earning rewards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card className="text-center p-8 border-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-emerald-500/20">
              <CardContent className="p-0 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-600/30 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-4xl font-bold text-emerald-700 dark:text-emerald-400">Active</p>
                  <p className="text-lg text-emerald-600 dark:text-emerald-300">Polls Running</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8 border-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-blue-500/20">
              <CardContent className="p-0 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500/30 to-blue-600/30 flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-4xl font-bold text-blue-700 dark:text-blue-400">$0</p>
                  <p className="text-lg text-blue-600 dark:text-blue-300">Total Staked</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8 border-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-purple-500/20">
              <CardContent className="p-0 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500/30 to-purple-600/30 flex items-center justify-center">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-4xl font-bold text-purple-700 dark:text-purple-400">0</p>
                  <p className="text-lg text-purple-600 dark:text-purple-300">Active Users</p>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center p-8 border-0 bg-gradient-to-br from-amber-500/10 to-amber-600/10 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-amber-500/20">
              <CardContent className="p-0 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/30 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-amber-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-4xl font-bold text-amber-700 dark:text-amber-400">24/7</p>
                  <p className="text-lg text-amber-600 dark:text-amber-300">Trading</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Active Polls Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center space-y-8 mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Star className="w-8 h-8 text-primary" />
              <h2 className="text-4xl md:text-5xl font-bold">Active Polls</h2>
              <Star className="w-8 h-8 text-primary" />
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join the crowd and predict what others will choose. Every stake counts towards the collective wisdom.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4" />
              <span>Real-time updates • Live staking • Instant rewards</span>
            </div>
          </div>

          <PollsList />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">Ready to Start Predicting?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join the swarm intelligence revolution. Connect your wallet and start making predictions today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Link href="/suggest">
              <Button size="lg" className="gap-3 px-10 py-8 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                <MessageSquare className="w-6 h-6" />
                Suggest a Poll
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline" size="lg" className="gap-3 px-10 py-8 text-xl font-bold border-2 border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300 hover:scale-105 text-purple-600 hover:text-purple-700">
                <Users className="w-6 h-6" />
                View Profile
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
