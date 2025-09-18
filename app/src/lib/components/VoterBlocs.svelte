<script lang="ts">
	import { formState } from '$lib/stores/formStore.svelte';
	import type { VoterPreference } from '$lib';
</script>

<div class="rounded-2xl border border-slate-200/70 bg-white/70 p-3 shadow-sm backdrop-blur">
	<h2 class="mb-2 text-lg font-semibold text-slate-800">Voter blocs</h2>
	<!-- Number of voter blocs -->
	<div class="mb-3">
		<label class="block text-sm"
			>Number of voter blocs
			<input
				type="number"
				min="1"
				max="5"
				class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200"
				value={formState.blocs.length}
				on:input={(e) => e.target?.value && formState.updateNumVoterBlocs(Number(e.target.value))}
			/>
		</label>
		<div class="mt-1 text-xs text-slate-500">At most 5.</div>
	</div>

	<!-- Mode toggle -->
	<div class="mb-3">
		<div class="flex gap-2">
			<button
				type="button"
				class="rounded-lg border px-3 py-1 text-sm {formState.voterBlocMode === 'count'
					? 'border-indigo-300 bg-indigo-100 text-indigo-700'
					: 'border-slate-200 bg-white text-slate-600'}"
				on:click={() => (formState.voterBlocMode = 'count')}
			>
				Count
			</button>
			<button
				type="button"
				class="rounded-lg border px-3 py-1 text-sm {formState.voterBlocMode === 'share'
					? 'border-indigo-300 bg-indigo-100 text-indigo-700'
					: 'border-slate-200 bg-white text-slate-600'}"
				on:click={() => (formState.voterBlocMode = 'share')}
			>
				Share
			</button>
		</div>
	</div>

	{#if formState.voterBlocMode === 'count'}
		<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
			{#each formState.blocs as bloc, i}
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
						>Number of voters
						<input
							type="number"
							min="0"
							class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200"
							value={formState.blocCounts[i]}
							on:input={(e) => (bloc.population = Number(e.target.value) * bloc.turnout)}
						/>
					</label>
				</div>
			{/each}
		</div>
	{:else}
		<div class="mb-3">
			<label class="block text-sm"
				>Total number of voters
				<input
					type="number"
					min="1"
					class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200"
					value={formState.totalVoters}
					on:input={(e) => formState.updateTotalVoters(Number(e.target.value))}
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
						>Share: {(formState.blocShares[index] * 100).toFixed(1)}%
						<input
							type="range"
							min="0"
							max="1"
							step="0.01"
							class="mt-1 w-full"
							value={formState.blocShares[index]}
							on:input={(e) =>
								formState.updateBlocShare(index, Number((e.target as HTMLInputElement).value))}
						/>
					</label>
					<div class="text-xs text-slate-500">Voters: {formState.blocCounts[index]}</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Advanced settings -->
	<div class="mt-3">
		<button
			type="button"
			class="text-sm text-indigo-600 hover:text-indigo-800"
			on:click={() => (formState.showTurnoutSettings = !formState.showTurnoutSettings)}
		>
			{formState.showTurnoutSettings ? '▼' : '▶'} Turnout settings
		</button>
		{#if formState.showTurnoutSettings}
			<div class="mt-2 rounded-lg bg-slate-50 p-3">
				{#if formState.voterBlocMode === 'count'}
					<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
						{#each formState.blocs as bloc, index}
							<div>
								<label class="block text-sm"
									>{formState.blocNames[index]} population
									<input
										type="number"
										min="1"
										class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200"
										bind:value={bloc.population}
									/>
								</label>
								<label class="mt-2 block text-sm"
									>{formState.blocNames[index]} turnout rate
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
							.map(
								(bloc, i) =>
									`${formState.blocNames[i]} = ${Math.round(bloc.population * bloc.turnout)}`
							)
							.join(', ')}
					</div>
				{:else}
					<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
						{#each formState.blocs as bloc, index}
							<div>
								<label class="block text-sm"
									>{formState.blocNames[index]} turnout rate
									<input
										type="range"
										min="0"
										max="1"
										step="0.01"
										class="mt-1 w-full"
										value={bloc.turnout}
										on:input={(e) => {
											console.log(e.target.value, bloc.population);
											formState.blocs[index] = {
												...bloc,
												turnout: Number((e.target as HTMLInputElement).value),
												population: Math.round(
													(formState.totalVoters * formState.blocShares[index]) /
														Number((e.target as HTMLInputElement).value)
												)
											};
										}}
									/>
									<div class="text-xs text-slate-500">{(bloc.turnout * 100).toFixed(1)}%</div>
								</label>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Candidate strength breakdown -->
	<div class="mt-4">
		<h3 class="mb-2 text-sm font-medium text-slate-700">Candidate strength</h3>
		<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
			{#each formState.blocPreferences as preferences, blocIndex}
				<fieldset class="space-y-2">
					<legend class="text-xs font-medium text-slate-500"
						>{formState.blocs[blocIndex].name} voters</legend
					>
					{#each Array(formState.slates.length) as _, slateIndex}
						<label class="block text-xs"
							>Towards {formState.slates[slateIndex].name} candidates
							<select
								class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200"
								bind:value={preferences[slateIndex]}
							>
								<option value="random">Unknown</option>
								<option value="strong">Yes</option>
								<option value="indifferent">No</option>
							</select>
						</label>
					{/each}
				</fieldset>
			{/each}
		</div>
	</div>

	<!-- Cohesion sliders -->
	<div class="mt-4">
		<h3 class="mb-2 text-sm font-medium text-slate-700">Cohesion</h3>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each formState.blocCohesion as blocCohesionArray, blocIndex}
				<div>
					<h4 class="mb-3 text-xs font-medium text-slate-600">
						{formState.blocs[blocIndex].name} voters cohesion to each slate (must sum to 100%)
					</h4>
					<div class="space-y-3">
						{#each blocCohesionArray as cohesion, slateIndex}
							<label class="block text-sm"
								>To {formState.slates[slateIndex].name}: {(cohesion * 100).toFixed(0)}%
								<input
									type="range"
									min="0"
									max="1"
									step="0.01"
									class="mt-1 w-full"
									value={cohesion}
									on:input={(e) =>
										formState.updateBlocCohesion(
											blocIndex,
											slateIndex,
											Number((e.target as HTMLInputElement).value)
										)}
								/>
							</label>
						{/each}
					</div>
					<div class="mt-2 text-xs text-slate-500">
						Sum: {(blocCohesionArray.reduce((sum, val) => sum + val, 0) * 100).toFixed(1)}%
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
