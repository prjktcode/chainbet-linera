import { Header } from '@/components/Header';
import { BetCard } from '@/components/BetCard';
import { Bet } from '@/types';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data - replace with GraphQL queries
const mockBets: Bet[] = [
  {
    id: '1',
    eventId: '1',
    event: {
      id: '1',
      sport: 'Soccer',
      homeTeam: 'Manchester United',
      awayTeam: 'Liverpool',
      startTime: '2025-11-01T19:00:00Z',
      status: 'upcoming',
      homeOdds: 2.5,
      awayOdds: 2.8,
      drawOdds: 3.2,
    },
    outcome: 'Manchester United',
    odds: 2.5,
    stake: 50,
    status: 'active',
    placedAt: '2025-10-28T14:30:00Z',
  },
  {
    id: '2',
    eventId: '2',
    event: {
      id: '2',
      sport: 'Basketball',
      homeTeam: 'Lakers',
      awayTeam: 'Warriors',
      startTime: '2025-10-27T20:00:00Z',
      status: 'finished',
      homeOdds: 1.9,
      awayOdds: 2.1,
    },
    outcome: 'Lakers',
    odds: 1.9,
    stake: 100,
    status: 'won',
    payout: 190,
    placedAt: '2025-10-27T18:00:00Z',
  },
  {
    id: '3',
    eventId: '3',
    event: {
      id: '3',
      sport: 'MMA',
      homeTeam: 'Jon Jones',
      awayTeam: 'Stipe Miocic',
      startTime: '2025-10-26T22:00:00Z',
      status: 'finished',
      homeOdds: 1.5,
      awayOdds: 3.5,
    },
    outcome: 'Stipe Miocic',
    odds: 3.5,
    stake: 25,
    status: 'lost',
    placedAt: '2025-10-26T20:00:00Z',
  },
];

const MyBets = () => {
  const { connected, connect } = useWallet();

  const activeBets = mockBets.filter(bet => bet.status === 'active');
  const wonBets = mockBets.filter(bet => bet.status === 'won');
  const lostBets = mockBets.filter(bet => bet.status === 'lost');

  const totalStaked = mockBets.reduce((sum, bet) => sum + bet.stake, 0);
  const totalWon = wonBets.reduce((sum, bet) => sum + (bet.payout || 0), 0);
  const totalLost = lostBets.reduce((sum, bet) => sum + bet.stake, 0);
  const netProfit = totalWon - totalLost;

  if (!connected) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <Wallet className="h-16 w-16 mx-auto text-primary" />
            <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
            <p className="text-muted-foreground max-w-md">
              Connect your Linera wallet to view your betting history and track your bets
            </p>
            <Button size="lg" onClick={connect}>
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            My <span className="text-gradient">Bets</span>
          </h1>
          <p className="text-muted-foreground">
            Track all your active and settled bets
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="gradient-card p-6 rounded-lg border border-border/50"
          >
            <p className="text-sm text-muted-foreground mb-1">Total Staked</p>
            <p className="text-2xl font-bold">{totalStaked} LINERA</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="gradient-card p-6 rounded-lg border border-border/50"
          >
            <p className="text-sm text-muted-foreground mb-1">Total Won</p>
            <p className="text-2xl font-bold text-success">{totalWon} LINERA</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="gradient-card p-6 rounded-lg border border-border/50"
          >
            <p className="text-sm text-muted-foreground mb-1">Total Lost</p>
            <p className="text-2xl font-bold text-destructive">{totalLost} LINERA</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="gradient-card p-6 rounded-lg border border-border/50"
          >
            <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
              {netProfit >= 0 ? '+' : ''}{netProfit} LINERA
            </p>
          </motion.div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-secondary">
            <TabsTrigger value="all">All Bets ({mockBets.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeBets.length})</TabsTrigger>
            <TabsTrigger value="won">Won ({wonBets.length})</TabsTrigger>
            <TabsTrigger value="lost">Lost ({lostBets.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {mockBets.map((bet, index) => (
              <motion.div
                key={bet.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <BetCard bet={bet} />
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeBets.length > 0 ? (
              activeBets.map((bet, index) => (
                <motion.div
                  key={bet.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BetCard bet={bet} />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No active bets</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="won" className="space-y-4">
            {wonBets.length > 0 ? (
              wonBets.map((bet, index) => (
                <motion.div
                  key={bet.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BetCard bet={bet} />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No won bets yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="lost" className="space-y-4">
            {lostBets.length > 0 ? (
              lostBets.map((bet, index) => (
                <motion.div
                  key={bet.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BetCard bet={bet} />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No lost bets</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MyBets;
