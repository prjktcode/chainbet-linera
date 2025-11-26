// Allowed leagues for the platform
export const ALLOWED_LEAGUES = [
  "Premier League",
  "NBA",
  "UEFA Champions League",
  "UEFA Europa League",
  "UEFA Europa Conference League",
] as const;

export type League = (typeof ALLOWED_LEAGUES)[number];

export type Outcome = "HOME" | "AWAY" | "DRAW";

export interface Event {
  id: string;
  sport: string;
  league?: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  status: 'upcoming' | 'live' | 'finished';
  homeOdds: number;
  awayOdds: number;
  drawOdds?: number;
  result?: string;
}

// Alias for backwards compatibility
export type SportEvent = Event;

export interface Bet {
  id: string;
  eventId: string;
  event?: Event;
  outcome: string;
  odds: number;
  stake: number;
  status: 'active' | 'won' | 'lost';
  payout?: number;
  placedAt: string;
}

export interface WalletState {
  accountId: string | null;
  balance: number;
  isConnecting: boolean;
  isConnected: boolean;
  // Legacy fields for backwards compatibility
  connected: boolean;
  address: string | null;
}

// Team lists for league inference
export const NBA_TEAMS = [
  "Lakers", "Warriors", "Celtics", "Heat", "Nets", "Bucks", "76ers", "Suns",
  "Mavericks", "Nuggets", "Clippers", "Bulls", "Raptors", "Hawks", "Cavaliers",
  "Pacers", "Knicks", "Hornets", "Magic", "Wizards", "Pistons", "Spurs",
  "Rockets", "Grizzlies", "Pelicans", "Timberwolves", "Thunder", "Trail Blazers",
  "Jazz", "Kings"
];

export const PREMIER_LEAGUE_TEAMS = [
  "Manchester United", "Manchester City", "Liverpool", "Chelsea", "Arsenal",
  "Tottenham", "Newcastle", "Brighton", "Aston Villa", "West Ham", "Everton",
  "Leicester", "Wolves", "Crystal Palace", "Southampton", "Bournemouth",
  "Nottingham Forest", "Fulham", "Brentford", "Leeds"
];

export const UEFA_TEAMS = [
  "Real Madrid", "Barcelona", "Bayern Munich", "Paris Saint-Germain", "Juventus",
  "Inter Milan", "AC Milan", "Atletico Madrid", "Dortmund", "RB Leipzig",
  "Porto", "Benfica", "Ajax", "PSV", "Feyenoord", "Sporting CP", "Marseille",
  "Monaco", "Lyon", "Napoli", "Roma", "Lazio", "Atalanta", "Sevilla", "Valencia"
];
