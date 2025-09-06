# SwarmPoll Custom Hooks Guide

This guide explains how to use the custom React hooks in the SwarmPoll application. These hooks provide a clean, reusable interface for interacting with smart contracts and managing application state.

## 📚 Table of Contents

- [Overview](#overview)
- [Installation & Setup](#installation--setup)
- [Available Hooks](#available-hooks)
  - [useSwarmPoll](#useswarmpoll)
  - [usePoll](#usepoll)
  - [useUSDC](#useusdc)
  - [useDiscussion](#usediscussion)
  - [useToast](#usetoast)
  - [useMobile](#usemobile)
- [Complete Examples](#complete-examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The SwarmPoll hooks are designed to:
- **Simplify contract interactions** - No need to manually handle wagmi hooks
- **Provide consistent error handling** - Built-in toast notifications
- **Enable type safety** - Full TypeScript support
- **Improve code reusability** - Use the same logic across components

## 🚀 Installation & Setup

The hooks are already set up in your project. Simply import them:

```typescript
import { useSwarmPoll, usePoll, useUSDC } from "@/hooks";
```

## 🔧 Available Hooks

### useSwarmPoll

Main hook for SwarmPoll contract interactions.

#### **Features:**
- Create new polls
- Declare poll winners
- Check contract ownership
- Get poll count

#### **Basic Usage:**

```typescript
import { useSwarmPoll } from "@/hooks";

function CreatePollComponent() {
  const { 
    isConnected, 
    address, 
    isOwner, 
    createPoll, 
    declareWinner,
    pollCount 
  } = useSwarmPoll();

  const handleCreatePoll = async () => {
    const question = "What will be the price of ETH next week?";
    const options = ["Above $3000", "Below $3000", "Around $3000"];
    const endTime = BigInt(Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60); // 7 days

    await createPoll(question, options, endTime);
  };

  const handleDeclareWinner = async (pollId: string, winningOptionId: string) => {
    await declareWinner(BigInt(pollId), BigInt(winningOptionId));
  };

  return (
    <div>
      <p>Connected: {isConnected ? "Yes" : "No"}</p>
      <p>Address: {address}</p>
      <p>Is Owner: {isOwner ? "Yes" : "No"}</p>
      <p>Total Polls: {pollCount?.toString() || "0"}</p>
      
      {isOwner && (
        <button onClick={handleCreatePoll}>
          Create New Poll
        </button>
      )}
    </div>
  );
}
```

#### **API Reference:**

| Property | Type | Description |
|----------|------|-------------|
| `isConnected` | `boolean` | Whether wallet is connected |
| `address` | `string \| undefined` | Connected wallet address |
| `isOwner` | `boolean` | Whether connected user is contract owner |
| `ownerAddress` | `string \| undefined` | Contract owner address |
| `pollCount` | `bigint \| undefined` | Total number of polls |
| `createPoll` | `function` | Create a new poll |
| `declareWinner` | `function` | Declare poll winner |

---

### usePoll

Hook for fetching and managing individual poll data.

#### **Features:**
- Get poll details
- Fetch poll stakes by option
- Get user stakes for a poll
- Check user claim status

#### **Basic Usage:**

```typescript
import { usePoll } from "@/hooks";

function PollDetailsComponent({ pollId }: { pollId: string }) {
  const { poll, isLoading } = usePoll(BigInt(pollId));
  
  // Get stakes for each option (assuming 3 options)
  const optionStakes = usePollStakes(BigInt(pollId), 3);
  
  // Get user stakes (requires user address)
  const userStakes = useUserStakes(BigInt(pollId), "0x...", 3);
  
  // Check if user has claimed rewards
  const hasClaimed = useUserClaimStatus(BigInt(pollId), "0x...");

  if (isLoading) {
    return <div>Loading poll...</div>;
  }

  if (!poll) {
    return <div>Poll not found</div>;
  }

  return (
    <div>
      <h2>{poll.question}</h2>
      <p>End Time: {new Date(Number(poll.endTime) * 1000).toLocaleString()}</p>
      <p>Total Staked: ${Number(poll.totalStaked) / 1e6}</p>
      <p>Active: {poll.active ? "Yes" : "No"}</p>
      
      <div>
        <h3>Options:</h3>
        {poll.options.map((option, index) => (
          <div key={index}>
            <p>{option}</p>
            <p>Staked: ${Number(optionStakes[index]) / 1e6}</p>
            <p>Your Stake: ${Number(userStakes[index]) / 1e6}</p>
          </div>
        ))}
      </div>
      
      {hasClaimed && <p>✅ You have claimed rewards for this poll</p>}
    </div>
  );
}
```

#### **API Reference:**

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `usePoll` | `pollId: bigint` | `{ poll, isLoading }` | Get poll details |
| `usePollStakes` | `pollId: bigint, optionCount: number` | `bigint[]` | Get stakes for each option |
| `useUserStakes` | `pollId: bigint, userAddress: string, optionCount: number` | `bigint[]` | Get user stakes for each option |
| `useUserClaimStatus` | `pollId: bigint, userAddress: string` | `boolean \| undefined` | Check if user claimed rewards |

---

### useUSDC

Hook for USDC token operations.

#### **Features:**
- Check USDC balance
- Check allowance for SwarmPoll contract
- Approve USDC spending

#### **Basic Usage:**

```typescript
import { useUSDC } from "@/hooks";

function USDCManager() {
  const { 
    balance, 
    allowance, 
    approve, 
    isConnected, 
    address 
  } = useUSDC();

  const handleApprove = async () => {
    const amount = BigInt(1000 * 1e6); // 1000 USDC (6 decimals)
    await approve(amount);
  };

  const formatUSDC = (amount: bigint | undefined) => {
    if (!amount) return "0.00";
    return (Number(amount) / 1e6).toFixed(2);
  };

  return (
    <div>
      <h3>USDC Management</h3>
      <p>Balance: ${formatUSDC(balance)} USDC</p>
      <p>Allowance: ${formatUSDC(allowance)} USDC</p>
      
      {isConnected && (
        <button onClick={handleApprove}>
          Approve 1000 USDC
        </button>
      )}
    </div>
  );
}
```

#### **API Reference:**

| Property | Type | Description |
|----------|------|-------------|
| `balance` | `bigint \| undefined` | User's USDC balance |
| `allowance` | `bigint \| undefined` | USDC allowance for SwarmPoll contract |
| `approve` | `function` | Approve USDC spending |
| `isConnected` | `boolean` | Whether wallet is connected |
| `address` | `string \| undefined` | Connected wallet address |

---

### useDiscussion

Hook for discussion board functionality.

#### **Features:**
- Submit discussion topics
- Check if user is contract owner
- Manage discussion state

#### **Basic Usage:**

```typescript
import { useDiscussion } from "@/hooks";

function DiscussionBoard() {
  const {
    isOwner,
    isConnected,
    handleDiscussionSubmit,
    isSubmitting,
    discussionTopic,
    setDiscussionTopic
  } = useDiscussion();

  return (
    <div>
      <h3>Discussion Board</h3>
      
      {isOwner && (
        <form onSubmit={handleDiscussionSubmit}>
          <textarea
            value={discussionTopic}
            onChange={(e) => setDiscussionTopic(e.target.value)}
            placeholder="Suggest a new poll topic..."
            rows={4}
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Topic"}
          </button>
        </form>
      )}
      
      {!isOwner && (
        <p>Only contract owners can submit discussion topics.</p>
      )}
    </div>
  );
}
```

#### **API Reference:**

| Property | Type | Description |
|----------|------|-------------|
| `isOwner` | `boolean` | Whether user is contract owner |
| `isConnected` | `boolean` | Whether wallet is connected |
| `handleDiscussionSubmit` | `function` | Submit discussion topic |
| `isSubmitting` | `boolean` | Whether submission is in progress |
| `discussionTopic` | `string` | Current discussion topic text |
| `setDiscussionTopic` | `function` | Set discussion topic text |

---

### useToast

Hook for displaying toast notifications.

#### **Basic Usage:**

```typescript
import { useToast } from "@/hooks";

function MyComponent() {
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: "Success!",
      description: "Your action was completed successfully.",
    });
  };

  const handleError = () => {
    toast({
      title: "Error",
      description: "Something went wrong. Please try again.",
      variant: "destructive",
    });
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
    </div>
  );
}
```

---

### useMobile

Hook for detecting mobile devices.

#### **Basic Usage:**

```typescript
import { useMobile } from "@/hooks";

function ResponsiveComponent() {
  const isMobile = useMobile();

  return (
    <div>
      {isMobile ? (
        <div>Mobile Layout</div>
      ) : (
        <div>Desktop Layout</div>
      )}
    </div>
  );
}
```

## 🎯 Complete Examples

### Example 1: Complete Poll Creation Flow

```typescript
import { useSwarmPoll, useUSDC, useToast } from "@/hooks";
import { useState } from "react";

function CreatePollPage() {
  const { isOwner, createPoll } = useSwarmPoll();
  const { approve, allowance, balance } = useUSDC();
  const { toast } = useToast();
  
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [endTime, setEndTime] = useState("");

  const handleCreatePoll = async () => {
    if (!question || options.length < 2) {
      toast({
        title: "Invalid Input",
        description: "Please provide a question and at least 2 options.",
        variant: "destructive",
      });
      return;
    }

    const endTimestamp = BigInt(Math.floor(new Date(endTime).getTime() / 1000));
    
    try {
      await createPoll(question, options, endTimestamp);
      setQuestion("");
      setOptions([]);
      setEndTime("");
    } catch (error) {
      console.error("Failed to create poll:", error);
    }
  };

  if (!isOwner) {
    return <div>Only contract owners can create polls.</div>;
  }

  return (
    <div className="space-y-4">
      <h2>Create New Poll</h2>
      
      <div>
        <label>Question:</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What will happen next?"
        />
      </div>
      
      <div>
        <label>Options:</label>
        {options.map((option, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={option}
              onChange={(e) => {
                const newOptions = [...options];
                newOptions[index] = e.target.value;
                setOptions(newOptions);
              }}
            />
            <button onClick={() => setOptions(options.filter((_, i) => i !== index))}>
              Remove
            </button>
          </div>
        ))}
        <button onClick={() => setOptions([...options, ""])}>
          Add Option
        </button>
      </div>
      
      <div>
        <label>End Time:</label>
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>
      
      <button onClick={handleCreatePoll}>
        Create Poll
      </button>
    </div>
  );
}
```

### Example 2: Poll Voting Interface

```typescript
import { usePoll, useUSDC, useSwarmPoll } from "@/hooks";
import { useState } from "react";

function PollVotingInterface({ pollId }: { pollId: string }) {
  const { poll, isLoading } = usePoll(BigInt(pollId));
  const { balance, approve, allowance } = useUSDC();
  const { address } = useSwarmPoll();
  
  const [stakeAmount, setStakeAmount] = useState("");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleStake = async () => {
    if (!selectedOption || !stakeAmount) return;
    
    const amount = BigInt(parseFloat(stakeAmount) * 1e6);
    
    // Check if approval is needed
    if (!allowance || allowance < amount) {
      await approve(amount);
    }
    
    // Stake on the selected option
    // This would require additional contract interaction
    console.log(`Staking ${stakeAmount} USDC on option ${selectedOption}`);
  };

  if (isLoading) return <div>Loading...</div>;
  if (!poll) return <div>Poll not found</div>;

  return (
    <div className="space-y-4">
      <h2>{poll.question}</h2>
      
      <div>
        <label>Select Option:</label>
        {poll.options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="radio"
              id={`option-${index}`}
              name="option"
              checked={selectedOption === index}
              onChange={() => setSelectedOption(index)}
            />
            <label htmlFor={`option-${index}`}>{option}</label>
          </div>
        ))}
      </div>
      
      <div>
        <label>Stake Amount (USDC):</label>
        <input
          type="number"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
          placeholder="0.00"
          step="0.01"
        />
        <p>Balance: ${Number(balance || 0n) / 1e6} USDC</p>
      </div>
      
      <button 
        onClick={handleStake}
        disabled={!selectedOption || !stakeAmount || !address}
      >
        Stake USDC
      </button>
    </div>
  );
}
```

## 🎯 Best Practices

### 1. **Error Handling**
Always wrap hook calls in try-catch blocks for contract interactions:

```typescript
const handleContractAction = async () => {
  try {
    await createPoll(question, options, endTime);
  } catch (error) {
    console.error("Contract action failed:", error);
    // Handle error appropriately
  }
};
```

### 2. **Loading States**
Use loading states to provide better UX:

```typescript
const { poll, isLoading } = usePoll(pollId);

if (isLoading) {
  return <div>Loading poll data...</div>;
}
```

### 3. **Type Safety**
Always use proper TypeScript types:

```typescript
const pollId: bigint = BigInt("123");
const amount: bigint = BigInt(1000 * 1e6); // 1000 USDC
```

### 4. **Conditional Rendering**
Check connection status before showing contract interactions:

```typescript
if (!isConnected) {
  return <div>Please connect your wallet</div>;
}
```

### 5. **BigInt Handling**
Remember that contract values are in BigInt format:

```typescript
// Convert BigInt to display format
const displayAmount = Number(balance) / 1e6;

// Convert user input to BigInt
const contractAmount = BigInt(parseFloat(userInput) * 1e6);
```

## 🔧 Troubleshooting

### Common Issues:

1. **"Cannot read properties of undefined"**
   - Check if wallet is connected before using hooks
   - Ensure contract addresses are properly configured

2. **"Insufficient allowance"**
   - Use `useUSDC` hook to approve tokens before staking
   - Check if approval amount is sufficient

3. **"User rejected transaction"**
   - Handle user cancellation gracefully
   - Provide clear error messages

4. **"Contract not found"**
   - Verify contract addresses in environment variables
   - Check if contracts are deployed on the correct network

### Debug Tips:

```typescript
// Enable debug logging
console.log("Hook state:", { isConnected, address, isOwner });

// Check contract data
console.log("Poll data:", poll);
console.log("USDC balance:", balance);
```

## 📞 Support

If you encounter issues with the hooks:

1. Check the browser console for error messages
2. Verify your wallet connection
3. Ensure contract addresses are correct
4. Check network connectivity

For more help, refer to the [SwarmPoll Architecture Guide](./ARCHITECTURE.md).
