<script lang="ts">
	import { ELECTION_SYSTEM_MAP } from '$lib/constants';
	import type { FormState } from '$lib/stores/formStore.svelte';
	import { resultsState } from '$lib/stores/resultsStore.svelte';
	import type { Run } from '$lib/stores/types';
	import PencilIcon from './PencilIcon.svelte';
	const { run } = $props<{ run: Run }>();
	const numSlates = $derived(Object.keys(run?.config?.slates ?? {}).length);
	const numVoterBlocs = $derived(Object.keys(run?.config?.voterBlocs ?? {}).length);
	let editing = $state(false);
	let inputRef = $state<HTMLInputElement | null>(null);
	let runName = $state(run?.name);

	$effect(() => {
		if (editing && inputRef) {
			inputRef.focus();
		}
	});

	const handleSave = () => {
		resultsState.renameRun(run.id, runName);
		editing = false;
	};
</script>

{#if run}
	<div class="flex flex-col gap-0">
		{#if editing}
			<div class="flex flex-row items-center gap-2">
				<input
					type="text"
					bind:value={runName}
					class="input input-sm mt-[-1px] ml-[-1px] w-full p-0 text-sm font-bold"
					bind:this={inputRef}
				/>
				<button class="btn btn-ghost btn-sm" onclick={handleSave}> Save </button>
			</div>
		{:else}
			<div class="flex flex-row items-center gap-2">
				<h3 class="text-sm font-bold">{run?.name}</h3>
				<button
					class="appear-hover btn btn-ghost btn-xs"
					onclick={() => (editing = true)}
					aria-label="Edit run name"
				>
					<PencilIcon />
				</button>
			</div>
		{/if}
		<p class="text-xs text-slate-500">
			{numSlates} slates, {numVoterBlocs} voter blocs, {ELECTION_SYSTEM_MAP[
				run?.config.election.system as FormState['system']
			]?.shortName ?? 'Unknown'} with {run?.config.election.numSeats} seats
		</p>
	</div>
{:else}
	<div class="flex flex-col gap-2">
		<p class="text-xs text-slate-500">No run found</p>
	</div>
{/if}
