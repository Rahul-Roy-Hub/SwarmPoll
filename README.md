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
- Yarn package manager
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
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your configuration:
   ```env
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
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
   Update the contract addresses in `frontend/lib/constants.ts` with your deployed addresses.

6. **Start the development server**
   ```bash
   cd frontend
   yarn dev
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
│   ├── lib/                # Utilities and config (wagmi, subgraph, constants)
│   └── public/             # Static assets
├── contracts/              # Foundry smart contracts
│   ├── src/               # Contract source
│   ├── test/              # Contract tests
│   └── script/            # Deployment scripts
└── docs/                  # Documentation
```

### Available Scripts

- `yarn dev`: Start development server
- `yarn build`: Build for production
- `yarn lint`: Run ESLint
- `forge test`: Run smart contract tests
- `forge script script/Deploy.s.sol`: Deploy contracts

## 🧪 Testing

### Smart Contract Tests
```bash
cd contracts
forge test
```

### Frontend Tests
```bash
cd apps
yarn test
```

## 🌐 Deployment

### Smart Contracts
1. Deploy to Arbitrum Sepolia (testnet)
2. Deploy to Arbitrum One (mainnet)
3. Update contract addresses in constants

### Frontend
1. Build the application: `yarn build`
2. Deploy to Vercel, Netlify, or your preferred platform

## 📚 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Demo Guide](docs/DEMO.md)

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

## 🆘 Support

If you have any questions or need help, please open an issue on GitHub or reach out to the development team.

---

**SwarmPoll** - Where predicting the crowd is the game! 🎲

