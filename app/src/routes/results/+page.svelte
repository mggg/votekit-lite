<script lang="ts">
	import { onMount } from 'svelte';
	import { resultsState } from '$lib/stores/resultsStore.svelte';
	import ResultsCard from '$lib/components/ResultsCard/ResultsCard.svelte';

	let showCreateCollectionDialog = $state(false);
	let newCollectionName = $state('');

	onMount(() => {
		const url = new URL(window.location.href);
		const resultShare = url.searchParams.get('result-share');
		if (resultShare) {
			resultsState.checkRunResults(resultShare).then((r) => {
				const ok = r.data.status === 'success';
				if (ok) {
					resultsState.toggleActiveRun(resultShare);
				}
				url.searchParams.delete('result-share');
				window.history.replaceState({}, '', url.toString());
			});
		}
	});

	function createCollectionFromSelected() {
		if (!newCollectionName.trim() || resultsState.activeRunsList.length === 0) return;
		const success = resultsState.createCollection(
			newCollectionName.trim(),
			resultsState.activeRunsList
		);
		if (success) {
			newCollectionName = '';
			showCreateCollectionDialog = false;
		}
	}
</script>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-4" style="min-height: calc(100vh - 200px)">
	<div class="rounded-box bg-base-100 p-2 lg:col-span-1">
		<div class="list-row flex flex-col gap-2 p-2">
			<div class="flex flex-row justify-between">
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
			{#if resultsState.activeRunsList.length > 0}
				<button
					class="btn w-full btn-xs btn-primary {showCreateCollectionDialog
						? 'text-left text-black btn-ghost'
						: 'text-white'}"
					disabled={showCreateCollectionDialog}
					onclick={() => (showCreateCollectionDialog = !showCreateCollectionDialog)}
				>
					{showCreateCollectionDialog ? 'Create collection:' : 'Create collection from selected'}
				</button>
				{#if showCreateCollectionDialog}
					<div class="flex flex-col gap-2">
						<input
							type="text"
							bind:value={newCollectionName}
							placeholder="Collection name"
							class="input input-sm w-full"
							onkeydown={(e) => {
								if (e.key === 'Enter') {
									createCollectionFromSelected();
								}
							}}
						/>
						<div class="flex flex-row justify-between gap-2">
							<button
								class="btn text-white btn-xs btn-primary"
								onclick={createCollectionFromSelected}
								disabled={!newCollectionName.trim()}
							>
								Create ({resultsState.activeRunsList.length} run{resultsState.activeRunsList
									.length === 1
									? ''
									: 's'})
							</button>
							<button
								class="btn text-white btn-xs btn-neutral"
								onclick={() => (showCreateCollectionDialog = false)}
							>
								Cancel
							</button>
						</div>
					</div>
				{/if}
			{/if}
		</div>
		<ul class="list-xs list h-full max-h-[50vh] overflow-x-visible overflow-y-auto" role="list">
			{#if resultsState.runs.length === 0}
				<li class="list-row">
					<p class="text-sm text-slate-500">No runs yet. Create one on the Run page.</p>
				</li>
			{:else}
				{#each resultsState.runs as run}
					<li class="list-row flex w-full">
						<div class="flex w-full flex-row items-center justify-between gap-2">
							<fieldset class="fieldset flex-grow p-0">
								<legend class="sr-only fieldset-legend">Toggle {run.name}</legend>
								<label class="label">
									<input
										type="checkbox"
										checked={resultsState.activeRunsSet.has(run.id)}
										class="toggle text-lg font-bold"
										onclick={() => resultsState.toggleActiveRun(run.id)}
									/>
									{run.name}
								</label>
							</fieldset>

							<div class="dropdown dropdown-left flex-none" id={`dropdown-${run.id}`}>
								<div tabindex="0" role="button" class="btn m-1 text-red-400 btn-ghost btn-xs">
									&times;
								</div>
								<ul
									tabindex="-1"
									class="dropdown-content menu z-1 w-full min-w-32 rounded-box bg-base-100 p-2 shadow-sm"
								>
									<li class="text-red-500">Are you sure? This cannot be undone.</li>
									<li>
										<button
											class="btn my-2 text-white btn-xs btn-error"
											onclick={() => {
												(document.activeElement as HTMLElement).blur();
												resultsState.removeRun(run.id);
											}}>Delete run</button
										>
									</li>
									<li>
										<button
											class="btn btn-xs btn-neutral"
											onclick={() => {
												// unfocus the dropdown
												(document.activeElement as HTMLElement).blur();
											}}>Cancel</button
										>
									</li>
								</ul>
							</div>
						</div>
					</li>
				{/each}
			{/if}
		</ul>
	</div>

	<section class="space-y-6 lg:col-span-3">
		<div class="card bg-base-100 p-5 shadow-sm">
			<h2 class="mb-2 text-lg font-semibold text-slate-800">Report</h2>
			{#if resultsState.activeRunsList.length === 0}
				<p class="text-sm text-slate-500">Select at least one run to view results.</p>
			{:else}
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					{#each resultsState.activeRunsList as runId (runId)}
						<ResultsCard {runId} />
					{/each}
				</div>
			{/if}
		</div>

		<div class="card bg-base-100 p-5 text-sm text-slate-600 shadow-sm">
			<p>Recent runs are stored locally in your browser.</p>
		</div>
	</section>
</div>
