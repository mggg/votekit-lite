// Re-export types from storage for convenience
export type { VoterPreference, Run } from '$lib';

// Types
export type ElectionSystem = 'blocPlurality' | 'stv';
export type BallotGenerator = 'sBT' | 'sPL' | 'CS';
export type VoterBlocMode = 'count' | 'share';
export type Slate = {
	numCandidates: number;
	name: string;
};
export type VoterBloc = {
	population: number;
	turnout: number;
	name: string;
};
