# USDC Staking Guide for SwarmPoll

This guide explains how to use the improved USDC staking functionality in SwarmPoll.

## 🎯 What's New

### **Enhanced Staking System**
- **Dedicated Staking Hook**: `useStaking` for complete staking workflow
- **Improved Modal Interface**: Better UX for staking operations
- **Automatic Approval Handling**: Seamless USDC approval process
- **Real-time Balance Updates**: Live balance and stake tracking

## 🚀 Quick Start

### **1. Using the Staking Hook**

```typescript
import { useStaking } from "@/hooks";

function MyStakingComponent({ pollId, optionId }) {
  const {
    isConnected,
    usdcBalance,
    userStake,
    optionStake,
    needsApproval,
    hasBalance,
    isApproving,
    isStaking,
    handleStake,
  } = useStaking(pollId, optionId);

  const handleSubmit = async (amount: string) => {
    await handleStake(amount);
  };

  return (
    <div>
      <p>Balance: {usdcBalance} USDC</p>
      <p>Your Stake: {userStake} USDC</p>
      <button onClick={() => handleSubmit("10.0")}>
        Stake 10 USDC
      </button>
    </div>
  );
}
```

### **2. Using the Staking Modal**

```typescript
import { StakingModal } from "@/components/staking-modal";

function PollComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>
        Stake USDC
      </button>
      
      <StakingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pollId="0"
        pollQuestion="Who will win the next election?"
        option={{
          id: "0",
          label: "Candidate A",
          totalStaked: "1000000000" // 1000 USDC in wei
        }}
        totalPollStaked="5000000000" // 5000 USDC in wei
      />
    </div>
  );
}
```

## 🔧 Complete Implementation

### **Step 1: Update Your Poll Component**

```typescript
// In your poll component
import { StakeOption } from "@/components/stake-option";

function PollCard({ poll }) {
  return (
    <div>
      <h3>{poll.question}</h3>
      {poll.options.map((option) => (
        <StakeOption
          key={option.id}
          pollId={poll.id}
          pollQuestion={poll.question} // Add this prop
          option={option}
          totalPollStaked={poll.totalStaked}
          userStake={option.userStake}
          isEnded={poll.isEnded}
          winningOption={poll.winningOption}
        />
      ))}
    </div>
  );
}
```

### **Step 2: Handle Staking in Your App**

```typescript
// Example: Complete staking flow
import { useStaking } from "@/hooks";
import { useState } from "react";

function StakingInterface({ pollId, optionId }) {
  const [amount, setAmount] = useState("");
  const {
    isConnected,
    usdcBalance,
    userStake,
    needsApproval,
    hasBalance,
    isApproving,
    isStaking,
    handleStake,
  } = useStaking(pollId, optionId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    
    const success = await handleStake(amount);
    if (success) {
      setAmount("");
      // Handle success (e.g., show success message)
    }
  };

  if (!isConnected) {
    return <div>Please connect your wallet</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Amount (USDC):</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          step="0.01"
          min="0"
        />
      </div>
      
      <div>
        <p>Balance: {usdcBalance} USDC</p>
        <p>Your Stake: {userStake} USDC</p>
      </div>

      {amount && needsApproval(amount) && (
        <p className="text-amber-600">Approval needed</p>
      )}

      {amount && !hasBalance(amount) && (
        <p className="text-red-600">Insufficient balance</p>
      )}

      <button
        type="submit"
        disabled={
          !amount ||
          parseFloat(amount) <= 0 ||
          !hasBalance(amount) ||
          isApproving ||
          isStaking
        }
      >
        {isApproving ? "Approving..." : isStaking ? "Staking..." : "Stake"}
      </button>
    </form>
  );
}
```

## 📊 Hook API Reference

### **useStaking(pollId, optionId)**

| Property | Type | Description |
|----------|------|-------------|
| `isConnected` | `boolean` | Whether wallet is connected |
| `usdcBalance` | `string` | User's USDC balance (formatted) |
| `userStake` | `string` | User's stake on this option (formatted) |
| `optionStake` | `string` | Total stake on this option (formatted) |
| `needsApproval` | `function` | Check if approval is needed for amount |
| `hasBalance` | `function` | Check if user has sufficient balance |
| `isApproving` | `boolean` | Whether approval is in progress |
| `isStaking` | `boolean` | Whether staking is in progress |
| `handleStake` | `function` | Complete staking workflow |

### **StakingModal Props**

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Whether modal is open |
| `onClose` | `function` | Close modal callback |
| `pollId` | `string` | Poll ID |
| `pollQuestion` | `string` | Poll question text |
| `option` | `object` | Option data (id, label, totalStaked) |
| `totalPollStaked` | `string` | Total staked on poll |

## 🎯 Key Features

### **1. Automatic Approval**
- Detects when USDC approval is needed
- Handles approval automatically before staking
- Shows approval progress to user

### **2. Balance Validation**
- Checks USDC balance before staking
- Shows clear error messages for insufficient funds
- Real-time balance updates

### **3. Error Handling**
- Comprehensive error handling for all operations
- User-friendly error messages
- Toast notifications for success/failure

### **4. Loading States**
- Shows loading indicators during approval and staking
- Prevents multiple simultaneous operations
- Clear visual feedback

## 🔍 Troubleshooting

### **Common Issues:**

1. **"Insufficient balance"**
   - Check your USDC balance
   - Ensure you have enough USDC for the stake amount
   - USDC has 6 decimal places (1 USDC = 1,000,000 units)

2. **"Approval needed"**
   - The hook will handle this automatically
   - Click the approve button when it appears
   - Wait for approval transaction to confirm

3. **"Transaction failed"**
   - Check your wallet connection
   - Ensure you have enough ETH for gas fees
   - Try increasing gas limit if needed

4. **"Contract not found"**
   - Verify contract addresses in environment variables
   - Check if you're on the correct network (Arbitrum Sepolia)

### **Debug Tips:**

```typescript
// Enable debug logging
console.log("Staking state:", {
  isConnected,
  usdcBalance,
  userStake,
  needsApproval: needsApproval("10.0"),
  hasBalance: hasBalance("10.0"),
});
```

## 🚀 Example Usage in Your App

### **Complete Poll Component:**

```typescript
import { useState } from "react";
import { StakeOption } from "@/components/stake-option";
import { usePoll } from "@/hooks";

function PollPage({ pollId }) {
  const { poll, isLoading } = usePoll(BigInt(pollId));

  if (isLoading) return <div>Loading...</div>;
  if (!poll) return <div>Poll not found</div>;

  return (
    <div className="space-y-6">
      <h1>{poll.question}</h1>
      
      <div className="grid gap-4">
        {poll.options.map((option, index) => (
          <StakeOption
            key={option.id}
            pollId={pollId}
            pollQuestion={poll.question}
            option={{
              id: index.toString(),
              label: option,
              totalStaked: "0" // This should come from your data
            }}
            totalPollStaked={poll.totalStaked}
            userStake="0" // This should come from your data
            isEnded={!poll.active}
            winningOption={poll.winningOptionId?.toString()}
          />
        ))}
      </div>
    </div>
  );
}
```

## 📝 Environment Variables

Make sure these are set in your `.env.local`:

```bash
NEXT_PUBLIC_SWARM_POLL_ADDRESS=0x...
NEXT_PUBLIC_MOCK_USDC_ADDRESS=0x...
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-project-id
```

## 🎉 Ready to Use!

Your USDC staking functionality is now ready! The new system provides:

- ✅ Seamless USDC staking
- ✅ Automatic approval handling
- ✅ Real-time balance updates
- ✅ Better error handling
- ✅ Improved user experience

Start staking on polls with confidence! 🚀
