<script lang="ts">
	// formState passed in
	import { formState, type FormState } from '$lib/stores/formStore.svelte';
	import OptionCard from '$lib/components/OptionCard.svelte';
	import { ELECTION_SYSTEM_MAP } from '$lib/constants';
</script>

<div class="card bg-base-100 p-4 shadow-sm">
	<h2 class="mb-2 text-lg font-semibold text-slate-800">Election method</h2>
	<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
		{#each Object.entries(ELECTION_SYSTEM_MAP) as [system, systemData]}
			<OptionCard
				title={systemData.name}
				description={systemData.description}
				selected={formState.system === system}
				onSelect={() => (formState.system = system as FormState['system'])}
			/>
		{/each}
	</div>
</div>
