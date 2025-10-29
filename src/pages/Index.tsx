import { useState } from 'react';
import { Header } from '@/components/Header';
import { EventCard } from '@/components/EventCard';
import { SportEvent } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

// Mock data - replace with GraphQL queries
const mockEvents: SportEvent[] = [
  {
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
  {
    id: '2',
    sport: 'Basketball',
    homeTeam: 'Lakers',
    awayTeam: 'Warriors',
    startTime: '2025-10-30T20:00:00Z',
    status: 'live',
    homeOdds: 1.9,
    awayOdds: 2.1,
  },
  {
    id: '3',
    sport: 'MMA',
    homeTeam: 'Jon Jones',
    awayTeam: 'Stipe Miocic',
    startTime: '2025-11-05T22:00:00Z',
    status: 'upcoming',
    homeOdds: 1.5,
    awayOdds: 3.5,
  },
  {
    id: '4',
    sport: 'Soccer',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    startTime: '2025-11-02T17:00:00Z',
    status: 'upcoming',
    homeOdds: 2.2,
    awayOdds: 3.1,
    drawOdds: 3.5,
  },
  {
    id: '5',
    sport: 'Basketball',
    homeTeam: 'Celtics',
    awayTeam: 'Heat',
    startTime: '2025-10-31T19:30:00Z',
    status: 'upcoming',
    homeOdds: 1.8,
    awayOdds: 2.2,
  },
  {
    id: '6',
    sport: 'MMA',
    homeTeam: 'Israel Adesanya',
    awayTeam: 'Alex Pereira',
    startTime: '2025-11-08T21:00:00Z',
    status: 'upcoming',
    homeOdds: 2.4,
    awayOdds: 1.7,
  },
];

const Index = () => {
  const [selectedSport, setSelectedSport] = useState('all');

  const filteredEvents = selectedSport === 'all' 
    ? mockEvents 
    : mockEvents.filter(event => event.sport.toLowerCase() === selectedSport.toLowerCase());

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

        <Tabs value={selectedSport} onValueChange={setSelectedSport} className="mb-8">
          <TabsList className="bg-secondary">
            <TabsTrigger value="all">All Sports</TabsTrigger>
            <TabsTrigger value="soccer">Soccer</TabsTrigger>
            <TabsTrigger value="basketball">Basketball</TabsTrigger>
            <TabsTrigger value="mma">MMA</TabsTrigger>
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
            <p className="text-muted-foreground">No events found for this sport</p>
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
