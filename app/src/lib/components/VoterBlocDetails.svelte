<script lang="ts">
	import { formState } from '$lib/stores/formStore.svelte';
	import { COLOR_MAP } from '$lib/constants';
	import PalettePip from './PalettePip.svelte';
</script>
{formState.voterBlocMode}
{formState.showTurnoutSettings}
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
						value={formState.blocCounts[i]}
						on:input={(e) => (bloc.population = Number(e.currentTarget.value) * bloc.turnout)}
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
							bind:value={bloc.population}
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
				value={formState.totalPopulation}
				on:input={(e) => formState.updateTotalElectorate(Number(e.currentTarget.value))}
			/>
		</label>
	</div>
	<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
		{#each formState.blocs as bloc, index}
			<div class="space-y-2">
				<label class="block text-sm"
					>Bloc name
					<input
						type="text"
						class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200"
						bind:value={bloc.name}
					/>
				</label>
				<label class="block text-sm"
					>Share of total population: {(
						(bloc.population / formState.totalPopulation) *
						100
					).toFixed(1)}%
					<input
						type="range"
						min="0"
						max="1"
						step="0.01"
						class="mt-1 w-full"
						value={bloc.population / formState.totalPopulation}
						on:input={(e) =>
							formState.updateBlocElectorateShare(e, index, Number(e.currentTarget.value))}
					/>
				</label>
				<div class="text-xs text-slate-500">Voters: {formState.blocCounts[index]}</div>
			</div>
		{/each}
	</div>
{/if}
