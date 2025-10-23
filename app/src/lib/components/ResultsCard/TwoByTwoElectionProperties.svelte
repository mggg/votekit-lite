<script lang="ts">
	import type { FormState } from '$lib/stores/formStore.svelte';
	import type { Run } from '$lib/stores/types';
	import { ELECTION_SYSTEM_MAP } from '$lib/constants';
	const { run } = $props<{ run: Run }>();
</script>

<table class="table w-full table-xs">
	<tbody>
		<tr>
			<td class="font-semibold">Election method</td>
			<td
				>{ELECTION_SYSTEM_MAP[run.config.election.system as FormState['system']]?.name ??
					'Unknown'}</td
			>
		</tr>
		<tr>
			<td class="font-semibold">Number of seats</td>
			<td>{run.config.election.numSeats}</td>
		</tr>
		<tr>
			<td class="font-semibold">Max ballot length</td>
			<td>{run.config.election.maxBallotLength}</td>
		</tr>
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
