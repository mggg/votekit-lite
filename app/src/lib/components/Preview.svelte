<script lang="ts">
  import { formState } from '$lib/stores/formStore.svelte';
</script>

<div class="card bg-base-100 p-4 text-sm text-slate-600 shadow-sm">
  <p class="font-medium">Preview:</p>
  <div class="mt-2 space-y-1 text-xs">
    <div><strong>Election style:</strong> {formState.system === 'blocPlurality' ? 'Bloc plurality' : 'Single transferable vote (STV)'}</div>
    <div><strong>Voter blocs:</strong> {formState.blocs.map((bloc) => `${bloc.name}: ${bloc.population * bloc.turnout} voters`).join(', ')}</div>
    <div><strong>Cohesion:</strong></div>
    {#each formState.blocs as bloc, blocIndex}
      <div class="ml-2">{bloc.name} voters: {formState.blocCohesion[blocIndex].map((cohesion, index) => (cohesion * 100).toFixed(0) + '% to ' + formState.slates[index].name).join(', ')}</div>
    {/each}
    <div><strong>Candidate strength:</strong></div>
    {#each formState.blocPreferences as preferences, blocIndex}
      {#each preferences as preference, slateIndex}
        <div class="ml-2">Do {formState.blocs[blocIndex].name} voters have preferred {formState.slates[slateIndex].name} candidates: {preference === 'strong' ? 'yes' : preference === 'indifferent' ? 'no' : 'unknown'}</div>
      {/each}
    {/each}
      <div><strong>Candidate pool:</strong> {formState.slates.map((slate) => `${slate.name} fields ${slate.numCandidates} candidates`).join(', ')}</div>
    <div><strong>Behavior:</strong> {formState.ballotGenerator === 'sPL' ? 'Impulsive voting' : formState.ballotGenerator === 'sBT' ? 'Deliberative voting' : 'Cambridge-style voting'}</div>
    <div><strong>Number of simulated elections:</strong> {formState.trials}</div> 
  </div>
</div>
