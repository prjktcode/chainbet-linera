import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { Header } from '@/components/Header';
import { EventCard } from '@/components/EventCard';
import { SportEvent } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  GET_EVENTS,
  GetEventsResponse,
  ALLOWED_LEAGUES,
  isAllowedEvent,
  getEventLeague,
} from '@/lib/queries';

// Mock data for fallback when GraphQL endpoint is unavailable
const mockEvents: SportEvent[] = [
  {
    id: '1',
    sport: 'Soccer',
    league: 'Premier League',
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
    league: 'NBA',
    homeTeam: 'Lakers',
    awayTeam: 'Warriors',
    startTime: '2025-10-30T20:00:00Z',
    status: 'live',
    homeOdds: 1.9,
    awayOdds: 2.1,
  },
  {
    id: '3',
    sport: 'Soccer',
    league: 'Champions League',
    homeTeam: 'Real Madrid',
    awayTeam: 'Bayern Munich',
    startTime: '2025-11-05T20:00:00Z',
    status: 'upcoming',
    homeOdds: 2.1,
    awayOdds: 3.0,
    drawOdds: 3.4,
  },
  {
    id: '4',
    sport: 'Soccer',
    league: 'Europa League',
    homeTeam: 'AS Roma',
    awayTeam: 'Sevilla',
    startTime: '2025-11-02T17:00:00Z',
    status: 'upcoming',
    homeOdds: 2.2,
    awayOdds: 3.1,
    drawOdds: 3.5,
  },
  {
    id: '5',
    sport: 'Basketball',
    league: 'NBA',
    homeTeam: 'Celtics',
    awayTeam: 'Heat',
    startTime: '2025-10-31T19:30:00Z',
    status: 'upcoming',
    homeOdds: 1.8,
    awayOdds: 2.2,
  },
  {
    id: '6',
    sport: 'Soccer',
    league: 'Europa Conference League',
    homeTeam: 'Olympiacos',
    awayTeam: 'Aston Villa',
    startTime: '2025-11-08T18:00:00Z',
    status: 'upcoming',
    homeOdds: 2.4,
    awayOdds: 2.9,
    drawOdds: 3.3,
  },
];

const Index = () => {
  const [selectedLeague, setSelectedLeague] = useState('all');

  // Fetch events from GraphQL
  const { data, loading, error, refetch } = useQuery<GetEventsResponse>(GET_EVENTS, {
    fetchPolicy: 'cache-and-network',
  });

  // Process events: filter by allowed leagues and add derived league field
  const events = useMemo(() => {
    const rawEvents = data?.events || mockEvents;
    
    return rawEvents
      .filter(isAllowedEvent)
      .map((event) => ({
        ...event,
        league: getEventLeague(event),
        drawOdds: event.drawOdds ?? undefined,
        result: event.result ?? undefined,
      })) as SportEvent[];
  }, [data?.events]);

  // Filter events by selected league
  const filteredEvents = useMemo(() => {
    if (selectedLeague === 'all') {
      return events;
    }
    return events.filter((event) => {
      const eventLeague = event.league?.toLowerCase() || '';
      return eventLeague.includes(selectedLeague.toLowerCase());
    });
  }, [events, selectedLeague]);

  const isUsingMockData = !data?.events && !loading && !error;

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

        {/* League Filter Tabs */}
        <Tabs value={selectedLeague} onValueChange={setSelectedLeague} className="mb-8">
          <TabsList className="bg-secondary flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="all">All Competitions</TabsTrigger>
            {ALLOWED_LEAGUES.map((league) => (
              <TabsTrigger key={league} value={league.toLowerCase()}>
                {league}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading events...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <p className="text-destructive font-medium mb-2">Failed to load events</p>
            <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </motion.div>
        )}

        {/* Mock Data Notice */}
        {isUsingMockData && (
          <div className="mb-6 p-4 rounded-lg bg-accent/10 border border-accent/20">
            <p className="text-sm text-accent flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Showing demo data. Connect to a Linera GraphQL endpoint for live events.
            </p>
          </div>
        )}

        {/* Events Grid */}
        {!loading && (
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
        )}

        {/* Empty State */}
        {!loading && filteredEvents.length === 0 && (
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
