<script lang="ts">
	import { resultsState } from '$lib/stores/resultsStore.svelte';
	import ResultsCard from '$lib/components/ResultsCard/ResultsCard.svelte';
</script>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
	<div class="rounded-box bg-base-100 p-2 lg:col-span-1">
		<div class="list-row flex flex-row justify-between p-2">
			<h2 class="text-sm font-semibold text-slate-800">My runs</h2>
			<div class="flex gap-1">
				<button class="btn btn-soft btn-xs" onclick={() => resultsState.selectAll()}
					>Select all</button
				>
				<button class="btn btn-soft btn-xs" onclick={() => resultsState.clearSelection()}
					>Clear</button
				>
			</div>
		</div>
		<ul class="list-xs list max-h-[50vh] overflow-y-auto" role="list">
			{#if resultsState.runs.length === 0}
				<li class="list-row">
					<p class="text-sm text-slate-500">No runs yet. Create one on the Run page.</p>
				</li>
			{:else}
				{#each resultsState.runs as run}
					<li class="list-row">
						<fieldset class="fieldset p-0">
							<legend class="sr-only fieldset-legend">Toggle {run.name}</legend>
							<label class="label">
								<input
									type="checkbox"
									checked={resultsState.activeRuns.has(run.id)}
									class="toggle text-lg font-bold"
									onclick={() => resultsState.toggleActiveRun(run.id)}
								/>
								{run.name}
							</label>
						</fieldset>
					</li>
				{/each}
			{/if}
		</ul>
	</div>

	<section class="space-y-6 lg:col-span-3">
		<div class="card bg-base-100 p-5 shadow-sm">
			<h2 class="mb-2 text-lg font-semibold text-slate-800">Report</h2>
			{#if resultsState.activeRuns.size === 0}
				<p class="text-sm text-slate-500">Select at least one run to view results.</p>
			{:else}
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					{#each resultsState.activeRuns as runId}
						<ResultsCard {runId} />
					{/each}
				</div>
			{/if}
		</div>

		<div class="card bg-base-100 p-5 text-sm text-slate-600 shadow-sm">
			<p>Recent runs are stored locally in your browser for this mockup.</p>
		</div>
	</section>
</div>
