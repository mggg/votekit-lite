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

<div class="card overflow-y-auto bg-base-100 p-4 text-sm text-slate-600 shadow-sm" id="preview">
	<ResultCardDetails {run} />
</div>
