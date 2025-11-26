# ChainBet - Decentralized Sportsbook on Linera

A production-grade decentralized sports betting platform powered by Linera blockchain, featuring real-time event updates, transparent on-chain settlements, and seamless WalletConnect integration.

## Supported Competitions

ChainBet supports betting on the following leagues and competitions:

- **Premier League** - English top-flight soccer
- **NBA** - National Basketball Association
- **UEFA Champions League (UCL)** - Europe's premier club competition
- **UEFA Europa League (UEL)** - Second-tier European competition
- **UEFA Europa Conference League (UECL)** - Third-tier European competition

## Features

### 🎯 Core Functionality
- **Live Sports Events**: Browse and bet on upcoming and live sports events
- **Place Bets**: Interactive bet placement with real-time odds and potential payout calculations
- **My Bets Dashboard**: Track all your active and settled bets with comprehensive statistics
- **Admin Panel**: Event resolution interface for contract owners (Oracle functionality)
- **Wallet Integration**: Connect with WalletConnect for secure wallet management

### 🎨 Design Features
- Dark sportsbook aesthetic with teal-to-green gradients
- Responsive design optimized for mobile and desktop
- Smooth animations with Framer Motion
- Real-time status indicators for live events
- Comprehensive bet tracking with win/loss statistics

### 🔗 Blockchain Integration
- Apollo Client for GraphQL communication with Linera
- WalletConnect v2 for secure wallet connections
- Configurable namespace for Linera or EVM chains
- Persistent wallet sessions

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: shadcn/ui + Radix UI
- **Blockchain**: Apollo Client for Linera GraphQL
- **Wallet**: WalletConnect v2 (sign-client + modal)
- **Animations**: Framer Motion
- **State Management**: React Context + TanStack Query
- **Routing**: React Router v6

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Linera blockchain node running locally (or remote endpoint)
- WalletConnect Project ID (for wallet integration)

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd chainbet
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` and set your configuration:
```
VITE_GRAPHQL_ENDPOINT=http://127.0.0.1:8080/graphql
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id_here
VITE_WC_NAMESPACE=linera
```

4. Start development server
```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_GRAPHQL_ENDPOINT` | Linera GraphQL endpoint URL | `http://127.0.0.1:8080/graphql` |
| `VITE_WALLET_CONNECT_PROJECT_ID` | WalletConnect Cloud project ID | Required for wallet |
| `VITE_WC_NAMESPACE` | WalletConnect namespace (`linera` or `eip155`) | `linera` |

### Obtaining a WalletConnect Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign up or sign in to your account
3. Create a new project
4. Copy the Project ID and add it to your `.env` file

## Wallet Connection

The app uses WalletConnect v2 for secure wallet connections. Configuration options:

### Linera-Native Wallets
Set `VITE_WC_NAMESPACE=linera` (default) to use Linera-compatible namespace. The app will request:
- Methods: `linera_sign`, `linera_signTransaction`
- Events: `accountsChanged`, `chainChanged`

### EVM Fallback
Set `VITE_WC_NAMESPACE=eip155` for EVM-compatible wallets. The app will request:
- Methods: `eth_sendTransaction`, `personal_sign`
- Events: `accountsChanged`, `chainChanged`

### Demo Mode
If no `VITE_WALLET_CONNECT_PROJECT_ID` is set, the app will use a mock wallet connection for development and demonstration purposes.

## Running Against a Linera Node

1. Start your Linera node with GraphQL enabled
2. Set `VITE_GRAPHQL_ENDPOINT` to your node's GraphQL endpoint
3. Ensure the node exposes the required queries and mutations

### Required GraphQL Schema

The backend should expose the following:

```graphql
type Query {
  events: [Event!]!
  bets(accountId: String!): [Bet!]!
}

type Mutation {
  placeBet(eventId: String!, outcome: String!, amount: Float!): PlaceBetResult!
  resolveEvent(eventId: String!, result: String!): ResolveEventResult!
}

type Event {
  id: String!
  sport: String!
  league: String
  competition: String
  homeTeam: String!
  awayTeam: String!
  startTime: String!
  status: String!
  homeOdds: Float!
  awayOdds: Float!
  drawOdds: Float
  result: String
}

type Bet {
  id: String!
  eventId: String!
  outcome: String!
  odds: Float!
  stake: Float!
  status: String!
  payout: Float
  placedAt: String!
  event: Event!
}
```

**Note**: If the backend uses `competition` instead of `league`, the app will automatically adapt. Events are filtered client-side to only show the supported competitions.

## GraphQL Integration

### Queries

```graphql
# Fetch all events
query GetEvents {
  events {
    id
    sport
    league
    competition
    homeTeam
    awayTeam
    startTime
    status
    homeOdds
    awayOdds
    drawOdds
    result
  }
}

# Fetch user's bets
query GetBets($accountId: String!) {
  bets(accountId: $accountId) {
    id
    eventId
    outcome
    odds
    stake
    status
    payout
    placedAt
    event {
      id
      sport
      league
      homeTeam
      awayTeam
      startTime
      status
      homeOdds
      awayOdds
      drawOdds
      result
    }
  }
}
```

### Mutations

```graphql
# Place a bet
mutation PlaceBet($eventId: String!, $outcome: String!, $amount: Float!) {
  placeBet(eventId: $eventId, outcome: $outcome, amount: $amount) {
    success
    betId
    message
  }
}

# Resolve event (admin only)
mutation ResolveEvent($eventId: String!, $result: String!) {
  resolveEvent(eventId: $eventId, result: $result) {
    success
    event {
      id
      status
      result
    }
  }
}
```

## Project Structure

```
src/
├── assets/              # Static assets (logo, images)
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── Header.tsx      # Main navigation header with wallet
│   ├── EventCard.tsx   # Sports event display with league badge
│   ├── BetCard.tsx     # Bet history card
│   └── PlaceBetModal.tsx # Bet placement modal with validation
├── contexts/           # React contexts
│   └── WalletContext.tsx # WalletConnect integration
├── lib/                # Utilities
│   ├── apollo-client.ts # Apollo GraphQL client
│   ├── queries.ts      # GraphQL queries, mutations, and league filtering
│   └── utils.ts        # Helper functions
├── pages/              # Route pages
│   ├── Index.tsx       # Home/Events page with league filters
│   ├── MyBets.tsx      # User bets dashboard
│   ├── Admin.tsx       # Admin panel
│   └── NotFound.tsx    # 404 page
├── types/              # TypeScript types
│   └── index.ts        # Shared type definitions
└── App.tsx             # App entry point with providers
```

## Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
```bash
VITE_GRAPHQL_ENDPOINT=https://your-linera-node.com/graphql
VITE_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_id
VITE_WC_NAMESPACE=linera
```

## Security Considerations

- All bet placements require wallet connection
- Betting controls are disabled until wallet is connected
- Stake validation ensures amount > 0 and within balance
- Admin functions should verify contract ownership on-chain
- Implement proper input validation before GraphQL mutations
- Use HTTPS for production deployments
- Implement rate limiting for bet placements

## Demo & Testing

The app includes mock data for demonstration when:
- GraphQL endpoint is unavailable
- No WalletConnect project ID is configured

Mock data includes:
- 6 sample sports events across Premier League, NBA, Champions League, Europa League, and Europa Conference League
- 3 sample bets (active, won, lost) for the My Bets page
- Mock wallet connection for development

To test with real data, connect to a live Linera service and configure WalletConnect.

## License

MIT

## Powered by Linera

This application showcases Linera's capabilities for real-time, low-latency on-chain applications with transparent settlement and microchain architecture.
