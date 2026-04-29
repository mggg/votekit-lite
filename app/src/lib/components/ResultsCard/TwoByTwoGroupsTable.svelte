<script lang="ts">
	import type { Run } from '$lib/stores/types';
	const { run } = $props<{ run: Run }>();

	const getPreferredSlateName = (cohesion: Record<string, number>) =>
		Object.entries(cohesion).reduce<string | null>(
			(currentBest, [slateName, score]) =>
				currentBest === null || score > cohesion[currentBest] ? slateName : currentBest,
			null
		);
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
				preference: Record<string, number>;
			}}
			{@const preferredSlateName = getPreferredSlateName(typedBloc.cohesion)}
			{@const preferredSlate = preferredSlateName ? run.config.slates[preferredSlateName] : undefined}
			<tr>
				<td>{blocName}</td>
				<td>{Math.round((run.config.numVoters as number) * typedBloc.proportion)}</td>
				<td>
					{preferredSlate?.numCandidates ?? '—'}
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
