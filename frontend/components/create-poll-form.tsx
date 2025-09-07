"use client"

import type React from "react"

import { useState } from "react"
import { useWriteContract } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, X, Calendar, HelpCircle, MessageSquare, Info, Users, Target, Crown } from "lucide-react"
import { SWARMPOLL_CONTRACT_ADDRESS, SWARMPOLL_ABI } from "@/contracts"
import { useToast } from "@/hooks/use-toast"

export function CreatePollForm() {
  const [question, setQuestion] = useState("")
  const [description, setDescription] = useState("")
  const [background, setBackground] = useState("")
  const [options, setOptions] = useState(["", ""])
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const { writeContract } = useWriteContract()
  const { toast } = useToast()

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""])
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!question.trim()) {
      toast({
        title: "Question required",
        description: "Please enter a poll question",
        variant: "destructive",
      })
      return
    }

    const validOptions = options.filter((opt) => opt.trim())
    if (validOptions.length < 2) {
      toast({
        title: "Insufficient options",
        description: "Please provide at least 2 options",
        variant: "destructive",
      })
      return
    }

    if (!endDate || !endTime) {
      toast({
        title: "End time required",
        description: "Please set when the poll should end",
        variant: "destructive",
      })
      return
    }

    const endDateTime = new Date(`${endDate}T${endTime}`)
    if (endDateTime <= new Date()) {
      toast({
        title: "Invalid end time",
        description: "End time must be in the future",
        variant: "destructive",
      })
      return
    }

    // Contract expects a duration (in seconds), not an absolute timestamp
    const nowUnix = Math.floor(Date.now() / 1000)
    const endTimeUnix = Math.floor(endDateTime.getTime() / 1000)
    const durationSeconds = endTimeUnix - nowUnix
    if (durationSeconds <= 0) {
      toast({
        title: "Invalid duration",
        description: "End time must be after the current time",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      await writeContract({
        address: SWARMPOLL_CONTRACT_ADDRESS,
        abi: SWARMPOLL_ABI,
        functionName: "createPoll",
        args: [question.trim(), validOptions, BigInt(durationSeconds)],
      })

      toast({
        title: "Poll creation submitted",
        description: "Your poll is being created on the blockchain",
      })

      // Reset form
      setQuestion("")
      setDescription("")
      setBackground("")
      setOptions(["", ""])
      setEndDate("")
      setEndTime("")
    } catch (error) {
      toast({
        title: "Poll creation failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 30) // Minimum 30 minutes from now
    return now.toISOString().slice(0, 16)
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-primary" />
          Create New Poll (Admin Only)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Create engaging polls that will capture the community's interest and drive participation.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Question Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              <Label className="text-lg font-semibold">Poll Question</Label>
            </div>
            <div className="space-y-2">
              <Textarea
                id="question"
                placeholder="What question do you want to ask the crowd? Make it engaging and clear."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                maxLength={500}
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">{question.length}/500 characters</p>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <Label className="text-lg font-semibold">Poll Description</Label>
            </div>
            <div className="space-y-2">
              <Textarea
                id="description"
                placeholder="Provide additional context or explanation for the poll question..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground">{description.length}/300 characters</p>
            </div>
          </div>

          {/* Background Context */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              <Label className="text-lg font-semibold">Background Context</Label>
            </div>
            <div className="space-y-2">
              <Textarea
                id="background"
                placeholder="Add any relevant background information, context, or why this poll matters..."
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">{background.length}/500 characters</p>
            </div>
          </div>

          {/* Options Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <Label className="text-lg font-semibold">Answer Options</Label>
              </div>
              <Badge variant="secondary" className="px-3 py-1">
                {options.filter((opt) => opt.trim()).length} options
              </Badge>
            </div>

            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Option ${index + 1} - Be specific and clear`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    maxLength={200}
                    className="text-base"
                  />
                  {options.length > 2 && (
                    <Button type="button" variant="outline" size="icon" onClick={() => removeOption(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 10 && (
              <Button type="button" variant="outline" onClick={addOption} className="w-full bg-transparent border-dashed">
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            )}
          </div>

          {/* End Time Section */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-lg font-semibold">
              <Calendar className="w-4 h-4 text-primary" />
              Poll End Time
            </Label>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm">
                  Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-sm">
                  Time
                </Label>
                <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>

            {endDate && endTime && (
              <p className="text-sm text-muted-foreground">
                Poll will end: {new Date(`${endDate}T${endTime}`).toLocaleString()}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isCreating} className="w-full py-6 text-lg font-semibold" size="lg">
            {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Crown className="w-5 h-5 mr-2" />
            Create Poll
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
