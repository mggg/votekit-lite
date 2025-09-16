<script lang="ts">
  import { randomRunName, saveRun, mockHistogramData, type Run } from '$lib';
  import { onMount } from 'svelte';
  import OptionCard from '$lib/components/OptionCard.svelte';

  let name = '';
  let trials = 100;

  // Voter blocs (counts instead of proportions)
  let blocACount = 50;
  let blocBCount = 50;
  
  // Voter bloc mode toggle
  let voterBlocMode: 'count' | 'share' = 'count';
  let totalVoters = 100;
  let blocAShare = 0.5;
  let blocBShare = 0.5;
  
  // Advanced voter settings
  let showAdvancedVoterSettings = false;
  let blocAPopulation = 10000;
  let blocBPopulation = 10000;
  let blocATurnout = 1.0;
  let blocBTurnout = 1.0;

  // Candidate preference (per bloc, cross-preferences), default to 'random' (all bets are off)
  type VoterPreference = 'strong' | 'random' | 'indifferent';
  let blocAPrefForA: VoterPreference = 'random';
  let blocAPrefForB: VoterPreference = 'random';
  let blocBPrefForB: VoterPreference = 'random';
  let blocBPrefForA: VoterPreference = 'random';

  // Cohesion (0-1 range) - arrays for dynamic slates
  let blocACohesion = [0.7, 0.7]; // A voters' cohesion to each slate
  let blocBCohesion = [0.7, 0.7]; // B voters' cohesion to each slate

  // Slates
  let numSlates = 2;
  let slateCandidates = [3, 3]; // Array to hold candidates per slate

  const MAX_CANDIDATES = 12;
  $: totalCandidates = slateCandidates.reduce((sum, count) => sum + count, 0);
  $: maxRankingCandidates = totalCandidates;

  // Election
  let mode: 'plurality' | 'multiseat' = 'multiseat';
  let ballotGenerator: 'sBT' | 'sPL' | 'CS' = 'sPL';
  let stvNumSeats = 5;
  let maxRankingCandidatesInput = 6;
  $: stvMin = 2;
  $: stvMax = Math.max(stvMin, totalCandidates);
  $: if (mode === 'multiseat') {
    if (stvNumSeats < stvMin) stvNumSeats = stvMin;
    if (stvNumSeats > stvMax) stvNumSeats = stvMax;
  }
  $: if (maxRankingCandidatesInput > totalCandidates) {
    maxRankingCandidatesInput = totalCandidates;
  }
  
  // Share calculations
  $: if (voterBlocMode === 'share') {
    blocACount = Math.round(totalVoters * blocAShare);
    blocBCount = Math.round(totalVoters * blocBShare);
  }
  
  // Advanced settings: update voter counts when turnout changes in count mode
  $: if (voterBlocMode === 'count' && showAdvancedVoterSettings) {
    blocACount = Math.round(blocAPopulation * blocATurnout);
    blocBCount = Math.round(blocBPopulation * blocBTurnout);
  }
  
  // Ensure shares add to 1
  $: if (voterBlocMode === 'share' && blocAShare + blocBShare !== 1) {
    blocBShare = 1 - blocAShare;
  }
  
  // Handle dynamic slate creation
  $: if (numSlates !== slateCandidates.length) {
    if (numSlates > slateCandidates.length) {
      // Add new slates
      for (let i = slateCandidates.length; i < numSlates; i++) {
        slateCandidates = [...slateCandidates, 1];
      }
    } else {
      // Remove excess slates
      slateCandidates = slateCandidates.slice(0, numSlates);
    }
  }
  
  // Handle dynamic cohesion arrays
  $: if (numSlates !== blocACohesion.length) {
    if (numSlates > blocACohesion.length) {
      // Add new cohesion values (distribute remaining evenly)
      const currentSum = blocACohesion.reduce((sum, val) => sum + val, 0);
      const remaining = Math.max(0, 1 - currentSum);
      const newSlatesCount = numSlates - blocACohesion.length;
      const newValue = newSlatesCount > 0 ? remaining / newSlatesCount : 0;
      const newValues = new Array(newSlatesCount).fill(newValue);
      blocACohesion = [...blocACohesion, ...newValues];
      blocBCohesion = [...blocBCohesion, ...newValues];
    } else {
      // Remove excess cohesion values and renormalize
      const truncatedA = blocACohesion.slice(0, numSlates);
      const truncatedB = blocBCohesion.slice(0, numSlates);
      
      // Renormalize to sum to 1
      const sumA = truncatedA.reduce((sum, val) => sum + val, 0);
      const sumB = truncatedB.reduce((sum, val) => sum + val, 0);
      
      blocACohesion = sumA > 0 ? truncatedA.map(val => val / sumA) : new Array(numSlates).fill(1 / numSlates);
      blocBCohesion = sumB > 0 ? truncatedB.map(val => val / sumB) : new Array(numSlates).fill(1 / numSlates);
    }
  }

  function updateSlateCandidates(index: number, value: number) {
    const newCandidates = [...slateCandidates];
    newCandidates[index] = Math.max(1, Math.min(MAX_CANDIDATES, value));
    slateCandidates = newCandidates;
  }
  
  function updateCohesion(bloc: 'A' | 'B', slateIndex: number, value: number) {
    if (bloc === 'A') {
      const newCohesion = [...blocACohesion];
      newCohesion[slateIndex] = Math.max(0, Math.min(1, value));
      
      // Ensure sum equals 1
      const sum = newCohesion.reduce((s, v) => s + v, 0);
      if (Math.abs(sum - 1) > 0.001) { // Use tolerance for floating point comparison
        const remaining = 1 - newCohesion[slateIndex];
        const otherIndices = newCohesion.map((_, i) => i).filter(i => i !== slateIndex);
        
        if (otherIndices.length > 0 && remaining >= 0) {
          const otherSum = otherIndices.reduce((s, i) => s + newCohesion[i], 0);
          if (otherSum > 0) {
            const scale = remaining / otherSum;
            otherIndices.forEach(i => {
              newCohesion[i] = Math.max(0, newCohesion[i] * scale);
            });
          } else {
            // Distribute remaining evenly among other slates
            const evenShare = remaining / otherIndices.length;
            otherIndices.forEach(i => {
              newCohesion[i] = Math.max(0, evenShare);
            });
          }
        }
      }
      blocACohesion = newCohesion;
    } else {
      const newCohesion = [...blocBCohesion];
      newCohesion[slateIndex] = Math.max(0, Math.min(1, value));
      
      // Ensure sum equals 1
      const sum = newCohesion.reduce((s, v) => s + v, 0);
      if (Math.abs(sum - 1) > 0.001) { // Use tolerance for floating point comparison
        const remaining = 1 - newCohesion[slateIndex];
        const otherIndices = newCohesion.map((_, i) => i).filter(i => i !== slateIndex);
        
        if (otherIndices.length > 0 && remaining >= 0) {
          const otherSum = otherIndices.reduce((s, i) => s + newCohesion[i], 0);
          if (otherSum > 0) {
            const scale = remaining / otherSum;
            otherIndices.forEach(i => {
              newCohesion[i] = Math.max(0, newCohesion[i] * scale);
            });
          } else {
            // Distribute remaining evenly among other slates
            const evenShare = remaining / otherIndices.length;
            otherIndices.forEach(i => {
              newCohesion[i] = Math.max(0, evenShare);
            });
          }
        }
      }
      blocBCohesion = newCohesion;
    }
  }

  let recaptchaChecked = false;

  onMount(() => {
    name = randomRunName();
  });

  function submitMock() {
    const id = crypto.randomUUID();
    const run: Run = {
      params: {
        id,
        name,
        voterBlocs: {
          blocA: { count: blocACount, preference: { forA: blocAPrefForA, forB: blocAPrefForB }, cohesionPct: blocACohesion[0] || 0.7 },
          blocB: { count: blocBCount, preference: { forA: blocBPrefForA, forB: blocBPrefForB }, cohesionPct: blocBCohesion[0] || 0.7 }
        },
        slates: {
          slateA: { numCandidates: slateCandidates[0] || 1 },
          slateB: { numCandidates: slateCandidates[1] || 1 }
        },
        election: mode === 'plurality' ? { mode: 'plurality' } : { mode: 'multiseat', stv: true, numSeats: stvNumSeats },
        ballotGenerator,
        trials,
        maxRankingCandidates: maxRankingCandidatesInput,
        numSlates,
        slateCandidates,
        blocACohesion,
        blocBCohesion,
        voterBlocMode,
        totalVoters,
        blocAShare,
        blocBShare,
        createdAt: Date.now()
      },
      result: {
        slateAElected: mockHistogramData(trials, 0.5, mode === 'multiseat' ? stvNumSeats : 1),
        slateBElected: []
      }
    };
    saveRun(run);
    window.location.href = '/results';
  }
</script>

<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
  <div class="lg:col-span-2 space-y-4">
    <!-- Election method -->
    <div class="rounded-2xl border border-slate-200/70 bg-white/70 p-3 shadow-sm backdrop-blur">
      <h2 class="mb-2 text-lg font-semibold text-slate-800">Election method</h2>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <OptionCard
          title="Single transferable vote (STV)"
          description="Ranked-choice multiseat election"
          selected={mode === 'multiseat'}
          onSelect={() => (mode = 'multiseat')}
        />
        <OptionCard
          title="Bloc plurality"
          description="Most votes wins in a bloc contest"
          selected={mode === 'plurality'}
          onSelect={() => (mode = 'plurality')}
        />
      </div>
    </div>


    <!-- Slates and Election combined -->
    <div class="rounded-2xl border border-slate-200/70 bg-white/70 p-3 shadow-sm backdrop-blur">
      <h2 class="mb-2 text-lg font-semibold text-slate-800">Election details</h2>
      
      <!-- Number of seats (moved up) -->
      <div class="mb-3">
        <label class="block text-sm">Number of seats
          <input type="number" min={stvMin} max={stvMax} class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" bind:value={stvNumSeats} />
        </label>
        <div class="mt-1 text-xs text-slate-500">
          <span>Seats must be between {stvMin} and total candidates ({totalCandidates}).</span>
          {#if stvNumSeats === stvMin}
            <span class="ml-2 text-amber-600">Minimum reached</span>
          {/if}
          {#if stvNumSeats === stvMax}
            <span class="ml-2 text-amber-600">Maximum reached</span>
          {/if}
        </div>
      </div>

      <!-- Max candidates that can be ranked -->
      <div class="mb-3">
        <label class="block text-sm">Maximum ballot length
          <input type="number" min="1" max={totalCandidates} class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" bind:value={maxRankingCandidatesInput} />
        </label>
        <div class="mt-1 text-xs text-slate-500">
          Must be ≤ total number of candidates ({totalCandidates})
        </div>
      </div>

      <!-- Number of slates -->
      <div class="mb-3">
        <label class="block text-sm">Number of slates
          <input type="number" min="1" max="5" class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" bind:value={numSlates} />
        </label>
        <div class="mt-1 text-xs text-slate-500">
          Positive integer less than or equal to 5
        </div>
      </div>

      <!-- Number of candidates per slate -->
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        {#each slateCandidates as candidates, index}
          <label class="block text-sm">Slate {String.fromCharCode(65 + index)} - number of candidates
            <input type="number" min="1" max={MAX_CANDIDATES} class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200"
              value={candidates}
              on:input={(e) => updateSlateCandidates(index, Number((e.target as HTMLInputElement).value))} />
          </label>
        {/each}
      </div>
      <div class="mt-1 flex items-center justify-between text-xs text-slate-500">
        <span>Total candidates: {totalCandidates} out of a maximum of {MAX_CANDIDATES}</span>
        {#if totalCandidates >= MAX_CANDIDATES}
          <span class="text-amber-600">Maximum of {MAX_CANDIDATES} candidates reached</span>
        {/if}
      </div>

    </div>

    

    <!-- Voter blocs -->
    <div class="rounded-2xl border border-slate-200/70 bg-white/70 p-3 shadow-sm backdrop-blur">
      <h2 class="mb-2 text-lg font-semibold text-slate-800">Voter blocs</h2>
      
      <!-- Mode toggle -->
      <div class="mb-3">
        <div class="flex gap-2">
          <button type="button" class="px-3 py-1 text-sm rounded-lg border {voterBlocMode === 'count' ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'}"
            on:click={() => voterBlocMode = 'count'}>
            Count
          </button>
          <button type="button" class="px-3 py-1 text-sm rounded-lg border {voterBlocMode === 'share' ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'}"
            on:click={() => voterBlocMode = 'share'}>
            Share
          </button>
        </div>
      </div>

      {#if voterBlocMode === 'count'}
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label class="block text-sm">Bloc A - Number of voters
            <input type="number" min="0" class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" bind:value={blocACount} />
          </label>
          <label class="block text-sm">Bloc B - Number of voters
            <input type="number" min="0" class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" bind:value={blocBCount} />
          </label>
        </div>
      {:else}
        <div class="mb-3">
          <label class="block text-sm">Total number of voters
            <input type="number" min="1" class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" bind:value={totalVoters} />
          </label>
        </div>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label class="block text-sm">Bloc A share: {(blocAShare * 100).toFixed(1)}%
              <input type="range" min="0" max="1" step="0.01" class="mt-1 w-full" bind:value={blocAShare} />
            </label>
            <div class="text-xs text-slate-500 mt-1">Voters: {blocACount}</div>
          </div>
          <div>
            <label class="block text-sm">Bloc B share: {(blocBShare * 100).toFixed(1)}%
              <input type="range" min="0" max="1" step="0.01" class="mt-1 w-full" bind:value={blocBShare} />
            </label>
            <div class="text-xs text-slate-500 mt-1">Voters: {blocBCount}</div>
          </div>
        </div>
      {/if}

      <!-- Advanced settings -->
      <div class="mt-3">
        <button type="button" class="text-sm text-indigo-600 hover:text-indigo-800" on:click={() => showAdvancedVoterSettings = !showAdvancedVoterSettings}>
          {showAdvancedVoterSettings ? '▼' : '▶'} Turnout settings
        </button>
        {#if showAdvancedVoterSettings}
          <div class="mt-2 p-3 bg-slate-50 rounded-lg">
            {#if voterBlocMode === 'count'}
              <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label class="block text-sm">Bloc A population
                    <input type="number" min="1" class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" bind:value={blocAPopulation} />
                  </label>
                  <label class="block text-sm mt-2">Bloc A turnout rate
                    <input type="range" min="0" max="1" step="0.01" class="mt-1 w-full" bind:value={blocATurnout} />
                    <div class="text-xs text-slate-500">{(blocATurnout * 100).toFixed(1)}%</div>
                  </label>
                </div>
                <div>
                  <label class="block text-sm">Bloc B population
                    <input type="number" min="1" class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" bind:value={blocBPopulation} />
                  </label>
                  <label class="block text-sm mt-2">Bloc B turnout rate
                    <input type="range" min="0" max="1" step="0.01" class="mt-1 w-full" bind:value={blocBTurnout} />
                    <div class="text-xs text-slate-500">{(blocBTurnout * 100).toFixed(1)}%</div>
                  </label>
                </div>
              </div>
              <div class="mt-2 text-xs text-slate-500">
                Calculated voters: A = {Math.round(blocAPopulation * blocATurnout)}, B = {Math.round(blocBPopulation * blocBTurnout)}
              </div>
            {:else}
              <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label class="block text-sm">Bloc A turnout rate
                    <input type="range" min="0" max="1" step="0.01" class="mt-1 w-full" bind:value={blocATurnout} />
                    <div class="text-xs text-slate-500">{(blocATurnout * 100).toFixed(1)}%</div>
                  </label>
                </div>
                <div>
                  <label class="block text-sm">Bloc B turnout rate
                    <input type="range" min="0" max="1" step="0.01" class="mt-1 w-full" bind:value={blocBTurnout} />
                    <div class="text-xs text-slate-500">{(blocBTurnout * 100).toFixed(1)}%</div>
                  </label>
                </div>
              </div>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Candidate strength breakdown -->
      <div class="mt-4">
        <h3 class="text-sm font-medium text-slate-700 mb-2">Candidate strength</h3>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <fieldset class="space-y-2">
            <legend class="text-xs font-medium text-slate-500">A voters</legend>
            <label class="block text-xs">Towards A candidates
              <select class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" bind:value={blocAPrefForA}>
                <option value="random">Unknown</option>
                <option value="strong">Yes</option>
                <option value="indifferent">No</option>
              </select>
            </label>
            <label class="block text-xs">Towards B candidates
              <select class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" bind:value={blocAPrefForB}>
                <option value="random">Unknown</option>
                <option value="strong">Yes</option>
                <option value="indifferent">No</option>
              </select>
            </label>
          </fieldset>
          <fieldset class="space-y-2">
            <legend class="text-xs font-medium text-slate-500">B voters</legend>
            <label class="block text-xs">Towards A candidates
              <select class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" bind:value={blocBPrefForA}>
                <option value="random">Unknown</option>
                <option value="strong">Yes</option>
                <option value="indifferent">No</option>
              </select>
            </label>
            <label class="block text-xs">Towards B candidates
              <select class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" bind:value={blocBPrefForB}>
                <option value="random">Unknown</option>
                <option value="strong">Yes</option>
                <option value="indifferent">No</option>
              </select>
            </label>
          </fieldset>
        </div>
      </div>

      <!-- Cohesion sliders -->
      <div class="mt-4">
        <h3 class="text-sm font-medium text-slate-700 mb-2">Cohesion</h3>
        {#if numSlates === 2}
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label class="block text-sm">A voters lean to A candidates: {(blocACohesion[0] * 100).toFixed(0)}%
              <input type="range" min="0" max="1" step="0.01" class="mt-1 w-full" bind:value={blocACohesion[0]} />
            </label>
            <label class="block text-sm">B voters lean to B candidates: {(blocBCohesion[1] * 100).toFixed(0)}%
              <input type="range" min="0" max="1" step="0.01" class="mt-1 w-full" bind:value={blocBCohesion[1]} />
            </label>
          </div>
        {:else}
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <!-- A voters column -->
            <div>
              <h4 class="text-xs font-medium text-slate-600 mb-3">A voters cohesion to each slate (must sum to 100%)</h4>
              <div class="space-y-3">
                {#each blocACohesion as cohesion, index}
                  <label class="block text-sm">To Slate {String.fromCharCode(65 + index)}: {(cohesion * 100).toFixed(0)}%
                    <input type="range" min="0" max="1" step="0.01" class="mt-1 w-full" 
                      value={cohesion}
                      on:input={(e) => updateCohesion('A', index, Number((e.target as HTMLInputElement).value))} />
                  </label>
                {/each}
              </div>
              <div class="text-xs text-slate-500 mt-2">Sum: {(blocACohesion.reduce((sum, val) => sum + val, 0) * 100).toFixed(1)}%</div>
            </div>
            
            <!-- B voters column -->
            <div>
              <h4 class="text-xs font-medium text-slate-600 mb-3">B voters cohesion to each slate (must sum to 100%)</h4>
              <div class="space-y-3">
                {#each blocBCohesion as cohesion, index}
                  <label class="block text-sm">To Slate {String.fromCharCode(65 + index)}: {(cohesion * 100).toFixed(0)}%
                    <input type="range" min="0" max="1" step="0.01" class="mt-1 w-full" 
                      value={cohesion}
                      on:input={(e) => updateCohesion('B', index, Number((e.target as HTMLInputElement).value))} />
                  </label>
                {/each}
              </div>
              <div class="text-xs text-slate-500 mt-2">Sum: {(blocBCohesion.reduce((sum, val) => sum + val, 0) * 100).toFixed(1)}%</div>
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Voter behavior -->
    <div class="rounded-2xl border border-slate-200/70 bg-white/70 p-3 shadow-sm backdrop-blur">
      <h2 class="mb-2 text-lg font-semibold text-slate-800">Voter behavior</h2>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
        <button type="button" class="rounded-xl border border-slate-200/70 bg-white/60 p-3 text-left text-sm hover:bg-white/80 focus:outline-none {ballotGenerator === 'sPL' ? 'ring-2 ring-indigo-300' : ''}"
          on:click={() => (ballotGenerator = 'sPL')}>
          <div class="font-medium">Impulsive voter</div>
          <div class="mt-1 text-xs text-slate-600">Makes quick picks based on slate preference, with little deliberation.</div>
        </button>
        <button type="button" class="rounded-xl border border-slate-200/70 bg-white/60 p-3 text-left text-sm hover:bg-white/80 focus:outline-none {ballotGenerator === 'sBT' ? 'ring-2 ring-indigo-300' : ''}"
          on:click={() => (ballotGenerator = 'sBT')}>
          <div class="font-medium">Deliberative voter</div>
          <div class="mt-1 text-xs text-slate-600">Adjusts the list if needed to better align with overall slate preference.</div>
        </button>
        <button type="button" class="rounded-xl border border-slate-200/70 bg-white/60 p-3 text-left text-sm hover:bg-white/80 focus:outline-none {ballotGenerator === 'CS' ? 'ring-2 ring-indigo-300' : ''}"
          on:click={() => (ballotGenerator = 'CS')}>
          <div class="font-medium">Cambridge voter</div>
          <div class="mt-1 text-xs text-slate-600">Follows patterns drawn from historical Cambridge city council ballots.</div>
        </button>
      </div>
    </div>
  </div>

  <div class="space-y-3">
    <div class="rounded-2xl border border-slate-200/70 bg-white/70 p-3 shadow-sm backdrop-blur">
      <h2 class="mb-2 text-lg font-semibold text-slate-800">Run details</h2>
      <label class="block text-sm">Run name
        <input class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" bind:value={name} />
      </label>
      <label class="mt-2 block text-sm">Number of trials
        <input type="number" min="1" class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" bind:value={trials} />
      </label>
      <label class="mt-2 flex items-center gap-2 text-sm">
        <input type="checkbox" bind:checked={recaptchaChecked} class="accent-indigo-600" />
        I'm not a robot (mock reCAPTCHA)
      </label>
      <button class="mt-2 w-full rounded-full bg-indigo-600/90 px-4 py-2 text-white shadow-sm transition hover:bg-indigo-600 disabled:opacity-40" on:click={submitMock} disabled={!recaptchaChecked}>
        Run simulation (mock)
      </button>
      <p class="mt-2 text-xs text-slate-500">This saves a mock run and takes you to Results.</p>
    </div>
    <div class="rounded-2xl border border-slate-200/70 bg-white/70 p-3 text-sm text-slate-600 backdrop-blur">
      <p class="font-medium">Preview:</p>
      <div class="mt-2 space-y-1 text-xs">
        <div><strong>Election style:</strong> {mode === 'plurality' ? 'Bloc plurality' : 'Single transferable vote (STV)'}</div>
        <div><strong>Voter blocs:</strong> A: {blocACount} voters, B: {blocBCount} voters</div>
        <div><strong>Cohesion:</strong></div>
        {#if numSlates === 2}
          <div class="ml-2">A voters have {(blocACohesion[0] * 100).toFixed(0)}% lean to A candidates</div>
          <div class="ml-2">B voters have {(blocBCohesion[1] * 100).toFixed(0)}% lean to B candidates</div>
        {:else}
          <div class="ml-2">A voters: {blocACohesion.map((cohesion, index) => `${(cohesion * 100).toFixed(0)}% to Slate ${String.fromCharCode(65 + index)}`).join(', ')}</div>
          <div class="ml-2">B voters: {blocBCohesion.map((cohesion, index) => `${(cohesion * 100).toFixed(0)}% to Slate ${String.fromCharCode(65 + index)}`).join(', ')}</div>
        {/if}
        <div><strong>Candidate strength:</strong></div>
        <div class="ml-2">Do A voters have preferred A candidates: {blocAPrefForA === 'strong' ? 'yes' : blocAPrefForA === 'indifferent' ? 'no' : 'unknown'}</div>
        <div class="ml-2">Do A voters have preferred B candidates: {blocAPrefForB === 'strong' ? 'yes' : blocAPrefForB === 'indifferent' ? 'no' : 'unknown'}</div>
        <div class="ml-2">Do B voters have preferred A candidates: {blocBPrefForA === 'strong' ? 'yes' : blocBPrefForA === 'indifferent' ? 'no' : 'unknown'}</div>
        <div class="ml-2">Do B voters have preferred B candidates: {blocBPrefForB === 'strong' ? 'yes' : blocBPrefForB === 'indifferent' ? 'no' : 'unknown'}</div>
        <div><strong>Candidate pool:</strong> {slateCandidates.map((count, index) => `Slate ${String.fromCharCode(65 + index)} fields ${count} candidates`).join(', ')}</div>
        <div><strong>Behavior:</strong> {ballotGenerator === 'sPL' ? 'impulsive voting' : ballotGenerator === 'sBT' ? 'deliberative voting' : 'Cambridge-style voting'}</div>
        <div><strong>Number of simulated elections:</strong> {trials}</div>
      </div>
    </div>
  </div>
</div>


