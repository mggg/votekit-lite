import type { VoterPreference } from '$lib';

// Re-export types from storage for convenience
export type { VoterPreference, Run } from '$lib';

// Types
export type ElectionMode = 'blocPlurality' | 'multiseat';
export type BallotGenerator = 'sBT' | 'sPL' | 'CS';
export type VoterBlocMode = 'count' | 'share';
export type Slate = {
  numCandidates: number;
  name: string;
}
export type VoterBloc = {
  population: number;
  turnout: number;
  name: string;
}

export interface FormStore {
  name: string;
  trials: number;
  mode: ElectionMode;
  ballotGenerator: BallotGenerator;
  stvNumSeats: number;
  maxRankingCandidatesInput: number;
  // Voter bloc state
  numVoterBlocs: number;
  voterBlocMode: VoterBlocMode;
  totalVoters: number;
  blocCounts: number[];
  blocShares: number[];
  blocNames: string[];
  blocPopulations: number[];
  blocTurnouts: number[];
  blocPreferences: VoterPreference[][];
  blocCohesion: number[][];
  // Slate state
  numSlates: number;
  slateCandidates: number[];
  slateNames: string[];
  // UI state
  showTurnoutSettings: boolean;
  recaptchaChecked: boolean;
  // Derived
  totalCandidates: number;
  stvMin: number;
  stvMax: number;
}