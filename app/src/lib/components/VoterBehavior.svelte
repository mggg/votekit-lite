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
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div tabindex="0" role="button" class="btn btn-xs">?</div>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<ul
				tabindex="0"
				class="dropdown-content disabled z-1 w-72 rounded-box bg-gray-100 p-4 text-sm shadow-xl"
			>
				<li class="max-w-none py-2">
					<p>
						The impulsive voter setting uses the <a
							class="inline underline"
							href="https://votekit-dev-docs.readthedocs.io/en/latest/social_choice_docs/scr/#slate-plackett-luce"
							target="_blank"
							rel="noopener noreferrer">Slate Plackett-Luce</a
						> model.
					</p>
				</li>
				<li class="max-w-none py-2">
					<p>
						The deliberative voter setting uses the <a
							class="inline underline"
							href="https://votekit-dev-docs.readthedocs.io/en/latest/social_choice_docs/scr/#slate-bradley-terry"
							target="_blank"
							rel="noopener noreferrer">Slate Bradley-Terry</a
						> model.
					</p>
				</li>
				<li class="max-w-none py-2">
					<p>
						The Cambridge voter uses real voter behavior data from the <a
							class="inline underline"
							target="_blank"
							rel="noopener noreferrer"
							href="https://votekit-dev-docs.readthedocs.io/en/latest/social_choice_docs/scr/#cambridge-sampler"
						>
							Cambridge-Sampler.
						</a>
						This behavior can produce short ballots. Note: This behavior profile must have two slates
						and two blocs, which must be aligned to the same groups. The second bloc will correspond
						to voting behaviors for People of Color in Cambridge, MA.
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
				showOverlay={option.value === 'CS' && !formState.isCambridgeValid}
			/>
		{/each}
	</div>
	{#if !formState.isCambridgeValid}
		<p class="label text-xs text-amber-600">
			To use Cambridge voters, there must be exactly two blocs and two slates.
		</p>
	{/if}
</div>
