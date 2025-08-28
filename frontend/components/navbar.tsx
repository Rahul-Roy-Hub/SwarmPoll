"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap, Users, Plus, User, Crown } from "lucide-react"
import { useAccount, useReadContract } from "wagmi"
import { SWARMPOLL_CONTRACT_ADDRESS, SWARMPOLL_ABI } from "@/lib/constants"

export function Navbar() {
  const { address, isConnected } = useAccount()
  
  // Check if connected user is the contract owner
  const { data: ownerAddress } = useReadContract({
    address: SWARMPOLL_CONTRACT_ADDRESS,
    abi: SWARMPOLL_ABI,
    functionName: "owner",
  })

  const isOwner = address && ownerAddress && address.toLowerCase() === ownerAddress.toLowerCase()

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary hover:text-primary/80 transition-colors">
            <Zap className="w-6 h-6" />
            SwarmPoll
          </Link>
          
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10 hover:text-primary transition-all">
                <Users className="w-4 h-4" />
                Polls
              </Button>
            </Link>
            {isOwner && (
              <Link href="/create-poll">
                <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10 hover:text-primary transition-all">
                  <Crown className="w-4 h-4" />
                  Create Poll
                </Button>
              </Link>
            )}
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10 hover:text-primary transition-all">
                <User className="w-4 h-4" />
                Profile
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <ConnectButton />
        </div>
      </div>
    </nav>
  )
}
