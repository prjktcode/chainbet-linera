import { useState } from 'react';
import { Header } from '@/components/Header';
import { EventCard } from '@/components/EventCard';
import { SportEvent, Competition } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

// Competition display names mapping
// TODO: Confirm ECL mapping - currently assumed to be Europa League
const competitionNames: Record<Competition, string> = {
  NBA: 'NBA',
  EPL: 'Premier League',
  UCL: 'Champions League',
  UECL: 'Conference League',
  ECL: 'Europa League',
};

// Mock data - replace with GraphQL queries
// Filtered to supported competitions: NBA, EPL, UCL, UECL, ECL
const mockEvents: SportEvent[] = [
  // EPL (Premier League) events
  {
    id: '1',
    sport: 'Soccer',
    competition: 'EPL',
    homeTeam: 'Manchester United',
    awayTeam: 'Liverpool',
    startTime: '2025-11-01T19:00:00Z',
    status: 'upcoming',
    homeOdds: 2.5,
    awayOdds: 2.8,
    drawOdds: 3.2,
  },
  {
    id: '2',
    sport: 'Soccer',
    competition: 'EPL',
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    startTime: '2025-11-02T15:00:00Z',
    status: 'upcoming',
    homeOdds: 2.1,
    awayOdds: 3.0,
    drawOdds: 3.4,
  },
  // NBA events
  {
    id: '3',
    sport: 'Basketball',
    competition: 'NBA',
    homeTeam: 'Lakers',
    awayTeam: 'Warriors',
    startTime: '2025-10-30T20:00:00Z',
    status: 'live',
    homeOdds: 1.9,
    awayOdds: 2.1,
  },
  {
    id: '4',
    sport: 'Basketball',
    competition: 'NBA',
    homeTeam: 'Celtics',
    awayTeam: 'Heat',
    startTime: '2025-10-31T19:30:00Z',
    status: 'upcoming',
    homeOdds: 1.8,
    awayOdds: 2.2,
  },
  // UCL (Champions League) events
  {
    id: '5',
    sport: 'Soccer',
    competition: 'UCL',
    homeTeam: 'Real Madrid',
    awayTeam: 'Bayern Munich',
    startTime: '2025-11-05T20:00:00Z',
    status: 'upcoming',
    homeOdds: 2.2,
    awayOdds: 3.1,
    drawOdds: 3.5,
  },
  {
    id: '6',
    sport: 'Soccer',
    competition: 'UCL',
    homeTeam: 'Barcelona',
    awayTeam: 'PSG',
    startTime: '2025-11-05T20:00:00Z',
    status: 'upcoming',
    homeOdds: 2.0,
    awayOdds: 3.2,
    drawOdds: 3.6,
  },
  // UECL (Conference League) events
  {
    id: '7',
    sport: 'Soccer',
    competition: 'UECL',
    homeTeam: 'Fiorentina',
    awayTeam: 'Olympiacos',
    startTime: '2025-11-07T18:45:00Z',
    status: 'upcoming',
    homeOdds: 1.9,
    awayOdds: 3.5,
    drawOdds: 3.8,
  },
  // ECL (Europa League) events
  // TODO: Confirm ECL mapping - assumed to be Europa League
  {
    id: '8',
    sport: 'Soccer',
    competition: 'ECL',
    homeTeam: 'Roma',
    awayTeam: 'Sevilla',
    startTime: '2025-11-06T21:00:00Z',
    status: 'upcoming',
    homeOdds: 2.3,
    awayOdds: 2.9,
    drawOdds: 3.3,
  },
];

const Index = () => {
  const [selectedCompetition, setSelectedCompetition] = useState('all');

  const filteredEvents = selectedCompetition === 'all' 
    ? mockEvents 
    : mockEvents.filter(event => event.competition === selectedCompetition);

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
            Live <span className="text-gradient">Sports Events</span>
          </h1>
          <p className="text-muted-foreground">
            Place your bets on live and upcoming sports events powered by Linera blockchain
          </p>
        </motion.div>

        <Tabs value={selectedCompetition} onValueChange={setSelectedCompetition} className="mb-8">
          <TabsList className="bg-secondary flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="NBA">{competitionNames.NBA}</TabsTrigger>
            <TabsTrigger value="EPL">{competitionNames.EPL}</TabsTrigger>
            <TabsTrigger value="UCL">{competitionNames.UCL}</TabsTrigger>
            <TabsTrigger value="UECL">{competitionNames.UECL}</TabsTrigger>
            <TabsTrigger value="ECL">{competitionNames.ECL}</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <EventCard event={event} />
            </motion.div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No events found for this competition</p>
          </div>
        )}

        <div className="mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Powered by</span>
          <span className="font-semibold text-gradient">Linera</span>
        </div>
      </main>
    </div>
  );
};

export default Index;
