"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { useDiscussion } from "@/hooks/useDiscussion"
import { DiscussionBoard } from "@/components/discussion-board"
import Image from "next/image"

export default function SuggestPage() {
  const { isOwner, isConnected, handleDiscussionSubmit, isSubmitting, discussionTopic, setDiscussionTopic } = useDiscussion()

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <MessageSquare className="w-8 h-8 text-blue-600" />
            <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Suggest New Poll Topics</span>
          </h1>
          <p className="text-muted-foreground">Connect your wallet to suggest new poll topics</p>
        </div>

        <Card className="text-center py-12 bg-gradient-to-br from-blue-500/5 to-blue-600/5 border border-blue-500/20">
          <CardContent>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Image 
                src="/swarmpoll-logo.png" 
                alt="SwarmPoll Logo" 
                width={48} 
                height={48} 
                className="w-12 h-12"
              />
              <MessageSquare className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-blue-700 dark:text-blue-400">Connect to Suggest</h3>
            <p className="text-muted-foreground">
              Connect your wallet to start suggesting new poll topics and participate in discussions.
            </p>
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
          <MessageSquare className="w-8 h-8 text-blue-600" />
          <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Suggest New Poll Topics</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Have an idea for a new poll? Share it with the community and discuss potential topics!
        </p>
      </div>

      {/* Suggestion Form */}
      <Card className="max-w-2xl mx-auto bg-gradient-to-br from-blue-500/5 to-blue-600/5 border border-blue-500/20">
        <CardContent className="pt-6">
          <form onSubmit={handleDiscussionSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="discussionTopic" className="text-blue-700 dark:text-blue-400">Poll Topic Suggestion</Label>
              <Textarea
                id="discussionTopic"
                placeholder="What kind of poll would you like to see? Describe your idea..."
                value={discussionTopic}
                onChange={(e) => setDiscussionTopic(e.target.value)}
                rows={3}
                maxLength={300}
                className="border-blue-500/30 focus:border-blue-500"
              />
              <p className="text-xs text-blue-600 dark:text-blue-400">{discussionTopic.length}/300 characters</p>
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting || !discussionTopic.trim()} 
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Topic"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Discussion Board */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-center mb-6 text-blue-700 dark:text-blue-400">Recent Poll Suggestions</h2>
        <DiscussionBoard />
      </div>
    </div>
  )
}
