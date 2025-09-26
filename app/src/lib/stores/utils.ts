import type { OutcomeCandidateCount, SlateName, Run, Frequency } from './types';

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

export const convertListToCount = (
	results: Record<SlateName, Array<OutcomeCandidateCount>>,
	maxCandidates: number
): Run['result'] => {
	const output: Record<SlateName, Record<OutcomeCandidateCount, Frequency>> = {};
	// Track the lowest value to determine the bottom of the x axis
	// loop through results and get counts of each cnadidate frequency
	Object.entries(results).forEach(([slateName, outcomeCandidateCounts]) => {
		if (!output[slateName]) {
			output[slateName] = {};
		}
		outcomeCandidateCounts.forEach((candidateCount) => {
			output[slateName][candidateCount] = (output[slateName][candidateCount] || 0) + 1;
		});
	});
	// Backfill missing values
	const valueRange = new Array(maxCandidates).fill(0).map((_, i) => i);
	Object.entries(output).forEach(([slateName]) => {
		valueRange.forEach((value) => {
			output[slateName][value] = output[slateName][value] || 0;
		});
	});
	return output;
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
