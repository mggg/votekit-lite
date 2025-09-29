<script lang="ts">
	const { runId } = $props<{ runId: string }>();
	import ResultsChart from './ResultsChart.svelte';
	import { resultsState } from '$lib/stores/resultsStore.svelte';
	import ResultCardHeader from './ResultCardHeader.svelte';
	import ResultsTable from './ResultsTable.svelte';
	import ResultCardDetails from './ResultCardDetails.svelte';
	let activeTab = $state('histogram');
	const run = $derived(resultsState.runs.find((r) => r.id === runId));
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
				<ResultsChart {runId} />
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
				<ResultsTable {run} />
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
