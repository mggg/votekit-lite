<script lang="ts">
	import ResultsChart from './ResultsChart.svelte';
	import { resultsState } from '$lib/stores/resultsStore.svelte';
	import ResultCardHeader from './ResultCardHeader.svelte';
	import ResultsTable from './ResultsTable.svelte';
	import ResultCardDetails from './ResultCardDetails.svelte';
	import Loading from '$lib/components/Loading.svelte';
	const { runId } = $props<{ runId: string }>();
	let activeTab = $state('histogram');
	const run = $derived(resultsState.runs.find((r) => r.id === runId));

	$effect(() => {
		// If data is incomplete, check the results
		if (run?.createdAt && !run?.error && !run?.result) {
			resultsState.checkStaleRun(runId);
		}
	});
</script>

<!-- name of each tab group should be unique -->
{#if run}
	<div class="flex flex-col gap-2">
		<div class="tabs-lift tabs">
			<input
				type="radio"
				name={`my_tabs_3_${runId}`}
				class="tab"
				aria-label="Histogram"
				checked={activeTab === 'histogram'}
				onchange={() => (activeTab = 'histogram')}
				style={`background: ${activeTab === 'histogram' ? 'white' : 'none'}`}
			/>
			<div class="relative tab-content border-base-300 bg-base-100 p-6">
				<ResultCardHeader {run} />
				{#if run.result}
					<ResultsChart {runId} />
				{:else if run.error}
					<p class="text-sm text-amber-500">{run.error}</p>
				{:else}
					<Loading message="Waiting for results..." />
				{/if}
			</div>

			<input
				type="radio"
				name={`my_tabs_3_${runId}`}
				class="tab"
				aria-label="Table"
				checked={activeTab === 'table'}
				onchange={() => (activeTab = 'table')}
				style={`background: ${activeTab === 'table' ? 'white' : 'none'}`}
			/>
			<div class="tab-content border-base-300 bg-base-100 p-6">
				<ResultCardHeader {run} />
				{#if run.result}
					<ResultsTable {run} />
				{:else if run.error}
					<p class="text-sm text-amber-500">{run.error}</p>
				{:else}
					<Loading message="Waiting for results..." />
				{/if}
			</div>

			<input
				type="radio"
				name={`my_tabs_3_${runId}`}
				class="tab"
				aria-label="Full configuration"
				checked={activeTab === 'full_configuration'}
				onchange={() => (activeTab = 'full_configuration')}
				style={`background: ${activeTab === 'full_configuration' ? 'white' : 'none'}`}
			/>
			<div class="tab-content border-base-300 bg-base-100 p-6">
				<ResultCardDetails {run} />
			</div>
		</div>
	</div>
{:else}
	<p>No run found</p>
{/if}
