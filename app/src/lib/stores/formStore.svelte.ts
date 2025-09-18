import { randomRunName } from '$lib';
import type { VoterPreference } from '$lib';

// Re-export types from storage for convenience
export type { VoterPreference, Run } from '$lib';
import type { BallotGenerator, ElectionMode, Slate, VoterBloc } from './types';
import type { VoterBlocMode } from './types';

// Constants
const MAX_CANDIDATES = 12;

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
	blocCounts: number[] = $derived(this.blocs.map((bloc) => Math.round(bloc.population * bloc.turnout)));
	totalVoters: number = $derived(this.blocCounts.reduce((a, b) => a + b, 0));
	blocShares: number[] = $derived(this.blocCounts.map(count => count / this.totalVoters));

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
  ])

	showTurnoutSettings: boolean = false;
	totalCandidates: number = $derived(this.slates.reduce((sum, slate) => sum + slate.numCandidates, 0));
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
      return
    } 
    if (value < this.slates.length) {
      this.slates = this.slates.slice(0, value);
    } else {
      const newSlates = [...this.slates];
      for (let i = this.slates.length; i < value; i++) {
        newSlates.push({ numCandidates: Math.min(3, MAX_CANDIDATES - this.totalCandidates), name: String.fromCharCode(65 + i) });
      }
      this.slates = newSlates;
    }
    this.totalCandidates = this.slates.reduce((sum, slate) => sum + slate.numCandidates, 0);
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

  updateTotalVoters(value: number) {
    const newBlocPopulations = this.blocs.map(bloc => {
      const shareOfVoters = (bloc.population * bloc.turnout) / this.totalVoters;
      const newVotersTotal = shareOfVoters * value;
      const newTotalPopulation = Math.round(newVotersTotal / bloc.turnout);
      return {
        ...bloc,
        population: Math.round(newTotalPopulation)
      }
    })
    this.blocs = newBlocPopulations;
  }

  updateBlocShare(index: number, value: number) {
    const prevRemaining = 1 - this.blocShares[index];
    const newRemaining = 1 - value;
    const newShares = this.blocShares.map((share, i) => {
      if (index === i) {
        return value;
      } else {
        const shareOfRemaining = prevRemaining === 0 
          ? newRemaining / (this.blocs.length - 1)  
          : newRemaining * (share / prevRemaining);
        
        return shareOfRemaining;
      }
    })

    const newBlocPopulations = this.blocs.map((bloc, i) => {
      if (index === i) {
        const newTotalVoters = this.totalVoters * value;
        const newTotalPopulation = Math.round(newTotalVoters / bloc.turnout);
        return {
          ...bloc,
          population: newTotalPopulation
        }
      } else {
        const newTotalVoters = this.totalVoters * newShares[i];
        const newTotalPopulation = Math.round(newTotalVoters / bloc.turnout);
        return {
          ...bloc,
          population: newTotalPopulation
        }
      }
    })
    this.blocs = newBlocPopulations;
  }
}
export const formState = new FormState();

