import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Event, ALLOWED_LEAGUES, NBA_TEAMS, PREMIER_LEAGUE_TEAMS, UEFA_TEAMS } from '@/types';
import { GET_EVENTS, RESOLVE_EVENT, GetEventsData, ResolveEventData, ResolveEventVariables } from '@/lib/queries';

// Mock events data for fallback
const mockEvents: Event[] = [
  {
    id: '1',
    sport: 'Soccer',
    league: 'Premier League',
    homeTeam: 'Manchester United',
    awayTeam: 'Liverpool',
    startTime: '2025-11-01T19:00:00Z',
    status: 'live',
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
];

// Function to infer league from team names
function inferLeague(event: Event): string | undefined {
  if (NBA_TEAMS.some(team => event.homeTeam.includes(team) || event.awayTeam.includes(team))) {
    return 'NBA';
  }
  if (PREMIER_LEAGUE_TEAMS.some(team => event.homeTeam.includes(team) || event.awayTeam.includes(team))) {
    return 'Premier League';
  }
  if (UEFA_TEAMS.some(team => event.homeTeam.includes(team) || event.awayTeam.includes(team))) {
    return 'UEFA Champions League';
  }
  return undefined;
}

function isEventAllowed(event: Event): boolean {
  if (event.league) {
    return ALLOWED_LEAGUES.includes(event.league as typeof ALLOWED_LEAGUES[number]);
  }
  return inferLeague(event) !== undefined;
}

const Admin = () => {
  const [selectedResults, setSelectedResults] = useState<Record<string, string>>({});
  const [resolvingEventId, setResolvingEventId] = useState<string | null>(null);

  // Fetch events from GraphQL
  const { data, loading, error, refetch } = useQuery<GetEventsData>(GET_EVENTS, {
    fetchPolicy: 'cache-and-network',
  });

  // Resolve event mutation
  const [resolveEvent] = useMutation<ResolveEventData, ResolveEventVariables>(RESOLVE_EVENT, {
    onCompleted: (data) => {
      if (data.resolveEvent.success) {
        toast.success('Event resolved successfully!');
        refetch();
      } else {
        toast.error('Failed to resolve event');
      }
      setResolvingEventId(null);
    },
    onError: (error) => {
      console.error('Resolve event error:', error);
      toast.error('Failed to resolve event: ' + error.message);
      setResolvingEventId(null);
    },
  });

  // Use fetched data or fallback to mock
  const rawEvents = data?.events || mockEvents;
  
  // Filter to allowed leagues only
  const events = useMemo(() => rawEvents.filter(isEventAllowed), [rawEvents]);

  const handleResultChange = (eventId: string, result: string) => {
    setSelectedResults(prev => ({ ...prev, [eventId]: result }));
  };

  const handleResolveEvent = async (eventId: string) => {
    const result = selectedResults[eventId];
    if (!result) {
      toast.error('Please select a result');
      return;
    }

    setResolvingEventId(eventId);

    try {
      await resolveEvent({
        variables: { eventId, result },
      });
    } catch {
      // Error handled in onError callback
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-success/10 text-success border-success/20">Live</Badge>;
      case 'finished':
        return <Badge className="bg-muted text-muted-foreground">Finished</Badge>;
      default:
        return <Badge className="bg-primary/10 text-primary border-primary/20">Upcoming</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">
              Admin <span className="text-gradient">Panel</span>
            </h1>
          </div>
          <p className="text-muted-foreground">
            Manage and resolve sports events (Owner only)
          </p>
        </motion.div>

        {/* Warning Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="rounded-lg bg-accent/10 border border-accent/20 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-accent">Admin Access Required</p>
              <p className="text-xs text-muted-foreground">
                Only the contract owner can resolve events on-chain. Resolving an event will settle all bets 
                and distribute payouts on the Linera blockchain. Permission checks are enforced by the backend.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="gradient-card border border-border/50">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Events Management
              </h2>

              {loading && !data && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading events...</span>
                </div>
              )}

              {error && !data && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Unable to fetch events from chain. Showing demo data.
                </div>
              )}

              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/30">
                      <TableHead>Event</TableHead>
                      <TableHead>League</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id} className="hover:bg-secondary/20">
                        <TableCell>
                          <div className="font-medium">
                            {event.homeTeam} vs {event.awayTeam}
                          </div>
                          <div className="text-xs text-muted-foreground">{event.sport}</div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{event.league || inferLeague(event) || '-'}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{formatDate(event.startTime)}</span>
                        </TableCell>
                        <TableCell>{getStatusBadge(event.status)}</TableCell>
                        <TableCell>
                          {event.result ? (
                            <Badge variant="outline">{event.result}</Badge>
                          ) : (
                            <Select
                              value={selectedResults[event.id] || ''}
                              onValueChange={(value) => handleResultChange(event.id, value)}
                            >
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="HOME">{event.homeTeam}</SelectItem>
                                <SelectItem value="AWAY">{event.awayTeam}</SelectItem>
                                {event.drawOdds && <SelectItem value="DRAW">Draw</SelectItem>}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {!event.result && (
                            <Button
                              size="sm"
                              onClick={() => handleResolveEvent(event.id)}
                              disabled={!selectedResults[event.id] || resolvingEventId === event.id}
                            >
                              {resolvingEventId === event.id ? (
                                <>
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Resolving...
                                </>
                              ) : (
                                'Resolve'
                              )}
                            </Button>
                          )}
                          {event.result && (
                            <span className="text-sm text-muted-foreground">Resolved</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {events.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No events found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="gradient-card border border-border/50 p-6">
            <h3 className="text-lg font-semibold mb-4">GraphQL Mutation Example</h3>
            <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto text-xs">
              <code>{`mutation ResolveEvent {
  resolveEvent(
    eventId: "1",
    result: "HOME"
  ) {
    success
    event {
      id
      status
      result
    }
  }
}`}</code>
            </pre>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Admin;
