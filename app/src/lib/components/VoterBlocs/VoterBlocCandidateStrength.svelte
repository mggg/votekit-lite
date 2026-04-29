<script lang="ts">
	import { COLOR_MAP } from '$lib/constants';
	import { formState, type FormState } from '$lib/stores/formStore.svelte';
	import PalettePip from '../PalettePip.svelte';

	let useAlphaInput = $state(false);

	const PREFERENCE_OPTIONS = [
		{ value: 2, label: 'No' },
		{ value: 1, label: 'Unknown' },
		{ value: 0.5, label: 'Yes' }
	];

	function setPreference(
		blocIndex: number,
		slateIndex: number,
		value: number
	) {
		formState.blocPreferences[blocIndex][slateIndex] = value;
	}
</script>

<!-- Candidate strength breakdown -->
<div class="mt-4" id="voter-blocs-candidate-strength">
	<div class="mb-2 flex flex-row items-center">
		<h3 class="mb-2 text-sm font-medium text-slate-700">Candidate strength</h3>
		<button
			type="button"
			class="btn btn-xs ml-auto mr-20 {useAlphaInput ? 'btn-primary text-white' : 'btn-ghost border-purple-500 text-slate-600'}"
			onclick={() => (useAlphaInput = !useAlphaInput)}
		>
			{useAlphaInput ? 'Use Preset Options' : 'Specify Dirichlet Alpha'}
		</button>
	</div>
	<p class="mb-2 text-xs text-slate-500">
		Do voters from each bloc favor a strong candidate from each slate?
	</p>
	{#if useAlphaInput}
		<div class="flex flex-row">
			<div class="grid grid-cols-2 gap-20">
					<p class="mb-2 mt-1 text-xs text-gray-400">
							Enter a positive number to specify the Dirichlet alpha parameter for each bloc's preferences towards candidates in each slate. <br/>
					</p>
					<p class="mb-2 mt-1 text-xs text-gray-400">
							α closer to 0 ⇒ Stronger candidate<br/>
							α greater than 1 ⇒ Candidate indifference<br/>
							α = 1 ⇒ Candidate strength is unknown
					</p>
			</div>
		</div>
	{/if}
	<ul class="list px-0">
		{#each formState.blocs as bloc, blocIndex}
			<li class="p-0">
				<div class={`${formState.slates.length > 3 ? 'flex-col' : 'flex-row'} flex`}>
					<div class="col-span-4 flex flex-row items-center gap-2">
						<PalettePip color={bloc.color} onChange={(color: string) => (bloc.color = color)} />
						<span class="col-span-2">Do {bloc.name} voters have a strong preference towards...</span
						>
					</div>
					<div class="list-row list-row-sm pt-2 pb-4">
						<div
							class="grid w-full items-center gap-2 pl-2"
							style={`grid-template-columns: repeat(${formState.slates.length}, 1fr);`}
						>
							{#each Array(formState.slates.length) as _, slateIndex}
								<label
									class="block flex h-full flex-col justify-center rounded-md p-2 px-4 text-center text-xs"
									style={`border: 2px solid ${formState.slates[slateIndex].color}; background-color: ${formState.slates[slateIndex].color}01`}
								>
									<span>{formState.slates[slateIndex].name} candidates</span>
									{#if useAlphaInput}
										<input
											type="number"
											min="0.01"
											max="100"
											step="any"
											class="w-full min-w-0 text-sm invalid:border-2 invalid:border-red-500"
											placeholder="0.01 to 100"
											value={formState.blocPreferences[blocIndex][slateIndex]}
											oninput={(e) => {
												const raw = e.currentTarget.value;
												const value = Number(raw);

												if (raw === "") return;

												if (value >= 0.01 && value <= 100) {
													setPreference(blocIndex, slateIndex, value);
												}
											}}
										/>
									{:else}
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
													onclick={() =>
														setPreference(
															blocIndex,
															slateIndex,
															opt.value
														)}
												>
													{opt.label}
												</button>
											{/each}
										</div>
									{/if}
								</label>
							{/each}
						</div>
					</div>
				</div>
			</li>
		{/each}
	</ul>
</div>
