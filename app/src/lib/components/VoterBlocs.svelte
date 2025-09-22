<script lang="ts">
	import { formState } from '$lib/stores/formStore.svelte';
	import { COLOR_MAP } from '$lib/constants';
	import PalettePip from './PalettePip.svelte';
</script>

<div class="card bg-base-100 p-4 shadow-sm">
	<h2 class="mb-2 text-lg font-semibold text-slate-800">Voter blocs</h2>
	<!-- Number of voter blocs -->
	<div class="mb-3 grid grid-cols-2">
		<fieldset class="fieldset">
			<legend class="fieldset-legend">Number of voter blocs</legend>

			<div class="w-full max-w-xs">
				<input
					type="range"
					min="1"
					max="5"
					class="range"
					step="1"
					value={formState.blocs.length}
					on:input={(e) => formState.updateNumVoterBlocs(Number(e.currentTarget.value))}
				/>
				<div class="mt-2 flex justify-between px-2.5 text-xs">
					<span>1</span>
					<span>2</span>
					<span>3</span>
					<span>4</span>
					<span>5</span>
				</div>
			</div>
			<p class="label">At most 5.</p>
		</fieldset>

		<!-- Mode toggle -->
		<div class="mb-3">
			<p class="mb-2 text-sm font-medium">Size blocs by</p>
			<button
				type="button"
				class="btn btn-soft btn-sm {formState.voterBlocMode === 'count'
					? 'btn-primary'
					: 'btn-secondary'}"
				on:click={() => (formState.voterBlocMode = 'count')}
			>
				Count of voters
			</button>
			<button
				type="button"
				class="btn btn-soft btn-sm {formState.voterBlocMode === 'share'
					? 'btn-primary'
					: 'btn-secondary'}"
				on:click={() => (formState.voterBlocMode = 'share')}
			>
				Share of total population
			</button>
			<fieldset class="mt-2 fieldset">
				<label class="label">
					<input type="checkbox" class="checkbox" bind:checked={formState.showTurnoutSettings} />
					Show turnout settings
				</label>
			</fieldset>
		</div>
	</div>

	{#if formState.voterBlocMode === 'count'}
		<ul class="list">
			<li class="text-md grid grid-cols-12 px-0 py-1">
				<span
					class={`col-span-2 pl-6 ${formState.showTurnoutSettings ? 'col-span-4' : 'col-span-6'}`}
					>Bloc name</span
				>
				<span
					class={`col-span-2 pl-2 ${formState.showTurnoutSettings ? 'col-span-2' : 'col-span-3'}`}
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

		<ul class="list">
			<li class="text-md grid grid-cols-12 gap-4 px-0 py-1">
				<span
					class={`col-span-2 pl-6 ${formState.showTurnoutSettings ? 'col-span-3' : 'col-span-6'}`}
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
						<label class="block flex-grow text-sm">
							<input
								type="range"
								min="0"
								max="1"
								step="0.01"
								class="range mt-1 w-full range-xs"
								value={bloc.population / formState.totalPopulation}
								on:input={(e) =>
									formState.updateBlocElectorateShare(i, Number(e.currentTarget.value))}
							/>
						</label>

						<input
							type="number"
							min="0"
							max="100"
							step="1"
							class="input input-sm max-w-14 flex-none text-center"
							value={Math.round((bloc.population / formState.totalPopulation) * 100)}
							on:input={(e) =>
								formState.updateBlocElectorateShare(i, Number(e.currentTarget.value) / 100)}
						/>
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
		</ul>
		<!-- <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
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
								formState.updateBlocElectorateShare(index, Number(e.currentTarget.value))}
						/>
					</label>
					<div class="text-xs text-slate-500">Voters: {formState.blocCounts[index]}</div>
				</div>
			{/each}
		</div> -->
	{/if}

	<!-- Advanced settings -->
	<!-- <div class="mt-3">
		<button
			type="button"
			class="text-sm text-indigo-600 hover:text-indigo-800"
			on:click={() => (formState.showTurnoutSettings = !formState.showTurnoutSettings)}
		>
			{formState.showTurnoutSettings ? '▼' : '▶'} Turnout settings
		</button>
		{#if formState.showTurnoutSettings}
			<div class="mt-2 rounded-lg bg-slate-50 p-3">
				<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
					{#each formState.blocs as bloc, index}
						<div>
							{#if formState.voterBlocMode === 'count'}
								<label class="block text-sm"
									>{bloc.name} population
									<input
										type="number"
										min="1"
										class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200"
										bind:value={bloc.population}
									/>
								</label>
							{/if}
							<label class="mt-2 block text-sm"
								>{bloc.name} turnout rate
								<input
									type="range"
									min="0"
									max="1"
									step="0.01"
									class="mt-1 w-full"
									bind:value={bloc.turnout}
								/>
								<div class="text-xs text-slate-500">{(bloc.turnout * 100).toFixed(1)}%</div>
							</label>
						</div>
					{/each}
				</div>
				<div class="mt-2 text-xs text-slate-500">
					Calculated voters: {formState.blocs
						.map((bloc, i) => `${bloc.name} = ${Math.round(bloc.population * bloc.turnout)}`)
						.join(', ')}
				</div>
			</div>
		{/if}
	</div> -->

	<!-- Candidate strength breakdown -->
	<div class="mt-4">
		<h3 class="mb-2 text-sm font-medium text-slate-700">Candidate strength</h3>
		<p class="mb-2 text-xs text-slate-500">
			How strongly do voters for each bloc prefer each candidate?
		</p>
		<ul class="list px-0">
			{#each formState.blocs as bloc, blocIndex}
				<li class="pt-4">
					<div class={`${formState.slates.length > 3 ? 'flex-col' : 'flex-row'} flex`}>
						<div class="col-span-4 flex flex-row items-center gap-2">
							<PalettePip color={COLOR_MAP.BLOCS[blocIndex]} />
							<span class="col-span-2"
								>Do {bloc.name} voters have a strong preference towards...</span
							>
						</div>
						<div class="list-row list-row-sm pt-2 pb-4">
							<div class="flex w-full flex-row items-center gap-2 pl-2">
								{#each Array(formState.slates.length) as _, slateIndex}
									<label class="block text-xs">
										<span
											style={`border-left: 4px solid ${COLOR_MAP.SLATES[slateIndex]}; padding-left: 4px`}
											>{formState.slates[slateIndex].name} candidates</span
										>
										<select class="select mt-1 select-sm">
											<option value="random">Unknown</option>
											<option value="strong">Yes</option>
											<option value="indifferent">No</option>
										</select>
									</label>
								{/each}
							</div>
						</div>
					</div>
				</li>
			{/each}
		</ul>
	</div>

	<!-- Cohesion sliders as a list -->
	<div class="mt-4">
		<h3 class="mb-2 text-sm font-medium text-slate-700">Cohesion</h3>
		<ul class="list px-0">
			{#each formState.blocCohesion as blocCohesionArray, blocIndex}
				<li class="list-row list-row-sm flex flex-col gap-2 py-3">
					<div class="flex flex-row items-center gap-2">
						<PalettePip color={COLOR_MAP.BLOCS[blocIndex]} />
						<span class="font-medium">{formState.blocs[blocIndex].name} voters</span>
						<span class="ml-2 text-xs text-slate-500">(must sum to 100%)</span>
					</div>
					<div class="flex flex-row flex-wrap gap-0 pl-6">
						{#if blocCohesionArray.length <= 2}
							<label class="flex flex-grow flex-col items-start text-xs">
								<span
									class="sr-only mb-1"
									style={`border-left: 4px solid ${COLOR_MAP.SLATES[0]}; padding-left: 4px`}
								>
									{formState.slates[0].name}: {(blocCohesionArray[0] * 100).toFixed(0)}%
								</span>
								<input
									type="range"
									min="0"
									max="1"
									step="0.01"
									class={`range w-full range-xs`}
									value={blocCohesionArray[0]}
									style={`--range-progress:${COLOR_MAP.SLATES[0]}; --range-bg:${COLOR_MAP.SLATES[1]};background-color:${COLOR_MAP.SLATES[1]};padding:0;`}
									on:input={(e) =>
										formState.updateBlocCohesion(blocIndex, 0, Number(e.currentTarget.value))}
								/>
							</label>
						{:else}
							<div class="relative w-full"></div>
							{#each blocCohesionArray as cohesion, slateIndex}
								<label class="flex flex-grow flex-col items-start text-xs">
									<span
										class="mb-1"
										style={`border-left: 4px solid ${COLOR_MAP.SLATES[slateIndex]}; padding-left: 4px`}
									>
										{formState.slates[slateIndex].name}: {(cohesion * 100).toFixed(0)}%
									</span>
									<input
										type="range"
										min="0"
										max="1"
										step="0.01"
										class={`range w-full range-xs`}
										value={cohesion}
										style={`--range-progress:${COLOR_MAP.SLATES[slateIndex]}; padding:0;`}
										on:input={(e) =>
											formState.updateBlocCohesion(
												blocIndex,
												slateIndex,
												Number(e.currentTarget.value)
											)}
									/>
								</label>
							{/each}
						{/if}
					</div>
					<div class="mt-2 pl-6 text-xs text-slate-500">
						Sum: {(blocCohesionArray.reduce((sum, val) => sum + val, 0) * 100).toFixed(1)}%
					</div>
				</li>
			{/each}
		</ul>
	</div>
</div>
