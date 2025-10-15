<script lang="ts">
	import { onMount } from 'svelte';
	import { formState } from '$lib/stores/formStore.svelte';
	import ElectionMethod from '$lib/components/ElectionMethod.svelte';
	import ElectionDetails from '$lib/components/ElectionDetails.svelte';
	import VoterBlocs from '$lib/components/VoterBlocs/VoterBlocs.svelte';
	import VoterBehavior from '$lib/components/VoterBehavior.svelte';
	import RunDetails from '$lib/components/RunDetails.svelte';
	import Preview from '$lib/components/Preview.svelte';
	import WelcomeModal from '$lib/components/Onboarding/WelcomeModal.svelte';
	import Tour from '$lib/components/Onboarding/Tour.svelte';
	onMount(() => {
		formState.initialize();
	});
	import { tourState } from '$lib/stores/tourStore.svelte';
</script>

<div class="grid grid-cols-1 gap-4 lg:grid-cols-3 {tourState.isTouring ? 'touring' : ''}">
	<div class="space-y-4 lg:col-span-2">
		<ElectionMethod />
		<ElectionDetails />
		<VoterBlocs />
		<VoterBehavior />
	</div>

	<div>
		<div
			class="sticky top-20 space-y-3 overflow-y-auto {tourState.isTouring ? 'touring' : ''}"
			style="max-height: calc(100vh - 96px);"
		>
			<RunDetails />
			<Preview />
		</div>
	</div>
</div>

<WelcomeModal />
<Tour />
