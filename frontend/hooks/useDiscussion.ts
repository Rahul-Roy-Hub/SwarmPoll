import { useState } from "react"
import { useAccount, useReadContract } from "wagmi"
import { SWARMPOLL_CONTRACT_ADDRESS, SWARMPOLL_ABI } from "@/contracts"
import { useToast } from "@/hooks/use-toast"

export function useDiscussion() {
  const { address, isConnected } = useAccount()
  const [discussionTopic, setDiscussionTopic] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Check if connected user is the contract owner
  const { data: ownerAddress } = useReadContract({
    address: SWARMPOLL_CONTRACT_ADDRESS,
    abi: SWARMPOLL_ABI,
    functionName: "owner",
  })

  const isOwner = address && ownerAddress && address.toLowerCase() === ownerAddress.toLowerCase()

  const handleDiscussionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!discussionTopic.trim()) return

    setIsSubmitting(true)
    try {
      // Store discussion topic in localStorage for now
      const discussions = JSON.parse(localStorage.getItem('sp_discussions') || '[]')
      const newDiscussion = {
        id: Date.now(),
        topic: discussionTopic.trim(),
        author: address,
        timestamp: new Date().toISOString(),
        upvotes: 0
      }
      discussions.unshift(newDiscussion)
      localStorage.setItem('sp_discussions', JSON.stringify(discussions))
      
      setDiscussionTopic("")
      toast({
        title: "Topic submitted!",
        description: "Your poll suggestion has been added to the discussion board.",
      })
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isOwner,
    isConnected,
    handleDiscussionSubmit,
    isSubmitting,
    discussionTopic,
    setDiscussionTopic
  }
}
