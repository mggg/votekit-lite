import { RUNS_KEY } from '$lib/constants';
import type { Run } from './types';


class ResultsState {
	runs: Run[] = $state([]);

	constructor() {
		this.runs = this.readRuns();
		$effect(() => {
			this.writeRuns(this.runs);
		});
	}

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
		if (prev) {
			this.runs.splice(this.runs.indexOf(prev), 1, {
				...prev,
				...runInfo
			});
		} else {
			this.runs.unshift({
				id: runInfo.id,
				name: runInfo.name || 'No name',
				config: runInfo.config
			});
		}
	}

	writeRuns(runs: Run[]) {
		if (typeof localStorage === 'undefined') return;
		localStorage.setItem(RUNS_KEY, JSON.stringify(runs));
	}
}

export const resultsState = new ResultsState();
