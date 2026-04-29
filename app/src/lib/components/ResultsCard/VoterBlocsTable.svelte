<script lang="ts">
	import { VOTER_PREFERENCE_MAP } from '$lib/constants';
	import type { FormState } from '$lib/stores/formStore.svelte';
	import type { Run } from '$lib/stores/types';
	import { percentFormatter } from '$lib/utils/format';

	const { run } = $props<{ run: Run }>();
</script>

<table class="table w-full table-xs">
	<thead>
		<tr>
			<th>Name</th>
			<th>Voters</th>
			<th>Cohesion</th>
			<th>Strong Candidate</th>
		</tr>
	</thead>
	<tbody>
		{#each Object.entries(run.config.voterBlocs) as [blocName, bloc]}
			{@const typedBloc = bloc as {
				proportion: number;
				cohesion: Record<string, number>;
				preference: Record<string, number>;
			}}
			<tr>
				<td>{blocName}</td>
				<td>{Math.round((run.config.numVoters as number) * typedBloc.proportion)}</td>
				<td>
					{#each Object.entries(typedBloc.cohesion) as [slate, coh]}
						<p>{slate}: {percentFormatter.format(coh)}</p>
					{/each}
				</td>
				<td>
					{#each Object.entries(typedBloc.preference) as [slate, pref]}
						<p>
							{slate}:
							{#if pref < 1}
								Yes (α = {pref})
							{:else if pref > 1}
								No (α = {pref})
							{:else}
								Unknown (α = 1)
							{/if}
						</p>
					{/each}
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	table,
	tr,
	td,
	th {
		padding: 2px 2px 2px 0px;
		margin: 0;
	}
</style>
