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
	createdAt: string;
	config: VotekitConfig;
	result?: Record<SlateName, Record<OutcomeCandidateCount, Frequency>>;
}
