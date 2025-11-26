// Supported competition types
// TODO: Confirm ECL mapping - currently assumed to be Europa League
export type Competition = 'NBA' | 'EPL' | 'UCL' | 'UECL' | 'ECL';

export interface SportEvent {
  id: string;
  sport: string;
  competition?: Competition;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  status: 'upcoming' | 'live' | 'finished';
  homeOdds: number;
  awayOdds: number;
  drawOdds?: number;
  result?: string;
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

// New wallet context interface for WalletConnect integration
export interface WalletContextState {
  accountId: string | null;
  isConnected: boolean;
}
