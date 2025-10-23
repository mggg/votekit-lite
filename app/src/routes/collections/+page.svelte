<script lang="ts">
	import { onMount } from 'svelte';
	import { resultsState } from '$lib/stores/resultsStore.svelte';
	import ResultsCard from '$lib/components/ResultsCard/ResultsCard.svelte';
	import PencilIcon from '$lib/components/ResultsCard/PencilIcon.svelte';
	import { rename } from 'fs';
	let newCollectionName = $state('');
	let showNewCollectionInput = $state(false);
	let shareCollectionName = $state<string | null>(null);
	let shareUrl = $state('');
	let showCopiedUrl = $state(false);
	let activeCollection = $state<null | string>(null);
	let showEditCollectionName = $state(false);
	let renameCollectionName = $state('');
	let inputRef = $state<HTMLInputElement | null>(null);

	$effect(() => {
		if (activeCollection) {
			renameCollectionName = activeCollection;
		}
	});

	$effect(() => {
		if (showEditCollectionName && inputRef) {
			inputRef.focus();
		}
	});

	// Handle query params on mount
	onMount(() => {
		const url = new URL(window.location.href);
		const collectionParam = url.searchParams.get('collection');
		const idsParam = url.searchParams.get('ids');
		const cleanIds: string[] = [];
		showEditCollectionName = false;
		activeCollection = collectionParam;
		if (collectionParam && idsParam) {
			const ids = idsParam.split(',').filter((id) => id.trim());
			// Load all the runs from the collection
			ids.forEach((id) => {
				cleanIds.push(id.trim());
				resultsState.checkRunResults(id).then((r) => {
					const ok = r.data.status === 'success';
					if (ok && !resultsState.activeRunsList.includes(id)) {
						resultsState.toggleActiveRun(id);
					}
				});
			});
			resultsState.createCollection(collectionParam, cleanIds);
			// Clear the query params
			url.searchParams.delete('collection');
			url.searchParams.delete('ids');
			window.history.replaceState({}, '', url.toString());
		}
	});

	function createNewCollection() {
		if (!newCollectionName.trim()) return;
		const success = resultsState.createCollection(newCollectionName.trim());
		if (success) {
			newCollectionName = '';
			showNewCollectionInput = false;
		}
	}

	function deleteCollection(name: string) {
		resultsState.deleteCollection(name);
	}

	function shareCollection(name: string) {
		const url = resultsState.getCollectionUrl(name);
		navigator.clipboard.writeText(url);
		shareCollectionName = name;
		shareUrl = url;
		showCopiedUrl = true;
		setTimeout(() => {
			showCopiedUrl = false;
			shareCollectionName = null;
		}, 2000);
	}

	function loadCollection(name: string) {
		activeCollection = name;
		const runIds = resultsState.collections[name];
		if (!runIds) return;
		// Clear current selection
		resultsState.clearSelection();
		// Load all runs from collection
		runIds.forEach((runId) => {
			const run = resultsState.runs.find((r) => r.id === runId);
			if (run) {
				resultsState.toggleActiveRun(runId);
			} else {
				// Try to fetch the run if it's not in local storage
				resultsState.checkRunResults(runId).then((r) => {
					const ok = r.data.status === 'success';
					if (ok) {
						resultsState.toggleActiveRun(runId);
					}
				});
			}
		});
	}
	function handleSave(collectionName: string, name: string) {
		resultsState.renameCollection(collectionName, name);
		showEditCollectionName = false;
		activeCollection = name;
	}

	const collectionEntries = $derived(Object.entries(resultsState.collections));
</script>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-4" style="min-height: calc(100vh - 200px)">
	<div class="rounded-box bg-base-100 p-2 lg:col-span-1">
		<div class="list-row flex flex-row justify-between p-2">
			<h2 class="text-sm font-semibold text-slate-800">My Collections</h2>
			<button
				class="btn btn-soft btn-xs"
				onclick={() => (showNewCollectionInput = !showNewCollectionInput)}
			>
				{showNewCollectionInput ? 'Cancel' : 'New'}
			</button>
		</div>

		{#if showNewCollectionInput}
			<div class="p-2">
				<input
					type="text"
					bind:value={newCollectionName}
					placeholder="Collection name"
					class="input input-sm w-full"
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							createNewCollection();
						}
					}}
				/>
				<button class="btn mt-2 w-full btn-xs btn-primary" onclick={createNewCollection}>
					Create
				</button>
			</div>
		{/if}

		<ul class="list-xs list h-full max-h-[70vh] overflow-x-visible overflow-y-auto" role="list">
			{#if collectionEntries.length === 0}
				<li class="list-row">
					<p class="text-sm text-slate-500">No collections yet.</p>
				</li>
			{:else}
				{#each collectionEntries as [name, runIds]}
					<li class="list-row flex w-full">
						<div class="flex w-full flex-col gap-2">
							<div class="flex w-full flex-row items-center justify-between">
								<button
									class="flex-grow text-left font-semibold hover:text-blue-600"
									onclick={() => loadCollection(name)}
								>
									{name}
								</button>
								<div class="flex gap-1">
									<button
										class="btn text-slate-400 btn-ghost btn-xs"
										onclick={() => shareCollection(name)}
										title="Share collection"
										aria-label="Share collection"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-4 w-4"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
											/>
										</svg>
									</button>
									<div class="dropdown dropdown-left flex-none">
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
														deleteCollection(name);
													}}>Delete collection</button
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
							</div>
							<p class="text-xs text-slate-500">{runIds.length} run(s)</p>
							{#if showCopiedUrl && shareCollectionName === name}
								<p class="text-xs text-info">URL copied to clipboard!</p>
							{/if}
						</div>
					</li>
				{/each}
			{/if}
		</ul>
	</div>
	<section class="space-y-6 lg:col-span-3">
		<div class="card bg-base-100 p-5 shadow-sm">
			{#if activeCollection}
				{#if showEditCollectionName}
					<div class="flex flex-row items-center gap-2">
						<input
							type="text"
							bind:value={renameCollectionName}
							class="input input-sm mt-[-1px] ml-[-1px] w-full p-0 text-sm font-bold"
							bind:this={inputRef}
						/>
						<button
							class="btn btn-ghost btn-sm"
							onclick={() => {
								handleSave(activeCollection!, renameCollectionName);
							}}
						>
							Save
						</button>
					</div>
				{:else}
					<div class="flex flex-row gap-2">
						<h2 class="mb-2 text-lg font-semibold text-slate-800">{activeCollection}</h2>
						<button
							class="btn btn-ghost btn-xs"
							onclick={() => (showEditCollectionName = !showEditCollectionName)}
						>
							<PencilIcon />
						</button>
					</div>
				{/if}
			{:else}
				<h2 class="mb-2 text-lg font-semibold text-slate-800">Collection View</h2>
			{/if}
			{#if activeCollection}
				<p class="text-sm text-slate-500">
					Add results to this collection from the Results page by clicking the gear icon in the top
					right of the result cards.
				</p>
			{:else if resultsState.activeRunsList.length === 0}
				<p class="text-sm text-slate-500">Select a collection to view its results.</p>
			{:else}
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					{#each resultsState.activeRunsList as runId (runId)}
						<ResultsCard {runId} />
					{/each}
				</div>
			{/if}
		</div>

		<div class="card bg-base-100 p-5 text-sm text-slate-600 shadow-sm">
			<p>Collections allow you to organize and share groups of simulation results.</p>
			<p class="mt-2">
				Create a collection, add runs to it from the Results page, and share the collection URL with
				others.
			</p>
		</div>
	</section>
</div>
