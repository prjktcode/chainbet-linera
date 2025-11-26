export interface SportEvent {
  id: string;
  sport: string;
  league?: string | null;
  competition?: string | null;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  status: 'upcoming' | 'live' | 'finished';
  homeOdds: number;
  awayOdds: number;
  drawOdds?: number | null;
  result?: string | null;
}

export interface Bet {
  id: string;
  eventId: string;
  event: SportEvent;
  outcome: string;
  odds: number;
  stake: number;
  status: 'active' | 'won' | 'lost';
  payout?: number;
  placedAt: string;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  balance: number;
}
