<script lang="ts">
	import VoterBlocBasicSettings from './VoterBlocBasicSettings.svelte';
	import VoterBlocCandidateStrength from './VoterBlocCandidateStrength.svelte';
	import VoterBlocCohesion from './VoterBlocCohesion.svelte';
	import VoterBlocsDetailList from './VoterBlocsDetailList.svelte';
</script>

<div class="card bg-base-100 p-4 shadow-sm" id="voter-blocs">
	<div id="voter-blocs-basic-settings">
		<VoterBlocBasicSettings />
		<VoterBlocsDetailList />
	</div>
	<VoterBlocCandidateStrength />
	<VoterBlocCohesion />
</div>
