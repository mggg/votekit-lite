<script lang="ts">
	import type { Run } from '$lib/stores/types';

	const { run } = $props<{ run: Run }>();
</script>

<table class="table w-auto table-xs">
	<thead>
		<tr>
			<th>Name</th>
			<th>Num. Candidates</th>
		</tr>
	</thead>
	<tbody>
		{#each Object.entries(run.config.slates) as [slateName, slate]}
			<tr>
				<td>{slateName}</td>
				<td>{(slate as { numCandidates: number }).numCandidates}</td>
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
