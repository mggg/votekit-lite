<script lang="ts">
  import { onMount } from 'svelte';
	import { formState } from '$lib/stores/formStore.svelte';
  import ElectionMethod from '$lib/components/ElectionMethod.svelte';
  import ElectionDetails from '$lib/components/ElectionDetails.svelte';
  import VoterBlocs from '$lib/components/VoterBlocs.svelte';
  import VoterBehavior from '$lib/components/VoterBehavior.svelte';
  import RunDetails from '$lib/components/RunDetails.svelte';
  import Preview from '$lib/components/Preview.svelte';

  onMount(() => {
    formState.initialize();
  });
</script>

<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
  <div class="lg:col-span-2 space-y-4">
    <ElectionMethod />
    <ElectionDetails />
    <VoterBlocs />
    <VoterBehavior />
  </div>

  <div class="space-y-3">
    <RunDetails />
    <Preview />
  </div>
</div>
