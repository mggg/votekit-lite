<script lang="ts">
	import { formState, type FormState } from '$lib/stores/formStore.svelte';
	import { COLOR_MAP } from '$lib/constants';
	import PalettePip from '../PalettePip.svelte';

	const PREFERENCE_OPTIONS = [
		{ value: 'unif', label: 'No' },
		{ value: 'all_bets_off', label: 'Unknown' },
		{ value: 'strong', label: 'Yes' }
	];

	function setPreference(
		blocIndex: number,
		slateIndex: number,
		value: FormState['blocPreferences'][number][number]
	) {
		formState.blocPreferences[blocIndex][slateIndex] = value;
	}
</script>

<!-- Candidate strength breakdown -->
<div class="mt-4">
	<h3 class="mb-2 text-sm font-medium text-slate-700">Candidate strength</h3>
	<p class="mb-2 text-xs text-slate-500">
		Do voters from each bloc favor a strong candidate from each slate?
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
									class="block rounded-md p-2 px-4 text-xs"
									style={`border: 2px solid ${COLOR_MAP.SLATES[slateIndex]}; background-color: ${COLOR_MAP.SLATES[slateIndex]}01`}
								>
									<span>{formState.slates[slateIndex].name} candidates</span>
									<div class="join inline-flex w-full justify-center">
										{#each PREFERENCE_OPTIONS as opt}
											<button
												type="button"
												class="btn join-item p-1 btn-soft btn-xs {formState.blocPreferences[
													blocIndex
												][slateIndex] === opt.value
													? 'btn-primary'
													: ''}"
												aria-pressed={formState.blocPreferences[blocIndex][slateIndex] ===
													opt.value}
												on:click={() =>
													setPreference(
														blocIndex,
														slateIndex,
														opt.value as FormState['blocPreferences'][number][number]
													)}
											>
												{opt.label}
											</button>
										{/each}
									</div>
								</label>
							{/each}
						</div>
					</div>
				</div>
			</li>
		{/each}
	</ul>
</div>
