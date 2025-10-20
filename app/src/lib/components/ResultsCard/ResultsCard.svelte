<script lang="ts">
	import ResultsChart from './ResultsChart.svelte';
	import { resultsState } from '$lib/stores/resultsStore.svelte';
	import ResultCardHeader from './ResultCardHeader.svelte';
	import ResultsTable from './ResultsTable.svelte';
	import ResultCardDetails from './ResultCardDetails.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import { shareUrl } from '$lib/utils/shareUrl';
	import GearIcon from './GearIcon.svelte';
	import { downloadResults } from '$lib/utils/downloadResults';
	import { downloadSvg } from '$lib/utils/downloadSvg';
	import { downloadPng } from '$lib/utils/downloadPng';
	import { downloadJson } from '$lib/utils/downloadJson';

	const { runId } = $props<{ runId: string }>();
	let activeTab = $state('histogram');
	const run = $derived(resultsState.runs.find((r) => r.id === runId));
	let showCopiedUrl = $state(false);
	let hovered = $state(false);

	$effect(() => {
		// If data is incomplete, check the results
		if (run?.createdAt && !run?.error && !run?.result) {
			resultsState.checkStaleRun(runId);
		}
	});
	$effect(() => {
		if (showCopiedUrl) {
			setTimeout(() => (showCopiedUrl = false), 2000);
		}
	});
</script>

<!-- name of each tab group should be unique -->
{#if run}
	<div
		class="relative flex flex-col gap-2"
		onmouseenter={() => (hovered = true)}
		onmouseleave={() => (hovered = false)}
		role="group"
	>
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
			<div
				class="relative tab-content min-h-[360px] border-base-300 bg-base-100 p-6"
				id={`histogram-container-${runId}`}
			>
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
			<div class="tab-content border-base-300 bg-base-100 p-6" id={`table-${runId}`}>
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
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div
			tabindex="0"
			id="dropdown-results-{runId}"
			class={`dropdown absolute top-0 right-0 transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}
		>
			<div role="button" class="btn p-0 btn-ghost btn-md">
				<GearIcon />
			</div>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<ul tabindex="0" class="dropdown-content menu z-1 w-52 rounded-box bg-base-100 p-2 shadow-xl">
				<li>
					<button
						class="btn btn-ghost"
						onclick={() => {
							resultsState.loadSimulationSettings(run.id);
						}}>Load simulation settings</button
					>
				</li>
				{#if showCopiedUrl}
					<li><p class="text-info">Share URL copied to clipboard!</p></li>
				{:else}
					<li>
						<button
							class="btn btn-ghost"
							onclick={(e) => {
								e.preventDefault();
								shareUrl(run.id);
								showCopiedUrl = true;
								// prevent focus from leaving the dropdown
								const dropdown = document.getElementById(`dropdown-results-${runId}`);
								if (dropdown) {
									dropdown.focus();
								}
							}}>Share simulation results</button
						>
					</li>
				{/if}
				<li>
					<button class="btn btn-ghost" onclick={() => downloadResults(run)}
						>Download results (CSV)</button
					>
				</li>
				<li>
					<button
						class="btn btn-ghost"
						onclick={() => {
							activeTab = 'histogram';
							setTimeout(() => {
								const el = document.getElementById(`histogram-container-${runId}`);
								if (el) {
									downloadSvg(el, run.id);
								}
							}, 125);
						}}>Download chart (SVG)</button
					>
				</li>
				<li>
					<button
						class="btn btn-ghost"
						onclick={() => {
							activeTab = 'histogram';
							setTimeout(() => {
								const el = document.getElementById(`histogram-container-${runId}`);
								if (el) {
									downloadPng(el, run.id);
								}
							}, 125);
						}}>Download chart (PNG)</button
					>
				</li>
				<li>
					<button class="btn btn-ghost" onclick={() => downloadJson(run.config, run.id)}
						>Download configuration (JSON)</button
					>
				</li>
				<li>
					<button class="btn btn-ghost" onclick={() => resultsState.removeRun(run.id)}
						>Delete this run</button
					>
				</li>
			</ul>
		</div>
	</div>
{:else}
	<p>No run found</p>
{/if}

<style>
	button {
		text-align: left;
		font-weight: normal;
		align-items: left;
		justify-content: start;
	}
</style>
