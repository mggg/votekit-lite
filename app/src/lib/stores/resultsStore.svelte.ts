import { RUNS_KEY } from '$lib/constants';
import type { Run } from './types';
import { getCandidateCountRange, getMaxRunCount } from './utils';

class ResultsState {
	constructor() {
		this.runs = this.readRuns();
	}

	runs: Run[] = $state([]);

	activeRunsList: string[] = $state([]);
	readonly activeRunsSet: Set<string> = $derived(new Set());

	maxCount: number = $derived(getMaxRunCount(this.runs, this.activeRunsSet));
	candidateCountRange: { min: number; max: number } = $derived(
		getCandidateCountRange(this.runs, this.activeRunsSet)
	);

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
		this.activeRunsList = this.activeRunsList.includes(runId)
			? this.activeRunsList.filter((r) => r !== runId)
			: [...this.activeRunsList, runId];
	}

	selectAll() {
		this.activeRunsList = this.runs.map((r) => r.id);
	}

	clearSelection() {
		this.activeRunsList = [];
	}

	removeRun(runId: string) {
		this.runs = this.runs.filter((r) => r.id !== runId);
		this.writeRuns(this.runs);
	}

	renameRun(runId: string, name: string) {
		this.runs = this.runs.map((r) => (r.id === runId ? { ...r, name } : r));
		this.writeRuns(this.runs);
	}
}

export const resultsState = new ResultsState();

if (typeof window !== 'undefined') {
	// @ts-ignore
	window.__clearRuns = resultsState.clear;
}
