<script lang="ts">
	import { PUBLIC_TURNSTILE_KEY } from '$env/static/public';
	import { formState } from '$lib/stores/formStore.svelte';
	import { Turnstile } from 'svelte-turnstile';
	import GearIcon from '$lib/components/ResultsCard/GearIcon.svelte';
	import { loadConfigFromFile } from '$lib/utils/loadConfigFromFile';
	const errorList = $derived(
		[
			formState.unallocatedPopulation > 0
				? 'Your voter bloc population shares do not add up to 100%.'
				: null,
			formState.name.length === 0 ? 'Please provide a name for your simulation run.' : null,
			formState.blocCohesionSum.some((cohesionSum) => cohesionSum !== 1)
				? 'Your voter bloc cohesion settings do not add up to 100% for all blocs.'
				: null,
			formState.turnstileToken.length === 0 ? 'Please verify you are not a robot.' : null,
			...formState.cambridgeValidationErrors
		].filter(Boolean)
	);
</script>

<div class="card relative w-full max-w-none bg-base-100 p-4 shadow-sm">
	<h2 class="mb-2 text-lg font-semibold text-slate-800">Run details</h2>
	<label class="input input-sm w-full">
		<span class="text-gray-400">Run name</span>
		<input
			class="w-full grow text-sm"
			bind:value={formState.name}
			placeholder="Name your simulation run"
		/>
	</label>
	<label class="input input-sm my-2 w-full">
		<span class="text-gray-400">Number of trials</span>
		<input type="number" min="1" class="grow text-sm" bind:value={formState.trials} />
	</label>
	{#if errorList.length > 0}
		<div class="py-2">
			<p class="text-xs text-slate-500">
				Please fix the following errors before running the simulation:
			</p>
			<ul class="list-inside list-disc">
				{#each errorList as error}
					<li class="text-xs text-red-500">{error}</li>
				{/each}
			</ul>
		</div>
	{/if}
	<Turnstile
		siteKey={PUBLIC_TURNSTILE_KEY}
		on:callback={(e) => e.detail.token && (formState.turnstileToken = e.detail.token)}
	/>
	<button
		class="btn mt-2 btn-block btn-soft btn-primary"
		onclick={() => formState.submitRun()}
		disabled={!formState.turnstileToken.length ||
			formState.unallocatedPopulation > 0 ||
			formState.isLoading ||
			formState.cambridgeValidationErrors.length > 0 ||
			formState.name.length === 0}
	>
		Run simulation
	</button>
	<div class="absolute top-0 right-0">
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div class="dropdown dropdown-top" tabindex="0">
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div class="btn opacity-20 btn-ghost btn-md" tabindex="0">
				<GearIcon />
			</div>
			<ul class="dropdown-content menu z-1 w-52 rounded-box bg-base-100 p-2 shadow-sm">
				<li>
					<button onclick={() => document.getElementById('fileUpload')?.click()}
						>Load configuration JSON file</button
					>
					<input
						type="file"
						accept="application/json"
						id="fileUpload"
						class="hidden"
						onchange={(e: any) => {
							e.preventDefault();
							if (e.target?.files?.[0]) {
								loadConfigFromFile(e.target.files?.[0]);
								// clear the file input
								e.target.value = '';
							}
						}}
					/>
				</li>
			</ul>
		</div>
	</div>
</div>
