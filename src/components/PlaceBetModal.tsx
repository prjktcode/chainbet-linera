import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SportEvent } from '@/types';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from 'sonner';
import { TrendingUp, Wallet } from 'lucide-react';

interface PlaceBetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: SportEvent;
  selectedOutcome: 'home' | 'away' | 'draw';
}

export function PlaceBetModal({ open, onOpenChange, event, selectedOutcome }: PlaceBetModalProps) {
  const [amount, setAmount] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const { connected, balance } = useWallet();

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
    if (!connected) {
      toast.error('Please connect your wallet first');
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

    setIsPlacing(true);
    
    // Mock GraphQL mutation - replace with actual Linera mutation
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Bet placed successfully!', {
        description: `${stake} LINERA on ${getOutcomeLabel()} at ${getOdds()}x`,
      });
      
      setAmount('');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to place bet');
    } finally {
      setIsPlacing(false);
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
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8"
                onClick={() => setAmount(balance.toString())}
              >
                MAX
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Available: {balance.toFixed(2)} LINERA
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
            disabled={!connected || isPlacing || !amount}
          >
            {!connected ? (
              <>
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </>
            ) : isPlacing ? (
              'Placing Bet...'
            ) : (
              <>
                <TrendingUp className="h-4 w-4" />
                Place Bet
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
