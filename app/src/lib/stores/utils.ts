import type { OutcomeCandidateCount, SlateName, Run, Frequency } from "./types";

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
	let minValue = maxCandidates;
	// loop through results and get counts of each cnadidate frequency
	Object.entries(results).forEach(([slateName, outcomeCandidateCounts]) => {
		if (!output[slateName]) {
			output[slateName] = {};
		}
		outcomeCandidateCounts.forEach((candidateCount) => {
			if (candidateCount < minValue) {
				minValue = candidateCount;
			}
			output[slateName][candidateCount] = (output[slateName][candidateCount] || 0) + 1;
		});
	})
	// Backfill missing values
	const valueRange = new Array(maxCandidates - minValue + 1).fill(0).map((_, i) => minValue + i);
	Object.entries(output).forEach(([slateName]) => {
		valueRange.forEach((value) => {
			output[slateName][value] = (output[slateName][value] || 0);
		});
	});
	return output;
};