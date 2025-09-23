<script lang="ts">
	import { formState } from '$lib/stores/formStore.svelte';
</script>

<div class="card bg-base-100 p-4 shadow-sm">
    <h2 class="mb-2 text-lg font-semibold text-slate-800">Run details</h2>
    <label class="input input-sm">
        <span class="text-gray-400">Run name</span>
        <input class="grow text-sm" bind:value={formState.name} />
    </label>
    <label class="mt-2 input input-sm">
        <span class="text-gray-400">Number of trials</span>
        <input type="number" min="1" class="grow text-sm" bind:value={formState.trials} />
    </label>
    <label class="mt-2 label text-sm">
        <input type="checkbox" class="checkbox" bind:checked={formState.recaptchaChecked} />
        I'm not a robot (mock reCAPTCHA)
    </label>
    <button
        class="btn btn-primary btn-soft btn-block mt-2"
        on:click={formState.submitMock}
        disabled={!formState.recaptchaChecked || formState.unallocatedPopulation > 0}
    >
        Run simulation (mock)
    </button>
    <p class="mt-2 text-xs text-slate-500">This saves a mock run and takes you to Results.</p>
</div>
