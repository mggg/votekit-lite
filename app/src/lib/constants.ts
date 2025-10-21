import type { FormState } from '$lib/stores/formStore.svelte';

export const COLOR_MAP = {
	BLOCS: ['#FF4B4B', '#FF8A00', '#FFD400', '#FF2DA8', '#9A5BFF'],
	SLATES: ['#2BB5FF', '#0f2a5c', '#00C2A8', '#37E3A1', '#148731'],
	HEATMAP_BACKGROUND: '#9e9e9e'
};
export const IS_DEV = import.meta.env.MODE === 'development';
export const RUNS_KEY = 'votekit_runs_v1';

export const NAV_CONFIG = [
	{
		label: 'Simulation Settings',
		href: '/run'
	},
	// {
	// 	label: 'Advanced settings',
	// 	href: '/advanced'
	// },
	{
		label: 'Results',
		href: '/results'
	},
	{
		label: 'About',
		href: '/about'
	}
];

export const ELECTION_SYSTEM_MAP: Record<
	FormState['system'],
	{ name: string; description: string; shortName: string }
> = {
	STV: {
		name: 'Single Transferable Vote (STV)',
		description: 'Votes transfer as candidates are elected/eliminated.',
		shortName: 'STV'
	},
	blocPlurality: {
		name: 'Block Plurality',
		description: 'Most votes wins.',
		shortName: 'Block Plurality'
	}
};

export const VOTER_PREFERENCE_MAP = {
	strong: 'Yes',
	all_bets_off: 'Unknown',
	unif: 'No'
};

export const BALLOT_GENERATOR_MAP = {
	sPL: 'Impulsive voter',
	sBT: 'Deliberative voter',
	CS: 'Cambridge voter'
};

export const DEFAULT_SLATE_BLOCS = [
	{
		name: 'Greens',
		color: '#4daf4a'
	},
	{
		name: 'Purples',
		color: '#984ea3'
	},
	{
		name: 'Oranges',
		color: '#ff7f00'
	},
	{
		name: 'Pinks',
		color: '#f781bf'
	},
	{
		name: 'Greys',
		color: '#999999'
	}
];
