<script lang="ts">
	import { formState } from '$lib/stores/formStore.svelte.ts';
</script>

<div class="rounded-2xl border border-slate-200/70 bg-white/70 p-3 shadow-sm backdrop-blur">
	<h2 class="mb-2 text-lg font-semibold text-slate-800">Run details</h2>
	<label class="block text-sm"
		>Run name
		<input
			class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200"
			bind:value={formState.name}
		/>
	</label>
	<label class="mt-2 block text-sm"
		>Number of trials
		<input
			type="number"
			min="1"
			class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200"
			bind:value={formState.trials}
		/>
	</label>
	<label class="mt-2 flex items-center gap-2 text-sm">
		<input type="checkbox" bind:checked={formState.recaptchaChecked} class="accent-indigo-600" />
		I'm not a robot (mock reCAPTCHA)
	</label>
	<button
		class="mt-2 w-full rounded-full bg-indigo-600/90 px-4 py-2 text-white shadow-sm transition hover:bg-indigo-600 disabled:opacity-40"
		on:click={formState.submitMock}
		disabled={!formState.recaptchaChecked}
	>
		Run simulation (mock)
	</button>
	<p class="mt-2 text-xs text-slate-500">This saves a mock run and takes you to Results.</p>
</div>
