<script lang="ts">
	import { formState } from '$lib/stores/formStore.svelte';
</script>

<div class="card bg-base-100 p-4 shadow-sm">
	<h2 class="mb-2 text-lg font-semibold text-slate-800">Voter behavior</h2>
	<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
		<button
			type="button"
			class="btn h-auto justify-start text-left btn-soft {formState.ballotGenerator === 'sPL'
				? 'btn-primary'
				: 'btn-secondary'}"
			onclick={() => (formState.ballotGenerator = 'sPL')}
		>
			<div class="text-left">
				<div class="font-medium">Impulsive voter</div>
				<div class="mt-1 text-xs text-slate-600">
					Makes quick picks based on slate preference, with little deliberation.
				</div>
			</div>
		</button>
		<button
			type="button"
			class="btn h-auto justify-start text-left btn-soft {formState.ballotGenerator === 'sBT'
				? 'btn-primary'
				: 'btn-secondary'}"
			onclick={() => (formState.ballotGenerator = 'sBT')}
		>
			<div class="text-left">
				<div class="font-medium">Deliberative voter</div>
				<div class="mt-1 text-xs text-slate-600">
					Adjusts the list if needed to better align with overall slate preference.
				</div>
			</div>
		</button>
		<button
			type="button"
			class="btn relative h-auto justify-start text-left btn-soft {formState.ballotGenerator ===
			'CS'
				? 'btn-primary'
				: 'btn-secondary'} {!formState.isCambridgeValid ? 'cursor-not-allowed opacity-50' : ''}"
			onclick={() => formState.isCambridgeValid && (formState.ballotGenerator = 'CS')}
			disabled={!formState.isCambridgeValid}
		>
			{#if !formState.isCambridgeValid}
				<div class="absolute inset-0 flex items-center justify-center rounded-lg bg-red-500/20">
					<svg class="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="3"
							d="M6 18L18 6M6 6l12 12"
						></path>
					</svg>
				</div>
			{/if}
			<div class="text-left {!formState.isCambridgeValid ? 'opacity-30' : ''}">
				<div class="font-medium">Cambridge voter</div>
				<div class="mt-1 text-xs text-slate-600">
					Follows patterns drawn from historical Cambridge city council ballots.
				</div>
			</div>
		</button>
	</div>
</div>
