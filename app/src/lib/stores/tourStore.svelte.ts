interface Step {
	title: string;
	description: string;
	id: string;
	position?: 'top' | 'bottom' | 'left' | 'right';
	sticky?: boolean;
}

const TOUR_STEPS: Array<Step> = [
	{
		title: 'Election Method',
		description: 'Select the election method you want to use.',
		id: 'election-method'
	},
	{
		title: 'Election Details',
		description:
			'Enter the election details. This is where you decide how many groups of candidates\
		there are, how many seats are up for election, and how many candidates can be ranked on a ballot.',
		id: 'election-details'
	},
	{
		title: 'Voter Blocs',
		description: 'Enter information about different groups of voters, called blocs.',
		id: 'voter-blocs-basic-settings'
	},
	{
		title: 'Candidate Strength',
		description: 'Decide how the blocs feel about individual candidates.',
		id: 'voter-blocs-candidate-strength'
	},
	{
		title: 'Voter Cohesion',
		description: 'Decide how the blocs feel about individual slates.',
		id: 'voter-blocs-cohesion'
	},
	{
		title: 'Voter Behavior',
		description: 'Decide how the blocs behave when ranking.',
		id: 'voter-behavior',
		position: 'top'
	},
	{
		title: 'Run Details',
		description: 'Enter a name for the run and the number of elections to simulate.',
		id: 'run-details',
		sticky: true
	},
	{
		title: 'Preview',
		description: 'See a preview of the parameters you have entered.',
		id: 'preview',
		sticky: true,
		position: 'top'
	},
	{
		title: 'Run Simulation',
		description: 'Click to run the simulation.',
		id: 'run-simulation-button',
		sticky: true
	}
];

class TourState {
	steps: Array<Step> = TOUR_STEPS;
	currentStep: number = $state(0);
	isTouring: boolean = $state(false);
	lastStep: boolean = $derived(this.currentStep === this.steps.length - 1);
	stepUp() {
		this.currentStep = this.currentStep + 1;
	}
	stepDown() {
		this.currentStep = this.currentStep - 1;
	}
}

export const tourState = new TourState();
