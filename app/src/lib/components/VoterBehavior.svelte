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
	<div class="flex flex-row gap-2">
		<h2 class="mb-2 text-lg font-semibold text-slate-800">Voter behavior</h2>
		<div class="dropdown dropdown-top">
			<div tabindex="0" role="button" class="btn btn-xs">?</div>
			<ul
				tabindex="0"
				class="dropdown-content disabled menu z-1 w-72 rounded-box bg-gray-100 p-2 shadow-xl"
			>
				<li class="disabled pointer-events-none max-w-none">
					<p>Impulsive voter (Slate Plackett-Luce): More detailed explanation here.</p>
				</li>
				<li class="disabled pointer-events-none max-w-none">
					<p>Deliberative voter (Slate Plackett-Luce): More detailed explanation here.</p>
				</li>
				<li class="disabled pointer-events-none max-w-none">
					<p>
						Cambridge voter (Cambridge Sampler): More detailed explanation here. This behavior can
						produce short ballots. Note: This behavior profile must have two slates and two blocs,
						which must be aligned to the same groups. The second bloc will correspond to voting
						behaviors for People of Color in Cambridge, MA.
					</p>
				</li>
			</ul>
		</div>
	</div>
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
