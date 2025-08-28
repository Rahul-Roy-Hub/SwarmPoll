"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ThumbsUp, Clock, User } from "lucide-react"
import { useAccount } from "wagmi"

interface Discussion {
  id: number
  topic: string
  author: string
  timestamp: string
  upvotes: number
}

export function DiscussionBoard() {
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const { address } = useAccount()

  useEffect(() => {
    // Load discussions from localStorage
    const stored = localStorage.getItem('sp_discussions')
    if (stored) {
      try {
        setDiscussions(JSON.parse(stored))
      } catch {
        setDiscussions([])
      }
    }
  }, [])

  const handleUpvote = (discussionId: number) => {
    const updatedDiscussions = discussions.map(discussion => {
      if (discussion.id === discussionId) {
        return { ...discussion, upvotes: discussion.upvotes + 1 }
      }
      return discussion
    })
    
    setDiscussions(updatedDiscussions)
    localStorage.setItem('sp_discussions', JSON.stringify(updatedDiscussions))
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (discussions.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Suggestions Yet</h3>
          <p className="text-muted-foreground">
            Be the first to suggest a new poll topic! Your idea could become the next big prediction market.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {discussions.map((discussion) => (
        <Card key={discussion.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-lg font-medium text-foreground leading-relaxed">
                  {discussion.topic}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{formatAddress(discussion.author)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatTimestamp(discussion.timestamp)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Badge variant="secondary" className="px-3 py-1">
                  {discussion.upvotes} upvotes
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpvote(discussion.id)}
                  className="gap-2 hover:bg-primary/10 hover:text-primary"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Upvote
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
