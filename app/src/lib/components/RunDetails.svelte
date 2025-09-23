<script lang="ts">
	import { formState } from '$lib/stores/formStore.svelte';
	import { PUBLIC_CAPTCHA_KEY } from '$env/static/public';
	import Recaptcha from './Recaptcha.svelte';
</script>

<div class="card bg-base-100 p-4 shadow-sm w-full max-w-none">
	<h2 class="mb-2 text-lg font-semibold text-slate-800">Run details</h2>
	<label class="input input-sm w-full">
		<span class="text-gray-400">Run name</span>
		<input class="grow text-sm w-full" bind:value={formState.name} />
	</label>
	<label class="input input-sm my-2 w-full">
		<span class="text-gray-400">Number of trials</span>
		<input type="number" min="1" class="grow text-sm" bind:value={formState.trials} />
	</label>
	<Recaptcha
		siteKey={PUBLIC_CAPTCHA_KEY}
		onVerify={(token) => (formState.recaptchaToken = token)}
		onExpired={() => (formState.recaptchaToken = '')}
	/>
	<button
		class="btn btn-primary btn-soft btn-block mt-2"
		on:click={formState.submitMock}
		disabled={!formState.recaptchaToken.length || formState.unallocatedPopulation > 0}
	>
		Run simulation (mock)
	</button>
	<p class="mt-2 text-xs text-slate-500">This saves a mock run and takes you to Results.</p>
</div>
