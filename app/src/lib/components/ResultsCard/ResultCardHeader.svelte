<script lang="ts">
	import type { Run } from '$lib/stores/types';
	const { run } = $props<{ run: Run }>();
	const numSlates = $derived(Object.keys(run?.config?.slates ?? {}).length);
	const numVoterBlocs = $derived(Object.keys(run?.config?.voterBlocs ?? {}).length);
</script>

{#if run}
	<div class="flex flex-col gap-0">
		<h3 class="text-sm font-bold uppercase">{run?.name}</h3>
		<p class="text-xs text-slate-500">
			{numSlates} slates, {numVoterBlocs} voter blocs, {run?.config.election.numSeats} seats
		</p>
	</div>
{:else}
	<div class="flex flex-col gap-2">
		<p class="text-xs text-slate-500">No run found</p>
	</div>
{/if}
