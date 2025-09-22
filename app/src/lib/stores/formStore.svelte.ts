import { randomRunName } from '$lib';
// Re-export types from storage for convenience
import type { Slate, VoterBloc } from './types';
import type { VoterBlocMode } from './types';
import { balanceRemainingValue } from './utils';
import type { VotekitConfig, VoterPreference } from '$lib/types/votekitConfig';

// Constants
export const MAX_CANDIDATES = 12;

class FormState {
	name: string = $state('');
	trials: number = $state(100);
	system = $state<VotekitConfig['election']['system']>('STV');
	ballotGenerator = $state<VotekitConfig['ballotGenerator']>('sPL');
	numSeats: number = $state(5);
	maxRankingCandidatesInput: number = $state(6);
	numVoterBlocs: number = $state(2);
	voterBlocMode: VoterBlocMode = $state('count');

	// Source of truth for blocs: Population and turnout
	blocs = $state<VoterBloc[]>([
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
	totalVoters: number = $derived(this.blocCounts.reduce((current, blocCount) => current + blocCount, 0));
	totalPopulation: number = $derived(this.blocs.reduce((current, bloc) => current + bloc.population, 0));
	populationShare: number[] = $derived(
		this.blocs.map((bloc) => bloc.population / this.totalPopulation)
	);
	voterShare: number[] = $derived(this.blocCounts.map((count) => count / this.totalVoters));

	blocPreferences = $state<VoterPreference[][]>([
		['all_bets_off', 'all_bets_off'],
		['all_bets_off', 'all_bets_off']
	]);
	blocCohesion: number[][] = $state([
		[1.0, 0],
		[0, 1.0]
	]);

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

	showTurnoutSettings: boolean = false;
	totalCandidates: number = $derived(
		this.slates.reduce((sum, slate) => sum + slate.numCandidates, 0)
	);
	remainingCandidates: number = $derived(MAX_CANDIDATES - this.totalCandidates);
	seatsMin: number = 2;
	seatsMax: number = $derived(Math.max(this.seatsMin, this.totalCandidates));

	recaptchaToken: string = $state('');
	initialize() {
		this.name = randomRunName();
	}

	updateNumSlates(value: number) {
		if (this.totalCandidates == MAX_CANDIDATES) {
			console.log('Total candidates is at maximum');
			return;
		}
		if (value < this.slates.length) {
			this.slates = this.slates.slice(0, value);
			this.blocCohesion = this.blocCohesion.map((bloc) => bloc.slice(0, value));
			this.blocPreferences = this.blocPreferences.map((bloc) => bloc.slice(0, value));
		} else {
			const newSlates = [...this.slates];
			for (let i = this.slates.length; i < value; i++) {
				newSlates.push({
					numCandidates: Math.min(3, MAX_CANDIDATES - this.totalCandidates),
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
				newBlocPreferences.push(new Array(this.slates.length).fill('random'));
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
				population: Math.round(newTotalPopulation)
			};
		});
		this.blocs = newBlocPopulations;
	}

	updateBlocElectorateShare(index: number, value: number) {
		const newShares = balanceRemainingValue({
			maxValue: 1,
			newValue: value,
			newIndex: index,
			currentValues: this.populationShare
		});

		const newBlocPopulations = this.blocs.map((bloc, i) => {
			if (index === i) {
				const newTotalPopulation = Math.round(this.totalPopulation * value);
				return {
					...bloc,
					population: newTotalPopulation
				};
			} else {
				const newTotalPopulation = Math.round(this.totalPopulation * newShares[i]);
				return {
					...bloc,
					population: newTotalPopulation
				};
			}
		});
		this.blocs = newBlocPopulations;
	}

	updateBlocCohesion(blocIndex: number, slateIndex: number, value: number) {
		const newCohesion = balanceRemainingValue({
			maxValue: 1,
			newValue: value,
			newIndex: slateIndex,
			currentValues: this.blocCohesion[blocIndex]
		});
		this.blocCohesion[blocIndex] = newCohesion;
	}

	async submitMock() {
		const id = crypto.randomUUID();
		const config: VotekitConfig = {
				id,
				name: this.name,
				numVoters: this.totalVoters,
				voterBlocs: this.blocs.reduce((acc, bloc, index) => ({
					...acc,
					[bloc.name]: {
						proportion: this.voterShare[index],
						preference: this.blocPreferences[index],
						cohesion: this.blocCohesion[index]
					}
				}), {}),
				slates: this.slates.reduce((acc, slate) => ({
					...acc,
					[slate.name]: {
						numCandidates: slate.numCandidates
					}
				}), {}),
				election:
					this.system === 'blocPlurality'
						? { system: 'blocPlurality', numSeats: this.numSeats, maxBallotLength: this.maxRankingCandidatesInput }
						: { system: 'STV', numSeats: this.numSeats, maxBallotLength: this.maxRankingCandidatesInput },
				ballotGenerator: this.ballotGenerator,
				trials: this.trials,
				createdAt: Date.now().toString()
		};
		const r = await fetch('/api/invoke', {
			method: 'POST',
			body: JSON.stringify({
				votekitConfig: config,
				recaptchaToken: this.recaptchaToken
			})
		});
		const result = await r.json();
		console.log(result);
	}
}

export const formState = new FormState();
