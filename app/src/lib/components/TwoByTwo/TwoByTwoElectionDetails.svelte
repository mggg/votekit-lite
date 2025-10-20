<script lang="ts">
	import { formState, type FormState } from '$lib/stores/formStore.svelte';
	import OptionCard from '$lib/components/OptionCard.svelte';
	import { ELECTION_SYSTEM_MAP } from '$lib/constants';
</script>

<div class="card bg-base-100 p-4 shadow-sm">
	<h2 class="mb-2 text-lg font-semibold text-slate-800">Election properties</h2>
	<p class="mb-4 text-sm text-slate-500">
		Choose the election system, number of seats, and maximum ballot length.
	</p>

	<div class="mb-4">
		<h3 class="mb-2 text-sm font-medium text-slate-700">Election method</h3>
		<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
			{#each Object.entries(ELECTION_SYSTEM_MAP) as [system, systemData]}
				<OptionCard
					title={systemData.name}
					description={systemData.description}
					selected={formState.system === system}
					onSelect={() => (formState.system = system as FormState['system'])}
				/>
			{/each}
		</div>
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<fieldset class="col-span-1 fieldset w-full">
			<legend class="fieldset-legend">Number of seats</legend>
			<input
				type="number"
				class="input input-sm w-full"
				placeholder="Type here"
				bind:value={formState.numSeats}
				min={formState.seatsMin}
				max={formState.seatsMax}
			/>
			<p class="label flex-col items-start whitespace-pre-wrap">
				<span
					>Seats must be between {formState.seatsMin} and total candidates ({formState.totalCandidates}).</span
				>
				{#if formState.numSeats === formState.seatsMin}
					<span class="b-amber-600 block border-l-2 pl-2 text-amber-600">Minimum reached</span>
				{/if}
				{#if formState.numSeats === formState.seatsMax}
					<span class="b-amber-600 block border-l-2 pl-2 text-amber-600">Maximum reached</span>
				{/if}
			</p>
		</fieldset>

		<fieldset class="col-span-1 fieldset w-full">
			<legend class="fieldset-legend">Maximum ballot length</legend>
			<input
				type="number"
				min="1"
				max={formState.totalCandidates}
				class="input input-sm w-full"
				bind:value={formState.maxRankingCandidatesInput}
			/>
			<p class="label flex-col items-start whitespace-pre-wrap">
				Must be ≤ total number of candidates ({formState.totalCandidates})
			</p>
		</fieldset>
	</div>
</div>
