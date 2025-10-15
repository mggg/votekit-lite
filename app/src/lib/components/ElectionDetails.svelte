<script lang="ts">
	import { COLOR_MAP } from '$lib/constants';
	import { formState, MAX_CANDIDATES } from '$lib/stores/formStore.svelte';
	import PalettePip from './PalettePip.svelte';
	const candidatesRange = new Array(MAX_CANDIDATES).fill(0).map((_, index) => index + 1);
</script>

<div class="card bg-base-100 p-4 shadow-sm">
	<h2 class="mb-2 text-lg font-semibold text-slate-800">Election details</h2>
	<div class="grid grid-cols-1 gap-4 md:grid-cols-4">
		<fieldset class="col-span-2 fieldset">
			<legend class="fieldset-legend">Number of candidate slates</legend>
			<div class="w-full max-w-xs">
				<input
					type="range"
					min="2"
					max="5"
					class="range {formState.ballotGenerator === 'CS' ? 'cursor-not-allowed opacity-50' : ''}"
					step="1"
					value={formState.slates.length}
					oninput={(e) => {
						if (formState.ballotGenerator === 'CS') return;
						const value = Number(e.currentTarget.value);
						if (MAX_CANDIDATES === formState.totalCandidates && value > formState.slates.length) {
							e.currentTarget.value = formState.slates.length.toString();
						} else {
							formState.updateNumSlates(value);
						}
					}}
					disabled={formState.ballotGenerator === 'CS'}
				/>
				<div class="mt-2 flex justify-between px-2.5 text-xs">
					<span>2</span>
					<span>3</span>
					<span>4</span>
					<span>5</span>
				</div>
			</div>
			<p class="label max-w-full flex-col items-start text-left whitespace-pre-wrap">
				{#if formState.ballotGenerator === 'CS'}
					<span class="text-amber-600"
						>To use Cambridge voters, there must be exactly two slates.</span
					>
				{:else if MAX_CANDIDATES === formState.totalCandidates && formState.slates.length < 5}
					<span class="text-amber-600"
						>To add more slates, reduce the number of candidates per slate.</span
					>
				{/if}
			</p>
		</fieldset>
		<!-- Number of seats (moved up) -->
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
		<!-- Max candidates that can be ranked -->
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

	<!-- Number of candidates per slate -->
	<h2 class="mt-4 mb-2 text-lg font-semibold text-slate-800">Candidate slates</h2>
	<p class="mb-4 text-sm text-slate-500">
		Slates are groups of candidates that are ranked together. Use the controls below to adjust how
		many groups of candidates you want, and how many candidates each group should have. Slates are
		not necessarily the same as voter blocs.
	</p>
	<ul class="list bg-base-100 p-0">
		<!-- headers -->
		<li class="list-row my-0 grid grid-cols-2 px-0 py-1 pr-4">
			<span class="col-span-1 pl-6">Slate name</span>
			<span class="col-span-1 pl-1">Number of candidates</span>
		</li>
		{#each formState.slates as slate, slateIndex}
			<li class="list-row my-0 grid grid-cols-2 gap-2 px-0 py-1 pr-4">
				<div class="col-span-1 flex items-center gap-2">
					<PalettePip color={slate.color} />
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
				<div class="col-span-1 flex w-full max-w-xs flex-row items-center gap-2 pl-2">
					<span class="sr-only" id={`slate-candidates-label-${slateIndex}`}
						>Number of candidates</span
					>
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
									background-color: ${slate.numCandidates >= index ? slate.color : formState.remainingCandidates >= index - slate.numCandidates ? 'white' : undefined};
									border: 2px dotted ${slate.color};
								`}
								aria-label={`${index} star`}
								aria-labelledby={`slate-candidates-label-${slateIndex}`}
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
		<span class={formState.totalCandidates >= MAX_CANDIDATES ? 'text-amber-600' : ''}
			>Total candidates: {formState.totalCandidates} out of a maximum of {MAX_CANDIDATES}</span
		>
	</div>
</div>
