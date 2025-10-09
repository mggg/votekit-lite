<script lang="ts">
	import { formState } from '$lib/stores/formStore.svelte';
	import { formatConfig } from '$lib/stores/utils';
	import ResultCardDetails from './ResultsCard/ResultCardDetails.svelte';
	const run = $derived({
		name: formState.name,
		id: '--',
		config: formatConfig('--', formState)
	});
</script>

<div class="card bg-base-100 p-4 text-sm text-slate-600 shadow-sm">
	<ResultCardDetails {run} compact={true} />
</div>
