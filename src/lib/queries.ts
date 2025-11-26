import { gql } from '@apollo/client';

/**
 * Allowed leagues for display on the platform.
 * Events will be filtered client-side to only show these competitions.
 */
export const ALLOWED_LEAGUES = [
  'Premier League',
  'NBA',
  'Champions League',
  'Europa League',
  'Europa Conference League',
] as const;

export type AllowedLeague = typeof ALLOWED_LEAGUES[number];

/**
 * Helper to determine the sport for a given league.
 * Used as a fallback filter when league field is not available.
 */
export const LEAGUE_SPORT_MAP: Record<AllowedLeague, string> = {
  'Premier League': 'Soccer',
  'NBA': 'Basketball',
  'Champions League': 'Soccer',
  'Europa League': 'Soccer',
  'Europa Conference League': 'Soccer',
};

/**
 * Alternative keywords/tags that may identify a league in the backend
 * if the league field is absent. Used for fallback filtering.
 */
export const LEAGUE_KEYWORDS: Record<AllowedLeague, string[]> = {
  'Premier League': ['premier', 'epl', 'english premier'],
  'NBA': ['nba', 'national basketball'],
  'Champions League': ['champions league', 'ucl', 'uefa champions'],
  'Europa League': ['europa league', 'uel', 'uefa europa'],
  'Europa Conference League': ['conference league', 'uecl', 'europa conference'],
};

/**
 * Checks if an event matches one of the allowed leagues.
 * Falls back to sport + keyword matching if league field is missing.
 * 
 * @param event - Event object with optional league, sport, and competition fields
 * @returns true if the event should be displayed
 */
export function isAllowedEvent(event: {
  league?: string | null;
  sport?: string;
  competition?: string;
  tags?: string[];
}): boolean {
  // If league field is present, check direct match
  if (event.league) {
    return ALLOWED_LEAGUES.some(
      (allowed) => event.league?.toLowerCase().includes(allowed.toLowerCase())
    );
  }

  // Fallback: Check sport + competition/tag keywords
  const eventSport = event.sport?.toLowerCase() || '';
  const eventCompetition = event.competition?.toLowerCase() || '';
  const eventTags = (event.tags || []).map((t) => t.toLowerCase()).join(' ');
  const searchText = `${eventCompetition} ${eventTags}`;

  for (const league of ALLOWED_LEAGUES) {
    const expectedSport = LEAGUE_SPORT_MAP[league].toLowerCase();
    const keywords = LEAGUE_KEYWORDS[league];

    // Sport must match for this league
    if (eventSport.includes(expectedSport) || expectedSport.includes(eventSport)) {
      // Check if any keyword matches
      if (keywords.some((kw) => searchText.includes(kw.toLowerCase()))) {
        return true;
      }
    }
  }

  // If no league field and no keyword match, allow events from supported sports
  // as a permissive fallback (derived from LEAGUE_SPORT_MAP values)
  const fallbackAllowedSports = [...new Set(Object.values(LEAGUE_SPORT_MAP))].map(s => s.toLowerCase());
  if (fallbackAllowedSports.includes(eventSport)) {
    return true;
  }

  return false;
}

/**
 * Extracts the league name from an event using various fields.
 * Returns the matched allowed league or the raw league/competition value.
 */
export function getEventLeague(event: {
  league?: string | null;
  sport?: string;
  competition?: string;
}): string {
  if (event.league) {
    const matched = ALLOWED_LEAGUES.find(
      (allowed) => event.league?.toLowerCase().includes(allowed.toLowerCase())
    );
    return matched || event.league;
  }

  if (event.competition) {
    const matched = ALLOWED_LEAGUES.find(
      (allowed) => event.competition?.toLowerCase().includes(allowed.toLowerCase())
    );
    return matched || event.competition;
  }

  // Return sport as fallback
  return event.sport || 'Unknown';
}

// ============================================================================
// GraphQL Queries
// ============================================================================

/**
 * Fetches all available events from the Linera backend.
 * The league field is included if available; client-side filtering is applied.
 */
export const GET_EVENTS = gql`
  query GetEvents {
    events {
      id
      sport
      league
      competition
      homeTeam
      awayTeam
      startTime
      status
      homeOdds
      awayOdds
      drawOdds
      result
    }
  }
`;

/**
 * Fetches bets for a specific account from the Linera backend.
 */
export const GET_BETS = gql`
  query GetBets($accountId: String!) {
    bets(accountId: $accountId) {
      id
      eventId
      outcome
      odds
      stake
      status
      payout
      placedAt
      event {
        id
        sport
        league
        homeTeam
        awayTeam
        startTime
        status
        homeOdds
        awayOdds
        drawOdds
        result
      }
    }
  }
`;

// ============================================================================
// GraphQL Mutations
// ============================================================================

/**
 * Places a bet on an event.
 * Requires wallet connection and stake > 0.
 */
export const PLACE_BET = gql`
  mutation PlaceBet($eventId: String!, $outcome: String!, $amount: Float!) {
    placeBet(eventId: $eventId, outcome: $outcome, amount: $amount) {
      success
      betId
      message
    }
  }
`;

/**
 * Resolves an event with a result (admin only).
 */
export const RESOLVE_EVENT = gql`
  mutation ResolveEvent($eventId: String!, $result: String!) {
    resolveEvent(eventId: $eventId, result: $result) {
      success
      event {
        id
        status
        result
      }
    }
  }
`;

// ============================================================================
// Query Response Types
// ============================================================================

export interface GetEventsResponse {
  events: Array<{
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
  }>;
}

export interface GetBetsResponse {
  bets: Array<{
    id: string;
    eventId: string;
    outcome: string;
    odds: number;
    stake: number;
    status: 'active' | 'won' | 'lost';
    payout?: number | null;
    placedAt: string;
    event: {
      id: string;
      sport: string;
      league?: string | null;
      homeTeam: string;
      awayTeam: string;
      startTime: string;
      status: 'upcoming' | 'live' | 'finished';
      homeOdds: number;
      awayOdds: number;
      drawOdds?: number | null;
      result?: string | null;
    };
  }>;
}

export interface PlaceBetResponse {
  placeBet: {
    success: boolean;
    betId?: string;
    message?: string;
  };
}

export interface ResolveEventResponse {
  resolveEvent: {
    success: boolean;
    event?: {
      id: string;
      status: string;
      result: string;
    };
  };
}
