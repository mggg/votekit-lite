<script lang="ts">
	import { onMount } from 'svelte';
	import { formState } from '$lib/stores/formStore.svelte';
	import TwoByTwoIntro from '$lib/components/TwoByTwo/TwoByTwoIntro.svelte';
	import TwoByTwoNaming from '$lib/components/TwoByTwo/TwoByTwoNaming.svelte';
	import TwoByTwoBlocAttributes from '$lib/components/TwoByTwo/TwoByTwoBlocAttributes.svelte';
	import TwoByTwoElectionDetails from '$lib/components/TwoByTwo/TwoByTwoElectionDetails.svelte';
	import TwoByTwoCandidatePools from '$lib/components/TwoByTwo/TwoByTwoCandidatePools.svelte';
	import TwoByTwoVoterBehavior from '$lib/components/TwoByTwo/TwoByTwoVoterBehavior.svelte';
	import TwoByTwoCandidateStrength from '$lib/components/TwoByTwo/TwoByTwoCandidateStrength.svelte';
	import RunDetails from '$lib/components/RunDetails.svelte';
	import Preview from '$lib/components/Preview.svelte';
	import WelcomeModal from '$lib/components/Onboarding/WelcomeModal.svelte';
	import Tour from '$lib/components/Onboarding/Tour.svelte';

	onMount(() => {
		// Lock to 2 blocs and 2 slates
		if (formState.blocs.length !== 2) {
			formState.updateNumVoterBlocs(2);
		}
		if (formState.slates.length !== 2) {
			formState.updateNumSlates(2);
		}
	});
	import { tourState } from '$lib/stores/tourStore.svelte';
</script>

<div class="grid grid-cols-1 gap-4 lg:grid-cols-3 {tourState.isTouring ? 'touring' : ''}">
	<div class="space-y-4 lg:col-span-2">
		<TwoByTwoIntro />
		<TwoByTwoNaming />
		<TwoByTwoBlocAttributes />
		<TwoByTwoVoterBehavior />
		<TwoByTwoElectionDetails />
	</div>

	<div>
		<div
			class="sticky top-24 space-y-3 {tourState.isTouring
				? 'touring overflow-visible'
				: 'overflow-y-auto'}"
			style="max-height: calc(100vh - 96px);"
		>
			<RunDetails />
			<Preview />
		</div>
	</div>
</div>
