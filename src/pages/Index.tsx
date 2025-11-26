import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { Header } from '@/components/Header';
import { EventCard } from '@/components/EventCard';
import { Event, ALLOWED_LEAGUES, NBA_TEAMS, PREMIER_LEAGUE_TEAMS, UEFA_TEAMS } from '@/types';
import { GET_EVENTS, GetEventsData } from '@/lib/queries';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';

// Mock data for fallback when GraphQL is unavailable
const mockEvents: Event[] = [
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
    league: 'UEFA Champions League',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    startTime: '2025-11-02T17:00:00Z',
    status: 'upcoming',
    homeOdds: 2.2,
    awayOdds: 3.1,
    drawOdds: 3.5,
  },
  {
    id: '4',
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
    id: '5',
    sport: 'Soccer',
    league: 'UEFA Europa League',
    homeTeam: 'Sevilla',
    awayTeam: 'Roma',
    startTime: '2025-11-03T20:00:00Z',
    status: 'upcoming',
    homeOdds: 2.4,
    awayOdds: 2.9,
    drawOdds: 3.1,
  },
  {
    id: '6',
    sport: 'Soccer',
    league: 'UEFA Europa Conference League',
    homeTeam: 'Feyenoord',
    awayTeam: 'Ajax',
    startTime: '2025-11-04T18:45:00Z',
    status: 'upcoming',
    homeOdds: 2.1,
    awayOdds: 3.3,
    drawOdds: 3.4,
  },
];

// Function to infer league from team names
function inferLeague(event: Event): string | undefined {
  // Check if teams are NBA teams
  if (NBA_TEAMS.some(team => 
    event.homeTeam.includes(team) || event.awayTeam.includes(team)
  )) {
    return 'NBA';
  }
  
  // Check if teams are Premier League teams
  if (PREMIER_LEAGUE_TEAMS.some(team => 
    event.homeTeam.includes(team) || event.awayTeam.includes(team)
  )) {
    return 'Premier League';
  }
  
  // Check if teams are UEFA competition teams
  if (UEFA_TEAMS.some(team => 
    event.homeTeam.includes(team) || event.awayTeam.includes(team)
  )) {
    return 'UEFA Champions League'; // Default to Champions League for UEFA teams
  }
  
  return undefined;
}

// Function to check if an event matches allowed leagues
function isEventAllowed(event: Event): boolean {
  // If event has a league field, check if it's in allowed leagues
  if (event.league) {
    return ALLOWED_LEAGUES.includes(event.league as typeof ALLOWED_LEAGUES[number]);
  }
  
  // Try to infer league from team names
  const inferredLeague = inferLeague(event);
  return inferredLeague !== undefined;
}

// Function to get the league for filtering UI
function getEventLeague(event: Event): string {
  if (event.league) return event.league;
  return inferLeague(event) || event.sport;
}

const Index = () => {
  const [selectedSport, setSelectedSport] = useState('all');
  
  // Fetch events from GraphQL
  const { data, loading, error } = useQuery<GetEventsData>(GET_EVENTS, {
    fetchPolicy: 'cache-and-network',
  });

  // Use fetched data or fallback to mock data
  const rawEvents = data?.events || mockEvents;
  
  // Filter events to only include allowed leagues
  const allowedEvents = useMemo(() => {
    return rawEvents.filter(isEventAllowed);
  }, [rawEvents]);

  // Apply sport filter
  const filteredEvents = useMemo(() => {
    if (selectedSport === 'all') return allowedEvents;
    
    return allowedEvents.filter(event => {
      const league = getEventLeague(event);
      if (selectedSport === 'soccer') {
        return event.sport.toLowerCase() === 'soccer' || 
               event.sport.toLowerCase() === 'football' ||
               league.includes('Premier League') ||
               league.includes('UEFA');
      }
      if (selectedSport === 'basketball') {
        return event.sport.toLowerCase() === 'basketball' ||
               league === 'NBA';
      }
      return event.sport.toLowerCase() === selectedSport.toLowerCase();
    });
  }, [allowedEvents, selectedSport]);

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
          <p className="text-xs text-muted-foreground mt-1">
            Available leagues: {ALLOWED_LEAGUES.join(', ')}
          </p>
        </motion.div>

        <Tabs value={selectedSport} onValueChange={setSelectedSport} className="mb-8">
          <TabsList className="bg-secondary">
            <TabsTrigger value="all">All Sports</TabsTrigger>
            <TabsTrigger value="soccer">Soccer</TabsTrigger>
            <TabsTrigger value="basketball">Basketball</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading && !data && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading events...</span>
          </div>
        )}

        {error && !data && (
          <div className="flex items-center justify-center py-12 text-destructive">
            <AlertCircle className="h-6 w-6 mr-2" />
            <span>Failed to load events. Showing demo data.</span>
          </div>
        )}

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

        {filteredEvents.length === 0 && !loading && (
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
