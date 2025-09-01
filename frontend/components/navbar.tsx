"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Users, Plus, User, Crown, MessageSquare, Menu, X } from "lucide-react"
import { useAccount, useReadContract } from "wagmi"
import { SWARMPOLL_CONTRACT_ADDRESS, SWARMPOLL_ABI } from "@/lib/constants"
import { useState } from "react"

export function Navbar() {
  const { address, isConnected } = useAccount()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
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
            <Image 
              src="/swarmpoll-logo.png" 
              alt="SwarmPoll Logo" 
              width={32} 
              height={32} 
              className="w-16 h-16"
            />
            SwarmPoll
          </Link>
          
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10 hover:text-primary transition-all">
                <Users className="w-4 h-4" />
                Polls
              </Button>
            </Link>
            <Link href="/suggest">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10 hover:text-primary transition-all">
                <MessageSquare className="w-4 h-4" />
                Suggest
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
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4 space-y-2">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Users className="w-4 h-4" />
                Polls
              </Button>
            </Link>
            <Link href="/suggest" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <MessageSquare className="w-4 h-4" />
                Suggest
              </Button>
            </Link>
            {isOwner && (
              <Link href="/create-poll" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Crown className="w-4 h-4" />
                  Create Poll
                </Button>
              </Link>
            )}
            <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <User className="w-4 h-4" />
                Profile
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
