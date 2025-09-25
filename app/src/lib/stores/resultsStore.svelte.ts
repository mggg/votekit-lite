import { RUNS_KEY } from '$lib/constants';
import type { Run } from './types';
import { getCandidateCountRange, getMaxRunCount } from './utils';


class ResultsState {
	constructor() {
		this.runs = this.readRuns();
	}

	runs: Run[] = $state([]);
	activeRuns: Set<string> = $state(new Set());
	maxCount: number = $derived(getMaxRunCount(this.runs, this.activeRuns));
	candidateCountRange: { min: number, max: number } = $derived(getCandidateCountRange(this.runs, this.activeRuns));
	
	readRuns(): Run[] {
		if (typeof localStorage === 'undefined') return [];
		const raw = localStorage.getItem(RUNS_KEY);
		if (!raw) return [];
		try {
			return JSON.parse(raw) as Run[];
		} catch {
			return [];
		}
	}
	
	upsertRun(runInfo: Partial<Run>) {
		if (!runInfo.id) {
			return;
		}
		const prev = this.runs.find((r) => r.id === runInfo.id);
		let runs = [...this.runs];
		if (prev) {
			runs.splice(runs.indexOf(prev), 1, {
				...prev,
				...runInfo
			});
		} else if (runInfo.id && runInfo.name && runInfo.config && runInfo.createdAt) {
			runs.unshift({
				id: runInfo.id,
				name: runInfo.name,
				createdAt: runInfo.createdAt,
				config: runInfo.config,
				...runInfo
			});
		}
		this.writeRuns(runs);
		this.runs = runs;
	}
	
	writeRuns(runs: Run[]) {
		if (typeof localStorage === 'undefined') return;
		localStorage.setItem(RUNS_KEY, JSON.stringify(runs));
	}

	toggleActiveRun(runId: string) {
		const newActiveRuns = new Set(this.activeRuns);
		newActiveRuns.has(runId) ? newActiveRuns.delete(runId) : newActiveRuns.add(runId);
		this.activeRuns = newActiveRuns;
	}
}

export const resultsState = new ResultsState();

if (typeof window !== 'undefined') {
	// @ts-ignore
	window.__clearRuns = resultsState.clear;
}