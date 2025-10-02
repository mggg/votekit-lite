import type { VotekitConfig } from '$lib/types/votekitConfig';

// Types
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
export type SlateName = string;
export type OutcomeCandidateCount = number;
export type Frequency = number;

export interface Run {
	id: string;
	name: string;
	config: VotekitConfig;
	error?: string;
	createdAt?: string;
	result?: Record<SlateName, Record<OutcomeCandidateCount, Frequency>>;
}
