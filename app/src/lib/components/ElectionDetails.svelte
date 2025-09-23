<script lang="ts">
	import { formState, MAX_CANDIDATES } from '$lib/stores/formStore.svelte';
	import { COLOR_MAP } from '$lib/constants';
	import PalettePip from './PalettePip.svelte';
	const candidatesRange = new Array(MAX_CANDIDATES).fill(0).map((_, index) => index + 1);
</script>

<div class="card bg-base-100 p-4 shadow-sm">
	<h2 class="mb-2 text-lg font-semibold text-slate-800">Election details</h2>
	<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
		<fieldset class="fieldset">
			<legend class="fieldset-legend">Number of candidate slates</legend>

			<div class="w-full max-w-xs">
				<input
					type="range"
					min="1"
					max="5"
					class="range"
					step="1"
					value={formState.slates.length}
					oninput={(e) => {
						const value = Number(e.currentTarget.value);
						if (MAX_CANDIDATES === formState.totalCandidates && value > formState.slates.length) {
							e.currentTarget.value = formState.slates.length.toString();
						} else {
							formState.updateNumSlates(value);
						}
					}}
				/>
				<div class="mt-2 flex justify-between px-2.5 text-xs">
					<span>1</span>
					<span>2</span>
					<span>3</span>
					<span>4</span>
					<span>5</span>
				</div>
			</div>
			<p class="label max-w-full whitespace-pre-wrap flex-col items-start text-left">
				{#if MAX_CANDIDATES === formState.totalCandidates}
					<span class="text-amber-600"
						>Maximum number of candidates (12) reached. To add more slates, reduce the number of
						candidates per slate.</span
					>
				{/if}
			</p>
		</fieldset>
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
		<!-- 		 
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
		</fieldset> -->
	</div>

	<!-- Number of candidates per slate -->
	<h2 class="mt-4 mb-2 text-lg font-semibold text-slate-800">Candidate slates</h2>
	<p class="mb-4 text-sm text-slate-500">
		Slates are groups of candidates that are ranked together. Use the controls below to adjust how
		many groups of candidates you want, and how many candidates each group should have. Slates are
		not necessarily the same as voter blocs.
	</p>
	<ul class="list bg-base-100 p-0">
		<!-- headers -->
		<li class="list-row my-0 grid grid-cols-9 gap-2 px-0 py-1 pr-4">
			<span class="col-span-4 pl-6">Slate name</span>
			<span class="col-span-1"></span>
			<span class="col-span-4">Number of candidates</span>
		</li>
		{#each formState.slates as slate, slateIndex}
			<li class="list-row my-0 grid grid-cols-9 gap-2 px-0 py-1 pr-4">
				<div class="col-span-4 flex items-center gap-2">
					<PalettePip color={COLOR_MAP.SLATES[slateIndex]} />
					<label class="input input-sm">
						<span class="sr-only text-gray-400">Slate name</span>
						<input
							type="text"
							class="w-full grow px-0 text-sm"
							placeholder="Slate name"
							bind:value={slate.name}
						/>
					</label>
				</div>
				<div class="col-span-1"></div>
				<div class="col-span-4 flex w-full max-w-xs flex-row items-center gap-2">
					<label class="sr-only label text-sm">Number of candidates</label>
					<div class="rating-xs rating gap-1">
						{#each candidatesRange as index}
							<input
								type="radio"
								name={`rating-${index}-${slate.name}`}
								class={`mask rounded-full mask-circle opacity-100 transition-all
								duration-300
              ${formState.remainingCandidates < index - slate.numCandidates && '!opacity-5'}
              `}
								style={`
									background-color: ${slate.numCandidates >= index ? COLOR_MAP.SLATES[slateIndex] : formState.remainingCandidates >= index - slate.numCandidates ? 'white' : undefined};
									border: 2px solid ${COLOR_MAP.SLATES[slateIndex]};
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

					<input
						type="number"
						min="1"
						max={slate.numCandidates + formState.remainingCandidates}
						class="input input-sm text-center"
						bind:value={slate.numCandidates}
					/>
				</div>
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
