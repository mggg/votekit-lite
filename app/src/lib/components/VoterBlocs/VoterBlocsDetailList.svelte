<script lang="ts">
	import { formState } from '$lib/stores/formStore.svelte';
	import { COLOR_MAP } from '$lib/constants';
	import PalettePip from '../PalettePip.svelte';
</script>

{#if formState.voterBlocMode === 'count'}
	<ul class="list">
		<li class="text-md grid grid-cols-12 px-0 py-1">
			<span class={`col-span-2 pl-6 ${formState.showTurnoutSettings ? 'col-span-4' : 'col-span-6'}`}
				>Bloc name</span
			>
			<span class={`col-span-2 pl-2 ${formState.showTurnoutSettings ? 'col-span-2' : 'col-span-3'}`}
				>Number of voters</span
			>
			{#if formState.showTurnoutSettings}
				<span class="col-span-2 pl-2">Population</span>
				<span class="col-span-3 pl-2">Turnout</span>
			{/if}
		</li>
		{#each formState.blocs as bloc, i}
			<li class="list-row list-row-sm grid grid-cols-12 px-0 py-1">
				<div
					class={`flex flex-row items-center gap-2  ${formState.showTurnoutSettings ? 'col-span-4' : 'col-span-6'}`}
				>
					<PalettePip color={COLOR_MAP.BLOCS[i]} />
					<label class={`input input-sm w-full`}>
						<input
							type="text"
							class="px-0 text-sm"
							placeholder="Bloc name"
							bind:value={bloc.name}
						/>
					</label>
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
						oninput={(e) => (bloc.population = Number(e.currentTarget.value) * bloc.turnout)}
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
{:else}
	<div class="mb-3">
		<label class="block text-sm"
			>Total population of electorate
			<input
				type="number"
				min="1"
				class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200"
				value={Math.round(formState.totalPopulation)}
				oninput={(e) => formState.updateTotalElectorate(Number(e.currentTarget.value))}
			/>
		</label>
	</div>

	<ul class="list">
		<li class="text-md grid grid-cols-12 gap-4 px-0 py-1">
			<span class={`col-span-2 pl-6 ${formState.showTurnoutSettings ? 'col-span-3' : 'col-span-6'}`}
				>Bloc name</span
			>
			<span class={`col-span-2 ${formState.showTurnoutSettings ? 'col-span-5' : 'col-span-6'}`}
				>Share of total population</span
			>
			{#if formState.showTurnoutSettings}
				<span class="col-span-4">Turnout</span>
			{/if}
		</li>
		{#each formState.blocs as bloc, i}
			<li class="list-row list-row-sm grid grid-cols-12 gap-4 px-0 py-1">
				<div
					class={`flex flex-row items-center gap-2  ${formState.showTurnoutSettings ? 'col-span-3' : 'col-span-6'}`}
				>
					<PalettePip color={COLOR_MAP.BLOCS[i]} />
					<label class={`input input-sm w-full`}>
						<input
							type="text"
							class="px-0 text-sm"
							placeholder="Bloc name"
							bind:value={bloc.name}
						/>
					</label>
				</div>
				<div
					class={`flex flex-row items-center gap-2 ${formState.showTurnoutSettings ? 'col-span-5 pr-4' : 'col-span-6'}`}
				>
					<label class="relative block flex-grow text-sm">
						{#if formState.blocs.length > 2}
							<span
								class="pointer-events-none absolute left-0 rounded-full"
								style={`height: 16px; top:5px; border:2px dotted ${COLOR_MAP.BLOCS[i]}88; border-white:2px; width:${formState.maxPercentages[i] * 100}%;`}
							></span>
						{/if}
						<input
							type="range"
							min="0"
							max="1"
							step="0.01"
							class="range mt-1 w-full range-xs"
							value={formState.populationShare[i]}
							style={`--range-progress:${COLOR_MAP.BLOCS[i]};`}
							oninput={(e) =>
								formState.updateBlocElectorateShare(e, i, Number(e.currentTarget.value))}
						/>
					</label>
					<label class="input input-sm max-w-24 flex-none">
						<input
							type="number"
							min="0"
							max="100"
							step="1"
							class="input input-sm text-left"
							value={Math.round((bloc.population / formState.totalPopulation) * 100)}
							oninput={(e) =>
								formState.updateBlocElectorateShare(e, i, Number(e.currentTarget.value) / 100)}
						/>
						<span class="p-0 text-right">% </span>
					</label>
				</div>
				{#if formState.showTurnoutSettings}
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
		<li>
			<!-- at the end of the row add a message if there is remaining unallocated population -->
			<div class="w-full pt-1 text-right text-xs text-amber-500">
				{#if formState.unallocatedPopulation > 0}
					Remaining unallocated population: {Math.round(
						(formState.unallocatedPopulation / formState.totalPopulation) * 100
					)}%
				{:else}
					&nbsp;
				{/if}
			</div>
		</li>
	</ul>
{/if}
