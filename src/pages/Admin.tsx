import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Shield, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { SportEvent } from '@/types';

// Mock events data
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
];

const Admin = () => {
  const [selectedEvent, setSelectedEvent] = useState('');
  const [result, setResult] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const handleResolveEvent = async () => {
    if (!selectedEvent || !result) {
      toast.error('Please select an event and result');
      return;
    }

    setIsResolving(true);

    try {
      // Mock GraphQL mutation - replace with actual Linera mutation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Event resolved successfully!', {
        description: `Event ${selectedEvent} marked as ${result}`,
      });
      
      setSelectedEvent('');
      setResult('');
    } catch (error) {
      toast.error('Failed to resolve event');
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="gradient-card border border-border/50 p-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-primary" />
              Resolve Event
            </h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="event">Select Event</Label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger id="event">
                    <SelectValue placeholder="Choose an event to resolve" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockEvents.map(event => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.homeTeam} vs {event.awayTeam} ({event.sport})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedEvent && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="result">Select Winner</Label>
                    <Select value={result} onValueChange={setResult}>
                      <SelectTrigger id="result">
                        <SelectValue placeholder="Choose the winner" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockEvents.find(e => e.id === selectedEvent)?.drawOdds && (
                          <SelectItem value="draw">Draw</SelectItem>
                        )}
                        <SelectItem value="home">
                          {mockEvents.find(e => e.id === selectedEvent)?.homeTeam}
                        </SelectItem>
                        <SelectItem value="away">
                          {mockEvents.find(e => e.id === selectedEvent)?.awayTeam}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/30 space-y-2">
                    <p className="text-sm text-muted-foreground">Event Details</p>
                    <div className="space-y-1">
                      <p className="font-medium">
                        {mockEvents.find(e => e.id === selectedEvent)?.homeTeam} vs{' '}
                        {mockEvents.find(e => e.id === selectedEvent)?.awayTeam}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {mockEvents.find(e => e.id === selectedEvent)?.sport}
                      </p>
                    </div>
                  </div>
                </>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handleResolveEvent}
                disabled={!selectedEvent || !result || isResolving}
              >
                {isResolving ? 'Resolving...' : 'Resolve Event'}
              </Button>

              <div className="rounded-lg bg-accent/10 border border-accent/20 p-4">
                <p className="text-sm text-accent flex items-start gap-2">
                  <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Only the contract owner can resolve events. Resolving an event will settle all bets and
                    distribute payouts accordingly on the Linera blockchain.
                  </span>
                </p>
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
    result: "home"
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
