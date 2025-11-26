import { useState } from 'react';
import { Calendar, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Event } from '@/types';
import { PlaceBetModal } from './PlaceBetModal';
import { motion } from 'framer-motion';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const [showBetModal, setShowBetModal] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<'home' | 'away' | 'draw'>('home');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handlePlaceBet = (outcome: 'home' | 'away' | 'draw') => {
    setSelectedOutcome(outcome);
    setShowBetModal(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="gradient-card border border-border/50 hover:border-primary/50 transition-all duration-300 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {event.sport}
              </span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(event.startTime)}
              </div>
            </div>

            <div className="space-y-4">
              {/* Home Team */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors cursor-pointer group" onClick={() => handlePlaceBet('home')}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {event.homeTeam.charAt(0)}
                  </div>
                  <span className="font-medium">{event.homeTeam}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-accent font-bold text-lg">{event.homeOdds.toFixed(2)}</span>
                  <Button variant="accent" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    Bet
                  </Button>
                </div>
              </div>

              {/* Draw (if applicable) */}
              {event.drawOdds && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors cursor-pointer group" onClick={() => handlePlaceBet('draw')}>
                  <span className="font-medium">Draw</span>
                  <div className="flex items-center gap-2">
                    <span className="text-accent font-bold text-lg">{event.drawOdds.toFixed(2)}</span>
                    <Button variant="accent" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      Bet
                    </Button>
                  </div>
                </div>
              )}

              {/* Away Team */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors cursor-pointer group" onClick={() => handlePlaceBet('away')}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {event.awayTeam.charAt(0)}
                  </div>
                  <span className="font-medium">{event.awayTeam}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-accent font-bold text-lg">{event.awayOdds.toFixed(2)}</span>
                  <Button variant="accent" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    Bet
                  </Button>
                </div>
              </div>
            </div>

            {event.status === 'live' && (
              <div className="mt-4 flex items-center gap-2 text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                <span className="text-success font-medium">LIVE</span>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      <PlaceBetModal
        open={showBetModal}
        onOpenChange={setShowBetModal}
        event={event}
        selectedOutcome={selectedOutcome}
      />
    </>
  );
}
