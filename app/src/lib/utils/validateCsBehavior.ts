import type { FormState } from '$lib/stores/formStore.svelte';

export const validateCsBehavior = (
	ballotGenerator: FormState['ballotGenerator'],
	slates: FormState['slates'],
	blocs: FormState['blocs'],
	blocCohesion: FormState['blocCohesion']
) => {
	if (ballotGenerator !== 'CS') return [];

	const errors: string[] = [];

	// Check if there are exactly 2 slates and 2 blocs
	if (slates.length !== 2 || blocs.length !== 2) {
		errors.push('Cambridge voter requires exactly 2 slates and 2 voter blocs.');
	}

	// Check if bloc names match slate names
	const slateNames = slates.map((slate) => slate.name).sort();
	const blocNames = blocs.map((bloc) => bloc.name).sort();
	if (JSON.stringify(slateNames) !== JSON.stringify(blocNames)) {
		errors.push(
			'For Cambridge voters, the voter blocs must have the same names as the slates of candidates.'
		);
	}

	// Check cohesion requirements
	if (slates.length === 2 && blocs.length === 2) {
		for (let i = 0; i < 2; i++) {
			const blocName = blocs[i].name;
			const slateIndex = slates.findIndex((slate) => slate.name === blocName);
			if (slateIndex !== -1) {
				const cohesion = blocCohesion[i][slateIndex];
				if (cohesion < 0.5) {
					errors.push(
						`Voter bloc "${blocName}" must have cohesion >= 50% for slate "${blocName}".`
					);
				}
			}
		}
	}

	return errors;
};
