<script lang="ts">
	import { BALLOT_GENERATOR_MAP } from '$lib/constants';
	import type { FormState } from '$lib/stores/formStore.svelte';
	import type { Run } from '$lib/stores/types';

	const { run } = $props<{ run: Run }>();
</script>

<table class="table w-auto table-xs">
	<tbody>
		<tr>
			<td class="font-semibold">Name</td>
			<td>{run.name}</td>
		</tr>
		{#if run.createdAt}
			<tr>
				<td class="font-semibold">Created</td>
				<td>{new Date(+run.createdAt).toLocaleString()}</td>
			</tr>
		{/if}
		<tr>
			<td class="font-semibold">Trials</td>
			<td>{run.config.trials}</td>
		</tr>
		<tr>
			<td class="font-semibold">Voter Profile</td>
			<td>
				{BALLOT_GENERATOR_MAP[run.config.ballotGenerator as keyof typeof BALLOT_GENERATOR_MAP] ??
					'Unknown'}
			</td>
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
