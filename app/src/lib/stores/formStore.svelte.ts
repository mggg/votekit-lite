import { mockHistogramData, randomRunName, saveRun, type Run } from '$lib';
import type { VoterPreference } from '$lib';

// Re-export types from storage for convenience
export type { VoterPreference, Run } from '$lib';
import type { BallotGenerator, ElectionMode, Slate, VoterBloc } from './types';
import type { VoterBlocMode } from './types';
import { balanceRemainingValue } from './utils';

// Constants
export const MAX_CANDIDATES = 12;

class FormState {
	name: string = $state('');
	trials: number = $state(100);
	mode: ElectionMode = $state('multiseat');
	ballotGenerator: BallotGenerator = $state('sPL');
	stvNumSeats: number = $state(5);
	maxRankingCandidatesInput: number = $state(6);
	numVoterBlocs: number = $state(2);
	voterBlocMode: VoterBlocMode = $state('count');
	blocNames: string[] = $state(['A', 'B']);

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
	totalVoters: number = $derived(this.blocCounts.reduce((a, b) => a + b, 0));
	totalPopulation: number = $derived(this.blocs.reduce((a, b) => a + b.population, 0));
	populationShare: number[] = $derived(
		this.blocs.map((bloc) => bloc.population / this.totalPopulation)
	);
	voterShare: number[] = $derived(this.blocCounts.map((count) => count / this.totalVoters));

	blocPreferences: VoterPreference[][] = $state([
		['random', 'random'],
		['random', 'random']
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
	stvMin: number = 2;
	stvMax: number = $derived(Math.max(this.stvMin, this.totalCandidates));

	recaptchaChecked: boolean = $state(false);
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
					newBlocPreferences.push('random');
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
		const run: Run = {
			params: {
				id,
				name: this.name,
				voterBlocs: this.blocCounts.map((count, index) => ({
					count,
					preference: {
						forA: formState.blocPreferences[index][0] || 'random',
						forB: formState.blocPreferences[index][1] || 'random'
					},
					cohesionPct: formState.blocCohesion[index][0] || 0.7
				})),
				slates: {
					slateA: { numCandidates: formState.slates[0].numCandidates || 1 },
					slateB: { numCandidates: formState.slates[1].numCandidates || 1 }
				},
				election:
					formState.mode === 'blocPlurality'
						? { mode: 'plurality' }
						: { mode: 'multiseat', stv: true, numSeats: formState.stvNumSeats },
				ballotGenerator: formState.ballotGenerator,
				trials: formState.trials,
				maxRankingCandidates: formState.maxRankingCandidatesInput,
				numSlates: formState.slates.length,
				slateCandidates: formState.slates.map((slate) => slate.numCandidates),
				slateNames: formState.slates.map((slate) => slate.name),
				numVoterBlocs: formState.numVoterBlocs,
				blocCounts: formState.blocCounts,
				blocShares: formState.voterShare,
				blocNames: formState.blocNames,
				blocPopulations: formState.blocs.map((bloc) => bloc.population),
				blocTurnouts: formState.blocs.map((bloc) => bloc.turnout),
				blocPreferences: formState.blocPreferences,
				blocCohesion: formState.blocCohesion,
				voterBlocMode: formState.voterBlocMode,
				totalVoters: formState.totalVoters,
				createdAt: Date.now()
			},
			result: {
				slateAElected: mockHistogramData(
					formState.trials,
					0.5,
					formState.mode === 'multiseat' ? formState.stvNumSeats : 1
				),
				slateBElected: []
			}
		};
		saveRun(run);
		window.location.href = '/results';
	}
}

export const formState = new FormState();
