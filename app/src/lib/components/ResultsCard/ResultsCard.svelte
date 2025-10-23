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
	import { TIMEOUT_IN_S } from '$lib/constants';
	import ChevronIcon from './ChevronIcon.svelte';

	const { runId } = $props<{ runId: string }>();
	let activeTab = $state('histogram');
	const run = $derived(resultsState.runs.find((r) => r.id === runId));
	const timeoutDate = $derived(
		run?.createdAt ? new Date(+run.createdAt + TIMEOUT_IN_S * 1000) : null
	);
	let showCopiedUrl = $state(false);
	let hovered = $state(false);
	let showCollectionMenu = $state(false);
	let downloading = $state(false);
	const collectionsArray = $derived(Object.keys(resultsState.collections));

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
		class="relative flex flex-col gap-2 {hovered ? 'result-card-hovered' : ''} {downloading
			? 'result-card-downloading'
			: ''}"
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
				class="relative tab-content border-base-300 bg-base-100 p-6"
				id={`histogram-container-${runId}`}
			>
				<ResultCardHeader {run} />
				{#if run.result}
					<ResultsChart {runId} />
				{:else if run.error}
					<p class="text-sm text-amber-500">{run.error}</p>
				{:else}
					<Loading message="Waiting for results..." />
					{#if timeoutDate}
						<p class="py-2 text-xs text-gray-500">
							This run will complete or time out by {timeoutDate?.toLocaleString()}
						</p>
					{/if}
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
			class="appear-hover dropdown absolute dropdown-left top-0 right-0 transition-opacity duration-300"
		>
			<div role="button" class="btn p-0 btn-ghost btn-md">
				<GearIcon />
			</div>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<ul
				tabindex="0"
				class="dropdown-content menu z-1 w-52 rounded-box border border-base-300 bg-base-100 p-2 shadow-xl"
			>
				<li>
					<button
						class="btn btn-ghost"
						disabled={!run.config}
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
					<button class="btn btn-ghost" onclick={() => downloadResults(run)} disabled={!run.result}
						>Download results (CSV)</button
					>
				</li>
				<li>
					<button
						class="btn btn-ghost"
						disabled={!run.result}
						onclick={() => {
							downloading = true;
							activeTab = 'histogram';
							setTimeout(() => {
								const el = document.getElementById(`histogram-container-${runId}`);
								if (el) {
									downloadSvg(el, run.id);
									downloading = false;
								}
							}, 125);
						}}>Download image (SVG)</button
					>
				</li>
				<li>
					<button
						class="btn btn-ghost"
						disabled={!run.result}
						onclick={() => {
							activeTab = 'histogram';
							downloading = true;
							setTimeout(() => {
								const el = document.getElementById(`histogram-container-${runId}`);
								if (el) {
									downloadPng(el, run.id);
								}
							}, 125);
							setTimeout(() => {
								downloading = false;
							}, 250);
						}}>Download image (PNG)</button
					>
				</li>
				<li>
					<button
						class="btn btn-ghost"
						onclick={() => downloadJson(run.config, run.id)}
						disabled={!run.result}>Download configuration (JSON)</button
					>
				</li>
				<li>
					<button
						class="btn flex justify-between btn-ghost"
						onclick={() => (showCollectionMenu = !showCollectionMenu)}
					>
						<span>Add to collection</span>
						<span
							class="ml-2 size-4 transition-transform duration-300 {showCollectionMenu
								? ''
								: 'rotate-180'}"
						>
							<ChevronIcon />
						</span>
					</button>
				</li>
				{#if showCollectionMenu}
					{#if collectionsArray.length === 0}
						<li class="ml-4 text-xs text-slate-500">
							<p>No collections yet</p>
						</li>
					{:else}
						{#each collectionsArray as collectionName}
							{@const isInCollection = resultsState.collections[collectionName]?.includes(runId)}
							<li class="ml-4">
								<button
									class="btn btn-ghost btn-xs"
									onclick={() => {
										if (isInCollection) {
											resultsState.removeFromCollection(collectionName, runId);
										} else {
											resultsState.addToCollection(collectionName, runId);
										}
									}}
								>
									<span class="mr-2">{isInCollection ? '✓' : '○'}</span>
									{collectionName}
								</button>
							</li>
						{/each}
					{/if}
				{/if}
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
