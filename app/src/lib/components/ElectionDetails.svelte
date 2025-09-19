<script lang="ts">
	import { formState, MAX_CANDIDATES } from '$lib/stores/formStore.svelte';
	const candidatesRange = new Array(MAX_CANDIDATES).fill(0).map((_, index) => index + 1);
  export const slateColors = {
  bg: [
    '!bg-primary',
    '!bg-accent',
    '!bg-info',
    '!bg-success',
    '!bg-warning',
  ]
}
</script>

<div class="card bg-base-100 p-4 shadow-sm">
	<h2 class="mb-2 text-lg font-semibold text-slate-800">Election details</h2>
	<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
		<!-- Number of seats (moved up) -->
		<fieldset class="fieldset w-full">
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
		<!-- Max candidates that can be ranked -->
		<fieldset class="fieldset w-full">
			<legend class="fieldset-legend">Maximum ballot length</legend>
			<input
				type="number"
				min="1"
				max={formState.totalCandidates}
				class="input input-sm w-full"
				bind:value={formState.maxRankingCandidatesInput}
			/>
			<p class="label">
				Must be ≤ total number of candidates ({formState.totalCandidates})
			</p>
		</fieldset>

		<!-- Number of slates -->
		<fieldset class="fieldset w-full">
			<legend class="fieldset-legend">Number of slates</legend>
			<input
				type="number"
				min="1"
				max={MAX_CANDIDATES === formState.totalCandidates
					? formState.slates.length
					: formState.seatsMax}
				class="input input-sm w-full"
				value={formState.slates.length}
				oninput={(e) => formState.updateNumSlates(Number(e.currentTarget.value))}
			/>
			<p class="label">Positive integer less than or equal to 5</p>
		</fieldset>
	</div>

	<!-- Number of candidates per slate -->
	<ul class="list bg-base-100 p-0">
		<li class="text-md pt-4 font-semibold">Slates</li>
		{#each formState.slates as slate, slateIndex}
			<li class="list-row my-0 grid grid-cols-2 px-0 py-1 pr-4">
				<label class="input input-sm">
					<span class="text-gray-400">Slate name</span>
					<input
						type="text"
						class="grow text-sm"
						placeholder="Slate name"
						bind:value={slate.name}
					/>
				</label>
				<div class="flex w-full max-w-xs flex-row items-center gap-2">
					<label class="label text-sm">Number of candidates</label>
					<div class="rating-xs rating gap-1">
						{#each candidatesRange as index}
							<input
								type="radio"
								name={`rating-${index}-${slate.name}`}
								class={`mask mask-circle opacity-100 transition-all duration-300
              ${
								formState.remainingCandidates < index - slate.numCandidates
									? 'pointer-events-none cursor-not-allowed bg-gray-200'
									: slate.numCandidates >= index
										? `${slateColors.bg[slateIndex]}`
										: 'bg-secondary'
							}
              `}
								aria-label={`${index} star`}
								checked={slate.numCandidates === index}
								onclick={(e) => {
									e.preventDefault();
									const increase = index - slate.numCandidates;
									if (formState.remainingCandidates < increase) return;
									slate.numCandidates = index;
								}}
							/>
						{/each}
					</div>
				</div>
				<!-- <label class="input input-sm"
					>Number of candidates
					<input
						type="number"
						min="1"
						max={slate.numCandidates + formState.remainingCandidates}
						class="input input-sm"
						bind:value={slate.numCandidates}
					/>
				</label> -->
			</li>
		{/each}
	</ul>

	<div class="mt-1 flex items-center justify-between text-xs text-slate-500">
		<span>Total candidates: {formState.totalCandidates} out of a maximum of {MAX_CANDIDATES}</span>
		{#if formState.totalCandidates >= MAX_CANDIDATES}
			<span class="text-amber-600">Maximum of {MAX_CANDIDATES} candidates reached</span>
		{/if}
	</div>
</div>
