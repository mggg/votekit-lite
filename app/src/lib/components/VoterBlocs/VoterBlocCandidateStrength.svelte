<script lang="ts">
	import { formState } from '$lib/stores/formStore.svelte';
	import { COLOR_MAP } from '$lib/constants';
	import PalettePip from '../PalettePip.svelte';
</script>

<!-- Candidate strength breakdown -->
<div class="mt-4">
	<h3 class="mb-2 text-sm font-medium text-slate-700">Candidate strength</h3>
	<p class="mb-2 text-xs text-slate-500">
		How strongly do voters for each bloc prefer each candidate?
	</p>
	<ul class="list px-0">
		{#each formState.blocs as bloc, blocIndex}
			<li class="p-0">
				<div class={`${formState.slates.length > 3 ? 'flex-col' : 'flex-row'} flex`}>
					<div class="col-span-4 flex flex-row items-center gap-2">
						<PalettePip color={COLOR_MAP.BLOCS[blocIndex]} />
						<span class="col-span-2">Do {bloc.name} voters have a strong preference towards...</span
						>
					</div>
					<div class="list-row list-row-sm pt-2 pb-4">
						<div class="flex w-full flex-row items-center gap-2 pl-2">
							{#each Array(formState.slates.length) as _, slateIndex}
								<label
									class="block rounded-md p-2 text-xs"
									style={`border: 2px solid ${COLOR_MAP.SLATES[slateIndex]}; background-color: ${COLOR_MAP.SLATES[slateIndex]}11`}
								>
									<span>{formState.slates[slateIndex].name} candidates</span>
									<select
										class="select mt-1 select-sm"
										value={formState.blocPreferences[blocIndex][slateIndex]}
									>
										<option value="strong">Yes</option>
										<option value="all_bets_off">Unknown</option>
										<option value="unif">No</option>
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
