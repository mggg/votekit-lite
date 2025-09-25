<script lang="ts">
	import { resultsState } from '$lib/stores/resultsStore.svelte';
	import ResultsChart from '$lib/components/ResultsChart.svelte';
</script>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
	<aside class="card bg-base-100 p-4 shadow-sm lg:col-span-1">
		<div class="mb-3 flex items-center justify-between">
			<h2 class="text-sm font-semibold text-slate-800">My runs</h2>
			<div class="flex gap-1">
				<!-- <button class="btn btn-xs btn-soft" on:click={selectAll}>Select all</button>
        <button class="btn btn-xs btn-soft" on:click={clearSelection}>Clear</button> -->
			</div>
		</div>
		<div class="space-y-1">
			{#if resultsState.runs.length === 0}
				<p class="text-sm text-slate-500">No runs yet. Create one on the Run page.</p>
			{:else}
				{#each resultsState.runs as run}
					<button
						class="btn relative w-full justify-start btn-soft {resultsState.activeRuns.has(run.id)
							? 'btn-primary'
							: 'btn-secondary'}"
						on:click={() => resultsState.toggleActiveRun(run.id)}
					>
						<div class="truncate">
							<div class="pb-2 text-sm">{run.name}</div>
							<div class="text-xs text-slate-500">{new Date(+run.createdAt).toLocaleString()}</div>
						</div>
					</button>
				{/each}
			{/if}
		</div>
	</aside>

	<section class="space-y-6 lg:col-span-3">
		<div class="card bg-base-100 p-5 shadow-sm">
			<h2 class="mb-2 text-lg font-semibold text-slate-800">Report</h2>
			{#if resultsState.activeRuns.size === 0}
				<p class="text-sm text-slate-500">Select at least one run to view results.</p>
			{:else}
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
					{#each resultsState.activeRuns as runId}
						<ResultsChart {runId} />
					{/each}
				</div>
			{/if}
		</div>

		<div class="card bg-base-100 p-5 text-sm text-slate-600 shadow-sm">
			<p>Recent runs are stored locally in your browser for this mockup.</p>
		</div>
	</section>
</div>
