# ChainBet - Decentralized Sportsbook on Linera

A production-grade decentralized sports betting platform powered by Linera blockchain, featuring real-time event updates, transparent on-chain settlements, and seamless wallet integration.

## Features

### 🎯 Core Functionality
- **Live Sports Events**: Browse and bet on upcoming and live sports events (Soccer, Basketball, MMA, etc.)
- **Place Bets**: Interactive bet placement with real-time odds and potential payout calculations
- **My Bets Dashboard**: Track all your active and settled bets with comprehensive statistics
- **Admin Panel**: Event resolution interface for contract owners (Oracle functionality)
- **Wallet Integration**: Connect with Linera wallet to manage your balance and place bets

### 🎨 Design Features
- Dark sportsbook aesthetic with teal-to-green gradients
- Responsive design optimized for mobile and desktop
- Smooth animations with Framer Motion
- Real-time status indicators for live events
- Comprehensive bet tracking with win/loss statistics

### 🔗 Blockchain Integration
- Apollo Client for GraphQL communication with Linera
- Ready-to-connect GraphQL endpoint configuration
- Mock data for demonstration (replace with live Linera queries)
- Wallet state management with React Context

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: shadcn/ui + Radix UI
- **Blockchain**: Apollo Client for Linera GraphQL
- **Animations**: Framer Motion
- **State Management**: React Context + TanStack Query
- **Routing**: React Router v6

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Linera blockchain node running locally (or remote endpoint)

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

Edit `.env` and set your Linera GraphQL endpoint:
```
VITE_GRAPHQL_ENDPOINT=http://127.0.0.1:8080/graphql
```

4. Start development server
```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## GraphQL Integration

### Required Queries

```graphql
# Fetch all events
query GetEvents {
  events {
    id
    sport
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
  }
}
```

### Required Mutations

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
│   ├── Header.tsx      # Main navigation header
│   ├── EventCard.tsx   # Sports event display
│   ├── BetCard.tsx     # Bet history card
│   └── PlaceBetModal.tsx # Bet placement modal
├── contexts/           # React contexts
│   └── WalletContext.tsx # Wallet state management
├── lib/                # Utilities
│   ├── apollo-client.ts # Apollo GraphQL client
│   └── utils.ts        # Helper functions
├── pages/              # Route pages
│   ├── Index.tsx       # Home/Events page
│   ├── MyBets.tsx      # User bets dashboard
│   ├── Admin.tsx       # Admin panel
│   └── NotFound.tsx    # 404 page
├── types/              # TypeScript types
│   └── index.ts        # Shared type definitions
└── App.tsx             # App entry point
```

## Customization

### Connecting to Live Linera Service

1. Update `src/lib/apollo-client.ts` with your production endpoint
2. Implement wallet connection in `src/contexts/WalletContext.tsx`
3. Replace mock data in pages with actual GraphQL queries
4. Update mutations to trigger real Linera operations

### Adding New Sports

Edit the `Tabs` in `src/pages/Index.tsx` to add more sport categories:
```tsx
<TabsTrigger value="tennis">Tennis</TabsTrigger>
```

### Customizing Design

All design tokens are defined in:
- `src/index.css` - Color variables and gradients
- `tailwind.config.ts` - Extended theme configuration

## Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
```bash
VITE_GRAPHQL_ENDPOINT=https://your-linera-node.com/graphql
VITE_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_id
```

## Security Considerations

- All bet placements require wallet connection
- Admin functions should verify contract ownership on-chain
- Implement proper input validation before GraphQL mutations
- Use HTTPS for production deployments
- Implement rate limiting for bet placements

## Demo & Testing

The app includes mock data for demonstration:
- 6 sample sports events across Soccer, Basketball, and MMA
- 3 sample bets (active, won, lost) for the My Bets page
- Mock wallet with 1000.5 LINERA balance

To test with real data, connect to a live Linera service and update the GraphQL queries.

## License

MIT

## Powered by Linera

This application showcases Linera's capabilities for real-time, low-latency on-chain applications with transparent settlement and microchain architecture.
