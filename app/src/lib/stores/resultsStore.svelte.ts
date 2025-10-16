import { RUNS_KEY } from '$lib/constants';
import type { Run } from './types';
import { getCandidateCountRange, getMaxRunCount } from './utils';
import { getData } from '$lib/utils/getData';
import { goto } from '$app/navigation';
import type { VotekitConfig } from '$lib/types/votekitConfig';
import { formState } from './formStore.svelte';

class ResultsState {
	constructor() {
		this.runs = this.readRuns();
	}

	runs: Run[] = $state([]);

	activeRunsList: string[] = $state([]);
	readonly activeRunsSet: Set<string> = $derived(new Set(this.activeRunsList));

	maxCount: number = $derived(getMaxRunCount(this.runs, this.activeRunsSet));
	candidateCountRange: { min: number; max: number } = $derived(
		getCandidateCountRange(this.runs, this.activeRunsSet)
	);

	resultsListeners: Array<{
		startedAt: number;
		id: string;
		listener: ReturnType<typeof setInterval>;
	}> = [];

	checkListeners() {
		const now = Date.now();
		const newListeners: this['resultsListeners'] = [];
		this.resultsListeners.forEach((l) => {
			if (l.startedAt < now - 120000) {
				clearInterval(l.listener);
			} else {
				newListeners.push(l);
			}
		});
		this.resultsListeners = newListeners;
	}

	clearListener(id: string) {
		const listener = this.resultsListeners.find((l) => l.id === id);
		if (listener) {
			clearInterval(listener.listener);
			this.resultsListeners.splice(this.resultsListeners.indexOf(listener), 1);
		}
	}

	async checkRunResults(runId: string) {
		const response = await getData(runId);
		if (response.ok && response.data.status === 'success') {
			resultsState.upsertRun({
				id: runId,
				name: response.data.config.name,
				config: response.data.config,
				result: response.data.results,
				createdAt: response.data.config.createdAt
			});
			resultsState.clearListener(runId);
		} else if (response.ok && response.data.status === 'error') {
			resultsState.upsertRun({
				id: runId,
				error: response.data.error
			});
			resultsState.clearListener(runId);
		}
		return response;
	}

	async checkStaleRun(runId: string) {
		const run = this.runs.find((r) => r.id === runId);
		const runHasListener = this.resultsListeners.some((l) => l.id === runId);
		if (run && run.createdAt && !runHasListener) {
			const r = await this.checkRunResults(runId);
			if (r.ok && r.data.status === 'success') {
				return;
			}
			const runDate = new Date(+run.createdAt);
			const dateNow = new Date();
			const diffTime = Math.abs(dateNow.getTime() - runDate.getTime());
			const diffMinutes = Math.floor(diffTime / (1000 * 60));
			if (diffMinutes < 5) {
				this.listenForResults(runId, run.config);
			} else {
				this.upsertRun({
					id: runId,
					error: 'Results not found'
				});
			}
		}
	}

	listenForResults(runId: string, config: VotekitConfig) {
		this.upsertRun({
			id: runId,
			name: config.name,
			config: config,
			createdAt: Date.now().toString()
		});
		resultsState.toggleActiveRun(runId);
		goto(`/results`);

		const checkFn = async () => {
			await resultsState.checkRunResults(runId);
		};
		const listener = setInterval(checkFn, 5000);
		this.resultsListeners.push({ startedAt: Date.now(), id: runId, listener });
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
		let runs = [...this.runs];
		if (prev) {
			runs.splice(runs.indexOf(prev), 1, {
				...prev,
				...runInfo,
				name: prev.name
			});
		} else if (runInfo.id && runInfo.name && runInfo.config && runInfo.createdAt) {
			const nameCollision = runs
				.filter((r) => {
					const nameWithoutNumber = r.name.replace(/\(\d+\)$/, '');
					return nameWithoutNumber.trim() === runInfo.name?.trim();
				})
				.map((r) => {
					return r.name;
				})
				.filter((r) => r !== null);
			console.log('!!nameCollision', nameCollision);
			const nameCollisionNumber = nameCollision.length > 0 ? nameCollision.length + 1 : null;
			console.log('!!nameCollisionNumber', nameCollision, nameCollisionNumber);
			runInfo.name = runInfo.name + `${nameCollisionNumber ? ` (${nameCollisionNumber})` : ''}`;
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
		// remove from runs
		this.runs = this.runs.filter((r) => r.id !== runId);
		// also remove from active selection if present
		if (this.activeRunsList.includes(runId)) {
			this.activeRunsList = this.activeRunsList.filter((r) => r !== runId);
		}
		// clear any pending listener for this run
		this.clearListener(runId);
		this.writeRuns(this.runs);
	}

	renameRun(runId: string, name: string) {
		this.runs = this.runs.map((r) => (r.id === runId ? { ...r, name } : r));
		this.writeRuns(this.runs);
	}

	loadSimulationSettings(runId: string) {
		const run = this.runs.find((r) => r.id === runId);
		const config = run?.config;
		if (config) {
			formState.loadSimulationSettings(config);
		}
	}
}

export const resultsState = new ResultsState();

if (typeof window !== 'undefined') {
	// @ts-ignore
	window.__clearRuns = resultsState.clear;
}
