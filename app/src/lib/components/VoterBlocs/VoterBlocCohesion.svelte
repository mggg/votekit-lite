<script lang="ts">
	import { formState } from '$lib/stores/formStore.svelte';
	import { COLOR_MAP } from '$lib/constants';
	import PalettePip from '../PalettePip.svelte';

	const GRID_STYLE_MAP = {
		3: 'grid-cols-3',
		4: 'grid-cols-4',
		5: 'grid-cols-5'
	};
</script>

<!-- Cohesion sliders as a list -->
<div class="mt-4">
	<h3 class="mb-2 text-sm font-medium text-slate-700">Voter cohesion</h3>
	<p class="mb-2 text-xs text-slate-500">
		How often do voters from each bloc vote for candidates from each slate?
	</p>
	<ul class="list px-0">
		{#each formState.blocCohesion as blocCohesionArray, blocIndex}
			<li class="list-row list-row-sm flex flex-col gap-2 py-3">
				<div class="flex flex-row items-center gap-2">
					<PalettePip
						color={formState.blocs[blocIndex].color}
						onChange={(color: string) => (formState.blocs[blocIndex].color = color)}
					/>
					<span class="font-medium">{formState.blocs[blocIndex].name} voters</span>
					<span class="ml-2 text-xs text-slate-500">
						{#if formState.slates.length > 2}
							(must sum to 100%)
						{/if}
					</span>
				</div>
				{#if blocCohesionArray.length <= 2}
					<div class="flex flex-row gap-2 pl-6">
						<div class="flex w-full flex-col">
							<div class="space-between flex w-full flex-row justify-between">
								{#each formState.slates as slate, slateIndex}
									<label class="input input-sm my-2 max-w-fit">
										<span class="text-gray-400">{formState.slates[slateIndex].name}</span>
										<input
											type="number"
											min="0"
											max="100"
											step="1"
											class="text-sm"
											value={Math.round(blocCohesionArray[slateIndex] * 100)}
											oninput={(e) =>
												formState.updateBlocCohesion(
													e,
													blocIndex,
													slateIndex,
													Number(e.currentTarget.value) / 100
												)}
										/>
										<span>%</span>
									</label>
								{/each}
							</div>
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
									style={`--range-progress:${formState.slates[0].color}; --range-bg:${formState.slates[1].color};background-color:${formState.slates[1].color};padding:0;`}
									oninput={(e) =>
										formState.updateBlocCohesion(e, blocIndex, 0, Number(e.currentTarget.value))}
								/>
							</label>
						</div>
					</div>
				{:else}
					<!-- grid of slates -->
					<div
						class={`grid ${GRID_STYLE_MAP[formState.slates.length as keyof typeof GRID_STYLE_MAP]} gap-2`}
					>
						{#each blocCohesionArray as cohesion, slateIndex}
							<label class="relative flex flex-grow flex-col items-start justify-end text-xs">
								<span class="text-gray-400">{formState.slates[slateIndex].name}</span>
								<label class="input input-sm my-2 w-full">
									<input
										type="number"
										min="0"
										max="100"
										step="1"
										class="min-w-18 grow text-sm"
										value={Math.round(cohesion * 100)}
										oninput={(e) =>
											formState.updateBlocCohesion(
												e,
												blocIndex,
												slateIndex,
												Number(e.currentTarget.value) / 100
											)}
									/>
									<span>%</span>
								</label>
								{#if formState.slates.length > 2}
									<span
										class="pointer-events-none absolute left-0 rounded-full"
										style={`
											height: 16px; 
											bottom:0px; 
											border:2px dotted ${COLOR_MAP.SLATES[slateIndex]}88; 
											border-white:2px; 
											width:${(1 - formState.blocCohesionSum[blocIndex] + cohesion) * 100}%;
											visibility:${1 - formState.blocCohesionSum[blocIndex] + cohesion > 0 ? 'visible' : 'hidden'};
										`}
									></span>
								{/if}
								<input
									type="range"
									min="0"
									max="100"
									step="1"
									class={`range w-full range-xs`}
									value={Math.round(cohesion * 100)}
									style={`
										--range-progress:${formState.slates[slateIndex].color}; 
										--range-bg:${formState.blocCohesionSum[blocIndex] === 1 ? formState.slates[slateIndex].color + '11' : 'lightgray'};
										transition:all 0.3s ease;
										padding:0;
									`}
									oninput={(e) =>
										formState.updateBlocCohesion(
											e,
											blocIndex,
											slateIndex,
											Number(e.currentTarget.value) / 100
										)}
								/>
							</label>
						{/each}
					</div>
				{/if}
				<div
					class={`mt-2 pl-6 text-xs ${formState.blocCohesionSum[blocIndex] < 1 ? 'text-amber-500' : 'text-slate-500'}`}
				>
					{#if formState.slates.length > 2}
						Sum: {(formState.blocCohesionSum[blocIndex] * 100).toFixed(1)}%
					{/if}
				</div>
			</li>
		{/each}
	</ul>
</div>
