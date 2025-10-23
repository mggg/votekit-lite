<script lang="ts">
	import { VOTER_PREFERENCE_MAP } from '$lib/constants';
	import type { FormState } from '$lib/stores/formStore.svelte';
	import type { Run } from '$lib/stores/types';
	import { percentFormatter } from '$lib/utils/format';
	import { BALLOT_GENERATOR_MAP } from '$lib/constants';
	const { run } = $props<{ run: Run }>();
</script>

<table class="table mb-8 w-auto table-xs">
	<tbody>
		<tr>
			<td class="font-semibold">Voter profile:</td>
			<td
				>{BALLOT_GENERATOR_MAP[run.config.ballotGenerator as FormState['ballotGenerator']] ??
					'Unknown'}</td
			>
		</tr>
	</tbody>
</table>
<table class="table mt-4 w-full table-xs">
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
				preference: Record<string, string>;
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
							{slate}: {VOTER_PREFERENCE_MAP[pref as keyof typeof VOTER_PREFERENCE_MAP] ??
								'Unknown'}
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
