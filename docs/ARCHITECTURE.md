# SwarmPoll Architecture

## Overview

SwarmPoll is a decentralized social prediction game built on Arbitrum. The system consists of smart contracts for game logic and a modern web frontend for user interaction.

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Smart         │    │   Blockchain    │
│   (Next.js)     │◄──►│   Contracts     │◄──►│   (Arbitrum)    │
│                 │    │   (Foundry)     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   RainbowKit    │    │   SwarmPoll     │    │   USDC Token    │
│   (Wallet)      │    │   Contract      │    │   Contract      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Smart Contract Architecture

### Core Contracts

#### SwarmPoll.sol
The main game contract that handles:
- Poll creation and management
- USDC staking on options
- Winner declaration
- Reward calculation and distribution

**Key Functions:**
- `createPoll()`: Admin function to create new polls
- `stake()`: User function to stake USDC on an option
- `declareWinner()`: Admin function to end polls and declare winners
- `claimReward()`: User function to claim winnings

#### MockUSDC.sol
Test token for development with:
- Standard ERC20 functionality
- Faucet function for testnet usage
- 6 decimal precision (like real USDC)

### Data Structures

```solidity
struct Poll {
    string question;
    string[] options;
    uint256 endTime;
    uint256 totalStaked;
    bool ended;
    uint256 winningOption;
    mapping(uint256 => uint256) optionStakes;
    mapping(address => mapping(uint256 => uint256)) userStakes;
    mapping(address => bool) hasClaimed;
}
```

## Frontend Architecture

### Technology Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Blockchain**: Wagmi + Viem for Ethereum interactions
- **Wallet**: RainbowKit for wallet connection
- **State Management**: React Query for server state
- **UI Components**: Custom components with Radix UI primitives

### Component Structure

```
frontend/components/
├── ui/                      # Base UI components (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── progress.tsx
├── poll-card.tsx            # Poll display
├── polls-list.tsx           # Listing view
├── create-poll-form.tsx     # Admin poll creation
├── claimable-reward.tsx     # Reward UI
└── navbar.tsx               # App navigation with ConnectButton
```

### Page Structure

```
frontend/app/
├── page.tsx                  # Homepage with poll listing
├── poll/
│   └── [id]/page.tsx         # Individual poll page
├── create-poll/page.tsx      # Admin poll creation
├── profile/page.tsx          # User profile
├── layout.tsx                # Root layout
└── providers.tsx             # App providers (Wagmi, RainbowKit, Apollo)
```

## Data Flow

### Poll Creation Flow
1. Admin connects wallet
2. Fills poll creation form
3. Submits transaction to `createPoll()`
4. Contract emits `PollCreated` event
5. Frontend updates poll list

### Staking Flow
1. User connects wallet
2. Selects poll and option
3. Approves USDC spending
4. Submits stake transaction
5. Contract updates stakes
6. Frontend reflects new stakes

### Reward Claiming Flow
1. Poll ends and winner declared
2. User checks claimable rewards
3. Submits claim transaction
4. Contract calculates and sends rewards
5. Frontend updates user balance

## Security Considerations

### Smart Contract Security
- **Reentrancy Protection**: Using OpenZeppelin's ReentrancyGuard
- **Access Control**: Owner-only functions for admin operations
- **Input Validation**: Comprehensive parameter checks
- **Safe Math**: Using Solidity 0.8+ built-in overflow protection

### Frontend Security
- **Wallet Connection**: Secure wallet integration via RainbowKit (WalletConnect Project ID)
- **Transaction Validation**: Client-side validation before submission
- **Error Handling**: Comprehensive error handling and user feedback

## Performance Optimizations

### Smart Contracts
- **Gas Optimization**: Efficient data structures and function design
- **Batch Operations**: Support for multiple operations in single transaction
- **Event Indexing**: Events for efficient off-chain data tracking

### Frontend
- **Caching**: React Query for efficient data caching
- **Lazy Loading**: Component and route lazy loading
- **Optimistic Updates**: Immediate UI updates with transaction confirmation
- **Real-time Updates**: Polling for stake updates

## Scalability Considerations

### Current Limitations
- Single poll processing
- Sequential stake processing
- Limited batch operations

### Future Improvements
- **Batch Staking**: Multiple stakes in single transaction
- **Poll Batching**: Multiple poll operations
- **Layer 2 Optimizations**: Leveraging Arbitrum's capabilities
- **Subgraph Integration**: Better data indexing and querying

## Monitoring and Analytics

### Smart Contract Events
- `PollCreated`: New poll creation
- `Staked`: User stake placement
- `WinnerDeclared`: Poll conclusion
- `RewardClaimed`: Reward distribution

### Frontend Analytics
- User interaction tracking
- Transaction success rates
- Performance metrics
- Error monitoring

## Deployment Strategy

### Environment Configuration
- **Development**: Local Hardhat/Anvil
- **Testing**: Arbitrum Sepolia testnet
- **Production**: Arbitrum One mainnet

### Contract Deployment
1. Deploy MockUSDC (testnet only)
2. Deploy SwarmPoll with USDC address
3. Verify contracts on Arbiscan
4. Update frontend configuration

### Frontend Deployment
1. Environment variables configured in `frontend/.env.local`
2. Build optimization
3. Deploy to Vercel/Netlify
4. Monitoring setup

## Future Enhancements

### Planned Features
- **Subgraph Integration**: Better data indexing
- **Mobile App**: Native mobile experience
- **Social Features**: Comments and sharing
- **Advanced Analytics**: Detailed insights and trends
- **Multi-chain Support**: Expansion to other L2s
- **Governance**: DAO integration for poll creation

### Technical Improvements
- **Gas Optimization**: Further contract optimizations
- **UI/UX Enhancements**: Advanced animations and interactions
- **Performance**: Additional caching and optimization
- **Security**: Enhanced security measures and audits

