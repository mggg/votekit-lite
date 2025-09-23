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
			<li class="pt-4">
				<div class={`${formState.slates.length > 3 ? 'flex-col' : 'flex-row'} flex`}>
					<div class="col-span-4 flex flex-row items-center gap-2">
						<PalettePip color={COLOR_MAP.BLOCS[blocIndex]} />
						<span class="col-span-2">Do {bloc.name} voters have a strong preference towards...</span
						>
					</div>
					<div class="list-row list-row-sm pb-4 pt-2">
						<div class="flex w-full flex-row items-center gap-2 pl-2">
							{#each Array(formState.slates.length) as _, slateIndex}
								<label class="block text-xs">
									<span
										style={`border-left: 4px solid ${COLOR_MAP.SLATES[slateIndex]}; padding-left: 4px`}
										>{formState.slates[slateIndex].name} candidates</span
									>
									<select class="select select-sm mt-1">
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
