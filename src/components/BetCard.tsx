import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bet } from '@/types';
import { Calendar, TrendingUp, Trophy, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface BetCardProps {
  bet: Bet;
}

export function BetCard({ bet }: BetCardProps) {
  const getStatusIcon = () => {
    switch (bet.status) {
      case 'won':
        return <Trophy className="h-4 w-4 text-success" />;
      case 'lost':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <TrendingUp className="h-4 w-4 text-accent" />;
    }
  };

  const getStatusColor = () => {
    switch (bet.status) {
      case 'won':
        return 'bg-success/10 text-success border-success/20';
      case 'lost':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-accent/10 text-accent border-accent/20';
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="gradient-card border border-border/50 hover:border-primary/50 transition-all">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold">
                  {bet.event.homeTeam} vs {bet.event.awayTeam}
                </span>
                <Badge variant="outline" className="text-xs">
                  {bet.event.sport}
                </Badge>
                {bet.event.league && (
                  <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                    {bet.event.league}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(bet.placedAt)}
              </div>
            </div>
            <Badge className={`${getStatusColor()} border`}>
              <span className="flex items-center gap-1">
                {getStatusIcon()}
                {bet.status.toUpperCase()}
              </span>
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-secondary/30">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Selection</p>
              <p className="font-medium">{bet.outcome}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Odds</p>
              <p className="font-medium text-accent">{bet.odds}x</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Stake</p>
              <p className="font-medium">{bet.stake} LINERA</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {bet.status === 'won' ? 'Payout' : bet.status === 'lost' ? 'Lost' : 'Potential'}
              </p>
              <p className={`font-bold ${bet.status === 'won' ? 'text-success' : bet.status === 'lost' ? 'text-destructive' : 'text-accent'}`}>
                {bet.payout ? bet.payout.toFixed(2) : (bet.stake * bet.odds).toFixed(2)} LINERA
              </p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
