<script lang="ts">
	import { formState } from '$lib/stores/formStore.svelte';
</script>

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
				oninput={(e) => formState.updateNumVoterBlocs(Number(e.currentTarget.value))}
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
			onclick={() => (formState.voterBlocMode = 'count')}
		>
			Count of voters
		</button>
		<button
			type="button"
			class="btn btn-soft btn-sm {formState.voterBlocMode === 'share'
				? 'btn-primary'
				: 'btn-secondary'}"
			onclick={() => (formState.voterBlocMode = 'share')}
		>
			Share of total population
		</button>
		<fieldset class="fieldset mt-2">
			<label class="label">
				<input type="checkbox" class="checkbox" bind:checked={formState.showTurnoutSettings} />
				Show turnout settings
			</label>
		</fieldset>
	</div>
</div>
