<script lang="ts">
	import VoterBlocCohesion from './VoterBlocCohesion.svelte';
	import VoterBlocsDetailList from './VoterBlocsDetailList.svelte';
	import VoterBlocCandidateStrength from './VoterBlocCandidateStrength.svelte';
	import VoterBlocBasicSettings from './VoterBlocBasicSettings.svelte';
</script>

<div class="card bg-base-100 p-4 shadow-sm">
	<VoterBlocBasicSettings />
	<VoterBlocsDetailList />
	<VoterBlocCandidateStrength />
	<VoterBlocCohesion />
</div>
