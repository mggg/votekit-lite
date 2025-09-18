<script lang="ts">
  import { formState, MAX_CANDIDATES } from '$lib/stores/formStore.svelte';

</script>

<div class="rounded-2xl border border-slate-200/70 bg-white/70 p-3 shadow-sm backdrop-blur">
  <h2 class="mb-2 text-lg font-semibold text-slate-800">Election details</h2>
  
  <!-- Number of seats (moved up) -->
  <div class="mb-3">
    <label class="block text-sm">Number of seats
      <input 
        type="number" 
        min={formState.stvMin} 
        max={formState.stvMax} 
        class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" 
        bind:value={formState.stvNumSeats}
      />
    </label>
    <div class="mt-1 text-xs text-slate-500">
      <span>Seats must be between {formState.stvMin} and total candidates ({formState.totalCandidates}).</span>
      {#if formState.stvNumSeats === formState.stvMin}
        <span class="ml-2 text-amber-600">Minimum reached</span>
      {/if}
      {#if formState.stvNumSeats === formState.stvMax}
        <span class="ml-2 text-amber-600">Maximum reached</span>
      {/if}
    </div>
  </div>

  <!-- Max candidates that can be ranked -->
  <div class="mb-3">
    <label class="block text-sm">Maximum ballot length
      <input 
        type="number" 
        min="1" 
        max={formState.totalCandidates} 
        class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" 
        bind:value={formState.maxRankingCandidatesInput}
      />
    </label>
    <div class="mt-1 text-xs text-slate-500">
      Must be ≤ total number of candidates ({formState.totalCandidates})
    </div>
  </div>

  <!-- Number of slates -->
  <div class="mb-3">
    <label class="block text-sm">Number of slates
      <input 
        type="number" 
        min="1" 
        max={MAX_CANDIDATES === formState.totalCandidates ? formState.slates.length : 5} 
        class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" 
        value={formState.slates.length}
        on:input={(e) => e.target?.value && formState.updateNumSlates(Number(e.target.value))}
      />
    </label>
    <div class="mt-1 text-xs text-slate-500">
      Positive integer less than or equal to 5
    </div>
  </div>

  <!-- Number of candidates per slate -->
  <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
    {#each formState.slates as slate, index}
      <div class="space-y-2">
        <label class="block text-sm">Slate name
          <input 
            type="text" 
            class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" 
            bind:value={slate.name}
          />
        </label>
        <label class="block text-sm">Number of candidates
          <input 
            type="number" 
            min="1" 
            max={slate.numCandidates + formState.remainingCandidates} 
            class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" 
            bind:value={slate.numCandidates}
          />
        </label>
      </div>
    {/each}
  </div>
  <div class="mt-1 flex items-center justify-between text-xs text-slate-500">
    <span>Total candidates: {formState.totalCandidates} out of a maximum of {MAX_CANDIDATES}</span>
    {#if formState.totalCandidates >= MAX_CANDIDATES}
      <span class="text-amber-600">Maximum of {MAX_CANDIDATES} candidates reached</span>
    {/if}
  </div>
</div>
