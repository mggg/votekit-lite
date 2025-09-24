<script lang="ts">
	import { formState } from '$lib/stores/formStore.svelte';
	import { COLOR_MAP } from '$lib/constants';
	import PalettePip from '../PalettePip.svelte';
</script>

<!-- Cohesion sliders as a list -->
<div class="mt-4">
	<h3 class="mb-2 text-sm font-medium text-slate-700">Cohesion</h3>
	<ul class="list px-0">
		{#each formState.blocCohesion as blocCohesionArray, blocIndex}
			<li class="list-row list-row-sm flex flex-col gap-2 py-3">
				<div class="flex flex-row items-center gap-2">
					<PalettePip color={COLOR_MAP.BLOCS[blocIndex]} />
					<span class="font-medium">{formState.blocs[blocIndex].name} voters</span>
					<span class="ml-2 text-xs text-slate-500">
						{#if formState.slates.length > 2}
							(must sum to 100%)
						{/if}
					</span>
				</div>
				<div class="flex flex-row flex-wrap gap-2 pl-6">
					{#if blocCohesionArray.length <= 2}
						<div class="flex flex-col w-full">
							<div class="space-between flex flex-row w-full justify-between">
								{#each formState.slates as slate, slateIndex}
								<label class="input input-sm my-2 max-w-36">
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
												Number(e.currentTarget.value)/100
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
									class={`range range-xs w-full`}
									value={blocCohesionArray[0]}
									style={`--range-progress:${COLOR_MAP.SLATES[0]}; --range-bg:${COLOR_MAP.SLATES[1]};background-color:${COLOR_MAP.SLATES[1]};padding:0;`}
									oninput={(e) =>
										formState.updateBlocCohesion(e, blocIndex, 0, Number(e.currentTarget.value))}
								/>
							</label>
						</div>
					{:else}
						<div class="relative w-full"></div>
						{#each blocCohesionArray as cohesion, slateIndex}
							<label class="relative flex flex-grow flex-col items-start text-xs">
								<label class="input input-sm my-2 w-full">
									<span class="text-gray-400">{formState.slates[slateIndex].name}</span>
									<input
										type="number"
										min="0"
										max="100"
										step="1"
										class="grow text-sm"
										value={Math.round(cohesion * 100)}
										oninput={(e) =>
											formState.updateBlocCohesion(
												e,
												blocIndex,
												slateIndex,
												Number(e.currentTarget.value)/100
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
									class={`range range-xs w-full`}
									value={Math.round(cohesion * 100)}
									style={`
										--range-progress:${COLOR_MAP.SLATES[slateIndex]}; 
										--range-bg:${formState.blocCohesionSum[blocIndex]  === 1 ? COLOR_MAP.SLATES[slateIndex]+'11' : 'lightgray'};
										transition:all 0.3s ease;
										padding:0;
									`}
									oninput={(e) =>
										formState.updateBlocCohesion(
											e,
											blocIndex,
											slateIndex,
											Number(e.currentTarget.value)/100
										)}
								/>
							</label>
						{/each}
					{/if}
				</div>
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
