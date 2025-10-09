<script lang="ts">
	import { ELECTION_SYSTEM_MAP } from '$lib/constants';
	import type { FormState } from '$lib/stores/formStore.svelte';
	import type { Run } from '$lib/stores/types';

	const { run } = $props<{ run: Run }>();
</script>

<table class="table w-auto table-xs">
	<tbody>
		<tr>
			<td class="font-semibold">System</td>
			<td>
				{ELECTION_SYSTEM_MAP[run.config.election.system as FormState['system']]?.name ?? 'Unknown'}
			</td>
		</tr>
		<tr>
			<td class="font-semibold">Seats</td>
			<td>{run.config.election.numSeats}</td>
		</tr>
		<tr>
			<td class="font-semibold">Max Ballot Length</td>
			<td>{run.config.election.maxBallotLength}</td>
		</tr>
	</tbody>
</table>

<style>
	table,
	tr,
	td {
		padding: 2px 2px 2px 0px;
		margin: 0;
	}
</style>
