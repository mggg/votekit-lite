<script lang="ts">
	import OptionCard from '$lib/components/OptionCard.svelte';
	import { formState, type FormState } from '$lib/stores/formStore.svelte';
	import type { VotekitConfig } from '$lib/types/votekitConfig';
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

	const VOTER_BEHAVIOR_OPTIONS: {
		value: VotekitConfig['ballotGenerator'];
		name: string;
		description: string;
	}[] = [
		{
			value: 'sPL',
			name: 'Impulsive voter',
			description: 'Makes quick picks based on slate preference, with little deliberation.'
		},
		{
			value: 'sBT',
			name: 'Deliberative voter',
			description: 'Adjusts the list if needed to better align with overall slate preference.'
		},
		{
			value: 'CS',
			name: 'Cambridge voter',
			description: 'Follows patterns drawn from historical Cambridge city council ballots.'
		}
	];
</script>

<div class="card bg-base-100 p-4 shadow-sm">
	<div class="flex flex-row gap-2">
		<h2 class="mb-2 text-lg font-semibold text-slate-800">Voter behavior</h2>
		<div class="dropdown dropdown-top">
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div tabindex="0" role="button" class="btn btn-xs">?</div>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<ul
				tabindex="0"
				class="dropdown-content disabled z-1 w-72 rounded-box bg-gray-100 p-4 text-sm shadow-xl"
			>
				<li class="max-w-none py-2">
					<p>
						The impulsive voter setting uses the <a
							class="inline underline"
							href="https://votekit-dev-docs.readthedocs.io/en/latest/social_choice_docs/scr/#slate-plackett-luce"
							target="_blank"
							rel="noopener noreferrer">Slate Plackett-Luce</a
						> model.
					</p>
				</li>
				<li class="max-w-none py-2">
					<p>
						The deliberative voter setting uses the <a
							class="inline underline"
							href="https://votekit-dev-docs.readthedocs.io/en/latest/social_choice_docs/scr/#slate-bradley-terry"
							target="_blank"
							rel="noopener noreferrer">Slate Bradley-Terry</a
						> model.
					</p>
				</li>
				<li class="max-w-none py-2">
					<p>
						The Cambridge voter uses real voter behavior data from the <a
							class="inline underline"
							target="_blank"
							rel="noopener noreferrer"
							href="https://votekit-dev-docs.readthedocs.io/en/latest/social_choice_docs/scr/#cambridge-sampler"
						>
							Cambridge-Sampler.
						</a>
						This behavior can produce short ballots. Note: This behavior profile must have two slates
						and two blocs, which must be aligned to the same groups. The second bloc will correspond
						to voting behaviors for People of Color in Cambridge, MA.
					</p>
				</li>
			</ul>
		</div>
	</div>
	<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
		{#each VOTER_BEHAVIOR_OPTIONS as option}
			<OptionCard
				title={option.name}
				description={option.description}
				selected={formState.ballotGenerator === option.value}
				onSelect={() => (formState.ballotGenerator = option.value)}
			/>
		{/each}
	</div>
	<div class="mt-4">
		<div class="flex flex-row gap-2">
			<h3 class="text-md mb-2 font-medium">Voter cohesion</h3>
			<div class="dropdown dropdown-top">
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<div tabindex="0" role="button" class="btn btn-xs">?</div>
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<ul
					tabindex="0"
					class="dropdown-content disabled z-1 w-72 rounded-box bg-gray-100 p-4 text-sm shadow-xl"
				>
					<li class="max-w-none py-2">
						<p>
							Cohesion parameters determine how voters alternate between the slates when they rank.
							<br />
							<br />
							If the cohesion of group A is high, this means A voters are more likely to rank A candidates
							above B candidates. If it is low, they are more likely to "cross over" and rank Bs higher.
						</p>
					</li>
				</ul>
			</div>
		</div>
		<p class="mb-2 text-xs text-slate-500">
			How cohesive is each bloc -- i.e., how consistently do they lean towards the candidates
			preferred by the group?
		</p>
		<ul class="list px-0">
			{#each formState.blocCohesion.slice(0, 2) as blocCohesionArray, blocIndex}
				<li class="list-row list-row-sm flex flex-col gap-2 px-0 py-3">
					<div class="flex flex-row items-center gap-2">
						<PalettePip
							color={formState.blocs[blocIndex].color}
							onChange={(color: string) => {
								formState.blocs[blocIndex].color = color;
								formState.slates[blocIndex].color = color;
							}}
						/>
						<span class="font-medium"
							>{formState.blocs[blocIndex].name || `Group ${blocIndex + 1}`} voters</span
						>
					</div>
					<div class="flex flex-row gap-2 pl-6">
						<div class="flex w-full flex-col">
							<div class="space-between flex w-full flex-row justify-between">
								{#each formState.slates.slice(0, 2) as slate, slateIndex}
									<label class="input input-sm my-2 max-w-fit">
										<span class="text-gray-400"
											>{formState.slates[slateIndex].name || `Group ${slateIndex + 1}`}</span
										>
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
								<span class="sr-only mb-1">
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
				</li>
			{/each}
		</ul>
	</div>

	<div class="flex flex-row items-center gap-2">
		<h3 class="text-md my-2 font-medium">Candidate strength</h3>

		<div class="dropdown dropdown-top">
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div tabindex="0" role="button" class="btn btn-xs">?</div>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<ul
				tabindex="0"
				class="dropdown-content disabled z-1 w-72 rounded-box bg-gray-100 p-4 text-sm shadow-xl"
			>
				<li class="max-w-none py-2">
					<p>
						Candidate strength describes whether voters agree on the strong candidates within
						slates.
					</p>
				</li>
				<li class="max-w-none py-2">
					<p>
						If you answer "yes", this means that voters tend to agree that a certain candidate comes
						first within the slate.
					</p>
				</li>
				<li class="max-w-none py-2">
					<p>
						If you answer "no", this means the voters will tend to be more indifferent within the
						slate.
					</p>
				</li>
				<li class="max-w-none py-2">
					<p>
						If you answer "unknown", then we'll pick at random -- there could be a consensus strong
						candidate, indifference, or something in between.
					</p>
				</li>
			</ul>
		</div>
	</div>
	<p class="mb-2 text-xs text-slate-500">
		When voters from each bloc consider candidates from each slate, do they tend to view one strong
		candidate or are they indifferent between the options?
	</p>
	<ul class="list px-0">
		{#each formState.blocs.slice(0, 2) as bloc, blocIndex}
			<li class="p-0">
				<div class="flex flex-row">
					<div class="col-span-4 flex flex-row items-center gap-2">
						<PalettePip
							color={bloc.color}
							onChange={(color: string) => {
								bloc.color = color;
								formState.slates[blocIndex].color = color;
							}}
						/>
						<span class="col-span-2"
							>In the view of {bloc.name || `Group ${blocIndex + 1}`} voters, is there a clear strongest
							candidate among...</span
						>
					</div>
					<div class="list-row list-row-sm pt-2 pb-4">
						<div class="grid w-full grid-cols-2 items-center gap-2 pl-2">
							{#each Array(2) as _, slateIndex}
								<label
									class="block flex h-full flex-col justify-center rounded-md p-2 px-4 text-center text-xs"
									style={`border: 2px solid ${formState.slates[slateIndex].color}; background-color: ${formState.slates[slateIndex].color}01`}
								>
									<span
										>{formState.slates[slateIndex].name || `Group ${slateIndex + 1}`} preferred candidates</span
									>
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
