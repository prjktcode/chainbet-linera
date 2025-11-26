import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Event } from '@/types';
import { useWallet } from '@/contexts/WalletContext';
import { PLACE_BET, PlaceBetData, PlaceBetVariables } from '@/lib/queries';
import { toast } from 'sonner';
import { TrendingUp, Wallet, Loader2 } from 'lucide-react';

interface PlaceBetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event;
  selectedOutcome: 'home' | 'away' | 'draw';
}

export function PlaceBetModal({ open, onOpenChange, event, selectedOutcome }: PlaceBetModalProps) {
  const [amount, setAmount] = useState('');
  const { isConnected, balance, connect } = useWallet();

  // PlaceBet mutation
  const [placeBet, { loading: isPlacing }] = useMutation<PlaceBetData, PlaceBetVariables>(PLACE_BET, {
    onCompleted: (data) => {
      if (data.placeBet.success) {
        toast.success('Bet placed successfully!', {
          description: `${amount} LINERA on ${getOutcomeLabel()} at ${getOdds()}x`,
        });
        setAmount('');
        onOpenChange(false);
      } else {
        toast.error(data.placeBet.message || 'Failed to place bet');
      }
    },
    onError: (error) => {
      console.error('Place bet error:', error);
      toast.error('Failed to place bet: ' + error.message);
    },
  });

  const getOutcomeLabel = () => {
    switch (selectedOutcome) {
      case 'home':
        return event.homeTeam;
      case 'away':
        return event.awayTeam;
      case 'draw':
        return 'Draw';
    }
  };

  const getOutcomeValue = (): string => {
    switch (selectedOutcome) {
      case 'home':
        return 'HOME';
      case 'away':
        return 'AWAY';
      case 'draw':
        return 'DRAW';
    }
  };

  const getOdds = () => {
    switch (selectedOutcome) {
      case 'home':
        return event.homeOdds;
      case 'away':
        return event.awayOdds;
      case 'draw':
        return event.drawOdds || 0;
    }
  };

  const calculatePayout = () => {
    const stake = parseFloat(amount) || 0;
    return (stake * getOdds()).toFixed(2);
  };

  const handlePlaceBet = async () => {
    if (!isConnected) {
      connect();
      return;
    }

    const stake = parseFloat(amount);
    if (!stake || stake <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    if (stake > balance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      await placeBet({
        variables: {
          eventId: event.id,
          outcome: getOutcomeValue(),
          amount: stake,
        },
      });
    } catch {
      // Error handled in onError callback
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gradient-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl">Place Bet</DialogTitle>
          <DialogDescription>
            {event.homeTeam} vs {event.awayTeam}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Your Selection</Label>
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
              <span className="font-semibold">{getOutcomeLabel()}</span>
              <span className="text-accent font-bold text-lg">{getOdds()}x</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Bet Amount (LINERA)</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-20"
                step="0.01"
                min="0"
                disabled={!isConnected || isPlacing}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8"
                onClick={() => setAmount(balance.toString())}
                disabled={!isConnected || isPlacing}
              >
                MAX
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Available: {isConnected ? balance.toFixed(2) : '0.00'} LINERA
            </p>
          </div>

          <div className="space-y-3 p-4 rounded-lg bg-secondary/50 border border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Stake</span>
              <span className="font-medium">{amount || '0.00'} LINERA</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Odds</span>
              <span className="font-medium">{getOdds()}x</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between">
              <span className="font-medium">Potential Payout</span>
              <span className="font-bold text-accent text-lg">{calculatePayout()} LINERA</span>
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handlePlaceBet}
            disabled={isPlacing || (isConnected && !amount)}
          >
            {!isConnected ? (
              <>
                <Wallet className="h-4 w-4" />
                Connect Wallet to Bet
              </>
            ) : isPlacing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Placing Bet...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4" />
                Place Bet
              </>
            )}
          </Button>

          {!isConnected && (
            <p className="text-xs text-center text-muted-foreground">
              Connect your Linera wallet to place bets
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
