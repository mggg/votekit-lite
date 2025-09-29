import type { VotekitConfig } from '$lib/types/votekitConfig';
import type { FormState } from './formStore.svelte';
import type { SlateName, Run } from './types';

interface BalanceRemainingValueProps {
	maxValue: number;
	newValue: number;
	newIndex: number;
	currentValues: number[];
}

export const balanceRemainingValue = ({
	maxValue = 1,
	newValue,
	newIndex,
	currentValues
}: BalanceRemainingValueProps) => {
	const count = currentValues.length;
	const prevRemaining = maxValue - currentValues[newIndex];
	const newRemaining = maxValue - newValue;
	const newShares = currentValues.map((share, i) => {
		if (newIndex === i) {
			return newValue;
		} else {
			const shareOfRemaining =
				prevRemaining === 0 ? newRemaining / (count - 1) : newRemaining * (share / prevRemaining);

			return shareOfRemaining;
		}
	});
	return newShares;
};

export const getMaxRunCount = (runs: Run[], activeRuns: Set<string>) => {
	let max = 0;
	activeRuns.forEach((runId) => {
		const run = runs.find((run) => run.id === runId);
		if (run) {
			const runResult = run.result;
			if (runResult) {
				Object.values(runResult).forEach((result) => {
					const values = Object.values(result);
					max = Math.max(max, ...values);
				});
			}
		}
	});
	return max;
};

export const getCandidateCountRange = (runs: Run[], activeRuns: Set<string>) => {
	let min = Infinity;
	let max = 0;
	activeRuns.forEach((runId) => {
		const run = runs.find((run) => run.id === runId);
		if (run) {
			const runResult = run.result;
			if (runResult) {
				Object.values(runResult).forEach((result) => {
					const values = Object.values(result);
					min = Math.min(min, ...values);
					max = Math.max(max, ...values);
				});
			}
		}
	});
	return { min, max };
};

export const calculateCombinedSupport = (config: VotekitConfig) => {
	const numberOfSeats = config.election.numSeats;
	const totalVoters = config.numVoters;
	const combinedSupport: Record<SlateName, number> = {};

	Object.entries(config.voterBlocs).forEach(([_, blocConfig]) => {
		const blocVoters = blocConfig.proportion * totalVoters;
		Object.entries(blocConfig.cohesion).forEach(([slateName, cohesion]) => {
			combinedSupport[slateName] = (combinedSupport[slateName] || 0) + cohesion * blocVoters;
		});
	});

	const expectedNumberOfSeats = Object.entries(combinedSupport).map(([slateName, support]) => ({
		slate: slateName,
		support: Math.round(support * 100) / 100,
		seats: Math.round((support / totalVoters) * numberOfSeats * 100) / 100
	}));
	return expectedNumberOfSeats;
};

export const formatConfig = (id: string, state: FormState): VotekitConfig => ({
	id,
	name: state.name,
	numVoters: state.totalVoters,
	voterBlocs: state.blocs.reduce(
		(acc, bloc, index) => ({
			...acc,
			[bloc.name]: {
				proportion: state.voterShare[index],
				preference: state.blocPreferences[index].reduce(
					(acc, preference, index) => ({
						...acc,
						[state.slates[index].name]: preference
					}),
					{}
				),
				cohesion: state.blocCohesion[index].reduce(
					(acc, cohesion, index) => ({
						...acc,
						[state.slates[index].name]: cohesion || 1e-10
					}),
					{}
				)
			}
		}),
		{}
	),
	slates: state.slates.reduce(
		(acc, slate) => ({
			...acc,
			[slate.name]: {
				numCandidates: slate.numCandidates
			}
		}),
		{}
	),
	election:
		state.system === 'blocPlurality'
			? {
					system: 'blocPlurality',
					numSeats: state.numSeats,
					maxBallotLength: state.maxRankingCandidatesInput
				}
			: {
					system: 'STV',
					numSeats: state.numSeats,
					maxBallotLength: state.maxRankingCandidatesInput
				},
	ballotGenerator: state.ballotGenerator,
	trials: state.trials,
	createdAt: Date.now().toString()
});
