import { randomRunName } from '$lib';
import { goto } from '$app/navigation';
// Re-export types from storage for convenience
import type { Slate, VoterBloc } from './types';
import type { VoterBlocMode } from './types';
import { balanceRemainingValue, formatConfig } from './utils';
import {
	VotekitConfigSchema,
	type VotekitConfig,
	type VoterPreference
} from '$lib/types/votekitConfig';
import { resultsState } from './resultsStore.svelte';
// Constants
export const MAX_CANDIDATES = 12;

export class FormState {
	name: string = $state('');
	trials: number = $state(100);
	system = $state<VotekitConfig['election']['system']>('STV');
	ballotGenerator: VotekitConfig['ballotGenerator'] = $state('sPL');
	numSeats: number = $state(5);
	maxRankingCandidatesInput: number = $state(6);
	numVoterBlocs: number = $state(2);
	voterBlocMode: VoterBlocMode = $state('count');
	isLoading: boolean = $state(false);

	// Source of truth for blocs: Population and turnout
	blocs: VoterBloc[] = $state([
		{
			population: 50,
			turnout: 1.0,
			name: 'A'
		},
		{
			population: 50,
			turnout: 1.0,
			name: 'B'
		}
	]);
	// Derived from population and turnout
	// blocParticipatingVoterCount
	blocCounts: number[] = $derived(
		this.blocs.map((bloc) => Math.round(bloc.population * bloc.turnout))
	);
	totalVoters: number = $derived(
		this.blocCounts.reduce((current, blocCount) => current + blocCount, 0)
	);
	unallocatedPopulation: number = $state(0);
	totalPopulation: number = $derived(
		this.blocs.reduce((current, bloc) => current + bloc.population, this.unallocatedPopulation)
	);
	maxPercentages = $derived(
		this.blocs.map((bloc) => (bloc.population + this.unallocatedPopulation) / this.totalPopulation)
	);
	populationShare: number[] = $derived(
		this.blocs.map((bloc) => bloc.population / this.totalPopulation)
	);
	voterShare: number[] = $derived(this.blocCounts.map((count) => count / this.totalVoters));

	blocPreferences: VoterPreference[][] = $state([
		['all_bets_off', 'all_bets_off'],
		['all_bets_off', 'all_bets_off']
	]);
	blocCohesion: number[][] = $state([
		[1.0, 0],
		[0, 1.0]
	]);
	blocCohesionSum: number[] = $derived(
		this.blocCohesion.map((cohesion) => cohesion.reduce((sum, cohesion) => sum + cohesion, 0))
	);

	// Source of truth for slates: Number of candidates and name
	slates: Slate[] = $state([
		{
			numCandidates: 3,
			name: 'A'
		},
		{
			numCandidates: 3,
			name: 'B'
		}
	]);

	showTurnoutSettings = $state<boolean>(false);
	totalCandidates: number = $derived(
		this.slates.reduce((sum, slate) => sum + slate.numCandidates, 0)
	);
	remainingCandidates: number = $derived(MAX_CANDIDATES - this.totalCandidates);
	seatsMin: number = 2;
	seatsMax: number = $derived(Math.max(this.seatsMin, this.totalCandidates));

	turnstileToken: string = $state('');
	initialize() {
		this.name = randomRunName();
	}

	updateNumSlates(value: number) {
		if (this.totalCandidates == MAX_CANDIDATES && value >= this.slates.length) {
			console.log('Total candidates is at maximum');
			return;
		}
		if (value > 5 || value < 1) {
			console.log('Number of slates must be between 1 and 5');
			return;
		}
		if (value < this.slates.length) {
			this.slates = this.slates.slice(0, value);
			this.blocCohesion = this.blocCohesion.map((bloc) => bloc.slice(0, value));
			this.blocPreferences = this.blocPreferences.map((bloc) => bloc.slice(0, value));
		} else {
			const remainingCandidates = MAX_CANDIDATES - this.totalCandidates;
			const numNewSlates = value - this.slates.length;
			const numCandidatesPerSlate = Math.min(3, Math.floor(remainingCandidates / numNewSlates));
			const newSlates = [...this.slates];
			for (let i = this.slates.length; i < value; i++) {
				newSlates.push({
					numCandidates: numCandidatesPerSlate,
					name: String.fromCharCode(65 + i)
				});
			}
			const newBlocCohesion = this.blocCohesion.map((bloc) => {
				const newBlocCohesion = [...bloc];
				for (let i = bloc.length; i < value; i++) {
					newBlocCohesion.push(0);
				}
				return newBlocCohesion;
			});
			const newBlocPreferences = this.blocPreferences.map((bloc) => {
				const newBlocPreferences = [...bloc];
				for (let i = bloc.length; i < value; i++) {
					newBlocPreferences.push('all_bets_off');
				}
				return newBlocPreferences;
			});
			this.slates = newSlates;
			this.blocCohesion = newBlocCohesion;
			this.blocPreferences = newBlocPreferences;
		}
	}

	updateNumVoterBlocs(value: number) {
		if (value < this.blocs.length) {
			this.blocs = this.blocs.slice(0, value);
			this.blocCohesion = this.blocCohesion.slice(0, value);
			this.blocPreferences = this.blocPreferences.slice(0, value);
		} else {
			const newBlocs = [...this.blocs];
			const newBlocCohesion = [...this.blocCohesion];
			const newBlocPreferences = [...this.blocPreferences];
			for (let i = this.blocs.length; i < value; i++) {
				newBlocs.push({ population: 50, turnout: 1.0, name: String.fromCharCode(65 + i) });
				newBlocCohesion.push(new Array(this.slates.length).fill(1 / this.slates.length));
				newBlocPreferences.push(new Array(this.slates.length).fill('all_bets_off'));
			}
			this.blocs = newBlocs;
			this.blocCohesion = newBlocCohesion;
			this.blocPreferences = newBlocPreferences;
		}
	}

	updateTotalElectorate(_value: number) {
		const value = Math.max(1, _value);
		const newBlocPopulations = this.blocs.map((bloc) => {
			const shareOfTotalElectorate = bloc.population / this.totalPopulation;
			const newTotalPopulation = shareOfTotalElectorate * value;
			return {
				...bloc,
				population: newTotalPopulation
			};
		});
		this.blocs = newBlocPopulations;
	}

	updateBlocElectorateShare(e: Event, index: number, value: number) {
		const numBlocs = this.blocs.length;
		let newShares = this.populationShare;
		const currentValue = this.populationShare[index];
		if (numBlocs === 2) {
			newShares = balanceRemainingValue({
				maxValue: 1,
				newValue: value,
				newIndex: index,
				currentValues: this.populationShare
			});
			const newBlocs = this.blocs.map((bloc, i) => ({
				...bloc,
				population: this.totalPopulation * newShares[i]
			}));
			this.blocs = newBlocs;
		} else if (this.unallocatedPopulation === 0 && value > currentValue) {
			(e.currentTarget as HTMLInputElement).value = currentValue.toString();
			return;
		} else {
			const newPopulationValue = Math.min(
				this.blocs[index].population + this.unallocatedPopulation,
				this.totalPopulation * value
			);
			(e.currentTarget as HTMLInputElement).value = (
				newPopulationValue / this.totalPopulation
			).toString();
			const newBlocs = this.blocs.map((bloc, i) => {
				if (index === i) {
					return { ...bloc, population: newPopulationValue };
				} else {
					return { ...bloc };
				}
			});
			const newUnallocatedPopulation =
				this.totalPopulation - newBlocs.reduce((sum, bloc) => sum + bloc.population, 0);
			this.unallocatedPopulation = Math.round(newUnallocatedPopulation);
			this.blocs = newBlocs;
		}
	}

	updateBlocCohesion(e: Event, blocIndex: number, slateIndex: number, value: number) {
		const numSlates = this.slates.length;
		if (numSlates === 2) {
			this.blocCohesion[blocIndex] = this.blocCohesion[blocIndex].map((cohesion, i) =>
				i === slateIndex ? value : 1 - value
			);
		} else {
			const currentCohesion = this.blocCohesion[blocIndex];
			const currentCohesionSlateValue = currentCohesion[slateIndex];
			const newCohesionValue = Math.min(
				value,
				1 - this.blocCohesionSum[blocIndex] + currentCohesionSlateValue
			);
			(e.currentTarget as HTMLInputElement).value = Math.round(newCohesionValue * 100).toString();
			const newCohesion = currentCohesion.map((cohesion, i) =>
				i === slateIndex ? newCohesionValue : cohesion
			);
			this.blocCohesion[blocIndex] = newCohesion;
		}
	}

	async submitRun() {
		const id = crypto.randomUUID();
		this.isLoading = true;
		const config: VotekitConfig = formatConfig(id, this);
		console.log('Invoking with config:', VotekitConfigSchema.parse(config));
		const response = await fetch('/api/invoke', {
			method: 'POST',
			body: JSON.stringify({
				votekitConfig: config,
				turnstileToken: this.turnstileToken
			})
		}).then((res) => (res.ok ? res.json() : null));
		resultsState.listenForResults(id);
		// if (!response || !response.results) {
		// 	this.isLoading = false;
		// 	console.error('Error invoking lambda:', response);
		// 	return;
		// }
		// resultsState.upsertRun({
		// 	id,
		// 	name: this.name,
		// 	config,
		// 	createdAt: Date.now().toString(),
		// 	result: response.results
		// });
		// resultsState.toggleActiveRun(id);
		// this.isLoading = false;
		// goto('/results');
	}
}

export const formState = new FormState();
