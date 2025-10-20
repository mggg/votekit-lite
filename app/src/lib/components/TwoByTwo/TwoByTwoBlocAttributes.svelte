<script lang="ts">
	import PalettePip from '../PalettePip.svelte';
	import { formState, MAX_CANDIDATES } from '$lib/stores/formStore.svelte';

	const candidatesRange = new Array(MAX_CANDIDATES).fill(0).map((_, index) => index + 1);
</script>

<div class="card bg-base-100 p-4 shadow-sm">
	<h2 class="mb-2 text-lg font-semibold text-slate-800">Group attributes</h2>
	<p class="mb-4 text-sm text-slate-500">
		Set the size of each group and optionally their turnout rate.
	</p>

	<div class="mb-3 flex items-center gap-2">
		<label class="label cursor-pointer gap-2">
			<input
				type="checkbox"
				class="checkbox checkbox-sm"
				bind:checked={formState.showTurnoutSettings}
			/>
			<span class="text-sm">Show turnout settings</span>
		</label>
	</div>

	<ul class="list">
		<li class="text-md grid grid-cols-12 px-0 py-1">
			<span class={`col-span-2 pl-6 ${formState.showTurnoutSettings ? 'col-span-4' : 'col-span-6'}`}
				>Bloc name</span
			>
			<span class={`col-span-2 pl-2 ${formState.showTurnoutSettings ? 'col-span-2' : 'col-span-6'}`}
				>Number of voters</span
			>
			{#if formState.showTurnoutSettings}
				<span class="col-span-2 pl-2">Population</span>
				<span class="col-span-4 pl-2">Turnout</span>
			{/if}
		</li>
		{#each formState.blocs.slice(0, 2) as bloc, i}
			<li class="list-row list-row-sm grid grid-cols-12 px-0 py-1">
				<div
					class={`flex flex-row items-center gap-2  ${formState.showTurnoutSettings ? 'col-span-4' : 'col-span-6'}`}
				>
					<PalettePip color={bloc.color} onChange={(color: string) => (bloc.color = color)} />
					<span class="text-sm font-medium">{bloc.name || `Group ${i + 1}`}</span>
				</div>
				<label
					class={`input input-sm ${formState.showTurnoutSettings ? 'col-span-2' : 'col-span-6'} w-full`}
				>
					<input
						type="number"
						min="0"
						class="w-full px-0 text-sm"
						placeholder="Number of voters"
						value={Math.round(formState.blocCounts[i])}
						oninput={(e) => (bloc.population = Number(e.currentTarget.value) / bloc.turnout)}
						disabled={formState.showTurnoutSettings}
					/>
				</label>
				{#if formState.showTurnoutSettings}
					<label
						class={`input col-span-2 input-sm ${formState.showTurnoutSettings ? 'col-span-2' : 'col-span-4'}`}
					>
						<input
							type="number"
							class="grow px-0 text-sm"
							placeholder="Population"
							value={Math.round(bloc.population)}
							oninput={(e) => (bloc.population = Number(e.currentTarget.value))}
						/>
					</label>
					<div class="col-span-4 flex flex-col items-start">
						<input
							type="range"
							min="0"
							max="1"
							step="0.01"
							bind:value={bloc.turnout}
							class={`range col-span-2 range-xs`}
						/>
						<div class="text-xs text-slate-500">{(bloc.turnout * 100).toFixed(1)}%</div>
					</div>
				{/if}
			</li>
		{/each}
	</ul>

	<h2 class="mb-2 text-lg font-semibold text-slate-800">Candidate pools</h2>
	<p class="mb-4 text-sm text-slate-500">
		Slates are groups of candidates that tend to be preferred by the same voters. Set the number of
		candidates for each slate.
	</p>

	<ul class="list bg-base-100 p-0">
		<li class="list-row my-0 grid grid-cols-2 px-0 py-1 pr-4">
			<span class="col-span-1 pl-6">Slate name</span>
			<span class="col-span-1 pl-1">Number of candidates</span>
		</li>
		{#each formState.slates.slice(0, 2) as slate, slateIndex}
			<li class="list-row my-0 grid grid-cols-2 gap-2 px-0 py-1 pr-4">
				<div class="col-span-1 flex items-center gap-2">
					<PalettePip color={slate.color} onChange={(color: string) => (slate.color = color)} />
					<span class="text-sm font-medium">{slate.name || `Group ${slateIndex + 1}`}</span>
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
