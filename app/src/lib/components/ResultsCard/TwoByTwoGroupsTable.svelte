<script lang="ts">
	import type { Run } from '$lib/stores/types';
	const { run } = $props<{ run: Run }>();
</script>

<table class="table w-auto table-xs">
	<thead>
		<tr>
			<th>Group</th>
			<th>Voters</th>
			<th>Preferred candidates</th>
		</tr>
	</thead>
	<tbody>
		{#each Object.entries(run.config.voterBlocs) as [blocName, bloc], i}
			{@const typedBloc = bloc as {
				proportion: number;
				cohesion: Record<string, number>;
				preference: Record<string, string>;
			}}
			<tr>
				<td>{blocName}</td>
				<td>{Math.round((run.config.numVoters as number) * typedBloc.proportion)}</td>
				<td>
					{run.config.slates[blocName].numCandidates}
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
		padding: 2px 12px 2px 0px;
		margin: 0 10px 0 0;
	}
</style>
