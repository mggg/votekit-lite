<script lang="ts">
	import { formState } from '$lib/stores/formStore.svelte';
	import OptionCard from '$lib/components/OptionCard.svelte';
	import type { VotekitConfig } from '$lib/types/votekitConfig';
	const VOTER_BEHAVIOR_OPTIONS: {
		value: VotekitConfig['ballotGenerator'];
		name: string;
		description: string;
	}[] = [
		{
			value: 'sPL',
			name: 'Impulsive voter',
			description: 'Makes quick picks based on slate preference, with little deliberation.'
		},
		{
			value: 'sBT',
			name: 'Deliberative voter',
			description: 'Adjusts the list if needed to better align with overall slate preference.'
		},
		{
			value: 'CS',
			name: 'Cambridge voter',
			description: 'Follows patterns drawn from historical Cambridge city council ballots.'
		}
	];
</script>

<div class="card bg-base-100 p-4 shadow-sm">
	<h2 class="mb-2 text-lg font-semibold text-slate-800">Voter behavior</h2>
	<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
		{#each VOTER_BEHAVIOR_OPTIONS as option}
			<OptionCard
				title={option.name}
				description={option.description}
				selected={formState.ballotGenerator === option.value}
				onSelect={() => (formState.ballotGenerator = option.value)}
			/>
		{/each}
	</div>
</div>
