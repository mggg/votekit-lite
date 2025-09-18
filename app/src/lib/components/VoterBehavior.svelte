<script lang="ts">
	import { formState } from '$lib/stores/formStore.svelte';
</script>

<div class="rounded-2xl border border-slate-200/70 bg-white/70 p-3 shadow-sm backdrop-blur">
	<h2 class="mb-2 text-lg font-semibold text-slate-800">Voter behavior</h2>
	<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
		<button
			type="button"
			class="rounded-xl border border-slate-200/70 bg-white/60 p-3 text-left text-sm hover:bg-white/80 focus:outline-none {formState.ballotGenerator ===
			'sPL'
				? 'ring-2 ring-indigo-300'
				: ''}"
			on:click={() => (formState.ballotGenerator = 'sPL')}
		>
			<div class="font-medium">Impulsive voter</div>
			<div class="mt-1 text-xs text-slate-600">
				Makes quick picks based on slate preference, with little deliberation.
			</div>
		</button>
		<button
			type="button"
			class="rounded-xl border border-slate-200/70 bg-white/60 p-3 text-left text-sm hover:bg-white/80 focus:outline-none {formState.ballotGenerator ===
			'sBT'
				? 'ring-2 ring-indigo-300'
				: ''}"
			on:click={() => (formState.ballotGenerator = 'sBT')}
		>
			<div class="font-medium">Deliberative voter</div>
			<div class="mt-1 text-xs text-slate-600">
				Adjusts the list if needed to better align with overall slate preference.
			</div>
		</button>
		<button
			type="button"
			class="rounded-xl border border-slate-200/70 bg-white/60 p-3 text-left text-sm hover:bg-white/80 focus:outline-none {formState.ballotGenerator ===
			'CS'
				? 'ring-2 ring-indigo-300'
				: ''}"
			on:click={() => (formState.ballotGenerator = 'CS')}
		>
			<div class="font-medium">Cambridge voter</div>
			<div class="mt-1 text-xs text-slate-600">
				Follows patterns drawn from historical Cambridge city council ballots.
			</div>
		</button>
	</div>
</div>
