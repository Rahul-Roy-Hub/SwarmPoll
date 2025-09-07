# SwarmPoll - Social Prediction Game

A revolutionary social prediction game where players bet on what they think the crowd will choose, not what they believe is correct.

## 🎯 The Concept

SwarmPoll is not a typical prediction market. Instead of betting on real-world outcomes, players bet on what they think the most popular answer will be. It's a game of social coordination and predicting crowd psychology.

### How It Works

1. **Question Posed**: "Which AI will be more influential in 2026: GPT-5 or Gemini 2?"
2. **Players Stake**: Users stake USDC on the option they believe will get the most votes
3. **Consensus Winner**: The option with the largest amount of staked USDC wins
4. **Rewards**: Everyone who staked on the winning option splits the entire pool of losing stakes

## 🏗️ Architecture

### Smart Contracts (Foundry)
- **SwarmPoll.sol**: Main game contract with staking, winning declaration, and reward claiming
- **SwarmToken.sol (SWARM)**: ERC20 reward token minted to users when they stake USDC
- **MockUSDC.sol**: Test token for development and testing

### Frontend (Next.js + Wagmi + RainbowKit)
- **Modern UI**: Beautiful, responsive interface with shadcn/ui components
- **Wallet Integration**: Seamless wallet connection with RainbowKit
- **Real-time Updates**: Live stake tracking and poll status
- **Admin Panel**: Poll creation interface for contract owners

### Key Features
- 🎨 **Beautiful UI**: Modern, gradient-based design with smooth animations
- 🔗 **Wallet Integration**: Connect with MetaMask, WalletConnect, and more
- 📊 **Real-time Stakes**: See live updates of option stakes and percentages
- 🏆 **Reward System**: Automatic reward calculation and claiming
- ⚡ **Fast Transactions**: Built on Arbitrum for low fees and high speed

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Yarn or pnpm package manager
- Foundry (for smart contract development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SwarmPoll
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   # with yarn
   yarn install
   # or with pnpm
   pnpm install
   ```

3. **Set up environment variables**
   Create `frontend/.env.local` and add:
   ```env
   # WalletConnect (RainbowKit)
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id

   # Contract addresses (e.g., Arbitrum Sepolia)
   NEXT_PUBLIC_SWARM_POLL_ADDRESS=0x...
   NEXT_PUBLIC_MOCK_USDC_ADDRESS=0x...
   NEXT_PUBLIC_SWARM_TOKEN_ADDRESS=0x...

   # Optional UI admin (may match contract owner)
   NEXT_PUBLIC_ADMIN_ADDRESS=0x...

   # Optional subgraph URL (leave empty to use on-chain fallbacks)
   NEXT_PUBLIC_SUBGRAPH_URL=https://api.studio.thegraph.com/query/your-subgraph

   # Optional: Arbiscan
   ARBISCAN_API_KEY=your_arbiscan_key
   ```

4. **Deploy smart contracts**
   ```bash
   cd contracts
   forge install
   forge build
   forge script script/Deploy.s.sol --rpc-url <your-rpc-url> --broadcast
   ```

5. **Update contract addresses**
   Addresses are loaded from env via `frontend/contracts/addresses/index.ts`. Ensure `.env.local` has correct values.

6. **Start the development server**
   ```bash
   cd frontend
   # with yarn
   yarn dev
   # or with pnpm
   pnpm dev
   ```

## 🎮 How to Play

1. **Connect Wallet**: Use RainbowKit to connect your wallet
2. **Browse Polls**: View active polls on the homepage
3. **Stake USDC**: Choose an option and stake your USDC
4. **Wait for Results**: Polls end after the specified duration
5. **Claim Rewards**: If you picked the winning option, claim your rewards

## 🛠️ Development

### Project Structure
```
SwarmPoll/
├── frontend/               # Next.js frontend
│   ├── app/                # App Router pages
│   │   ├── create-poll/
│   │   │   └── page.tsx
│   │   ├── poll/
│   │   │   └── [id]/page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/         # UI and feature components
│   ├── lib/                # Utilities and config (wagmi, subgraph, gas config)
│   └── public/             # Static assets
├── contracts/              # Foundry smart contracts
│   ├── src/               # Contract source
│   ├── test/              # Contract tests
│   └── script/            # Deployment scripts
└── docs/                  # Documentation
```

### Available Scripts

- `yarn dev` / `pnpm dev`: Start development server
- `yarn build` / `pnpm build`: Build for production
- `yarn lint` / `pnpm lint`: Run ESLint
- `forge test`: Run smart contract tests
- `forge script script/Deploy.s.sol`: Deploy contracts

## 🧪 Testing

### Smart Contract Tests
```bash
cd contracts
forge test
```

### Frontend Tests
Currently not configured. You can add Jest/RTL tests under `frontend/`.

## 🌐 Deployment

### Smart Contracts
1. Deploy to Arbitrum Sepolia (testnet)
2. Deploy to Arbitrum One (mainnet)
3. Update `.env.local` with deployed addresses

### Frontend
1. Build the application: `yarn build`
2. Deploy to Vercel, Netlify, or your preferred platform


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] Subgraph integration for better data indexing
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Social features (comments, sharing)
- [ ] Multi-chain support
- [ ] Governance token integration

## 🧩 Notes on Demo Data

- When the subgraph is not configured, the app uses on-chain reads for poll lists and safe placeholders elsewhere.
- Profile and some UI sections (Platform Statistics, profile stats, Your Stakes) display deterministic mock values to improve the demo while indexing is unavailable.
- SWARM balance: if the on-chain balance is zero/unavailable, a deterministic mock value (seeded by address) is shown.

Remove these placeholders once the subgraph and full on-chain paths are finalized.

## 🆘 Support

If you have any questions or need help, please open an issue on GitHub or reach out to the development team.

---

**SwarmPoll** - Where predicting the crowd is the game! 🎲

