<script lang="ts">
	import type { Run } from '$lib/stores/types';
	import { resultsState } from '$lib/stores/resultsStore.svelte';

	const { run } = $props<{ run: Run }>();
	let showRealDelete = $state(false);
</script>

<ul
	class="menu dropdown w-auto rounded-box bg-base-100 shadow-sm"
	popover
	id={`popover-${run.id}`}
	style={`position-anchor:--anchor-${run.id}`}
>
	<li>Rename run</li>
	<li>
		<div class="join px-0">
			<div>
				<label class="validator input input-xs join-item p-0">
					<input type="text" required value={run.name} />
				</label>
			</div>
			<button class="btn join-item btn-xs btn-neutral">Rename run</button>
		</div>
	</li>
	<li>Delete run. Warning: this action is irreversible.</li>
	<li>
		<button class="btn btn-xs btn-neutral" onclick={() => (showRealDelete = true)}
			>Delete run</button
		>
	</li>
</ul>

{#if showRealDelete}
	<div class="modal">
		<div class="modal-box">
			<h3>Delete run</h3>
			<p>Are you sure you want to delete this run ({run.name})? This action is irreversible.</p>
			<div class="modal-action">
				<button class="btn btn-xs btn-neutral" onclick={() => (showRealDelete = false)}
					>Cancel</button
				>
				<button class="btn btn-xs btn-neutral" onclick={() => resultsState.removeRun(run.id)}
					>Delete run</button
				>
			</div>
		</div>
	</div>
{/if}
