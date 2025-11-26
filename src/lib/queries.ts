import { gql } from "@apollo/client";

// Query to fetch all events
export const GET_EVENTS = gql`
  query GetEvents {
    events {
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
`;

// Query to fetch bets for a specific account
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
    }
  }
`;

// Mutation to place a bet
export const PLACE_BET = gql`
  mutation PlaceBet($eventId: String!, $outcome: String!, $amount: Float!) {
    placeBet(eventId: $eventId, outcome: $outcome, amount: $amount) {
      success
      betId
      message
    }
  }
`;

// Mutation to resolve an event (admin only)
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

// Type definitions for query results
export interface GetEventsData {
  events: {
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
  }[];
}

export interface GetBetsData {
  bets: {
    id: string;
    eventId: string;
    outcome: string;
    odds: number;
    stake: number;
    status: 'active' | 'won' | 'lost';
    payout?: number;
    placedAt: string;
  }[];
}

export interface PlaceBetData {
  placeBet: {
    success: boolean;
    betId?: string;
    message?: string;
  };
}

export interface ResolveEventData {
  resolveEvent: {
    success: boolean;
    event?: {
      id: string;
      status: string;
      result?: string;
    };
  };
}

export interface PlaceBetVariables {
  eventId: string;
  outcome: string;
  amount: number;
}

export interface ResolveEventVariables {
  eventId: string;
  result: string;
}

export interface GetBetsVariables {
  accountId: string;
}
