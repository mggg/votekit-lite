interface Step {
	title: string;
	description: string;
	id: string;
}

const TOUR_STEPS: Array<Step> = [
	{
		title: 'Election Method',
		description: 'Select the election method you want to use.',
		id: 'election-method'
	},
	{
		title: 'Election Details',
		description: 'Enter the election details.',
		id: 'election-details'
	}
];

class TourState {
	steps: Array<Step> = TOUR_STEPS;
	currentStep: number = $state(0);
	isTouring: boolean = $state(false);
	stepUp() {
		this.currentStep = this.currentStep + 1;
	}
	stepDown() {
		this.currentStep = this.currentStep - 1;
	}
}

export const tourState = new TourState();
