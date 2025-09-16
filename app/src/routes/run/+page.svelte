<script lang="ts">
  import { randomRunName, saveRun, mockHistogramData, type Run } from '$lib';
  import { onMount } from 'svelte';
  import OptionCard from '$lib/components/OptionCard.svelte';

  let name = '';
  let trials = 100;

  // Voter blocs (counts instead of proportions)
  let numVoterBlocs = 2;
  let blocCounts = [50, 50]; // Array to hold voter counts for each bloc
  let blocShares = [0.5, 0.5]; // Array to hold voter shares for each bloc
  let blocNames = ['A', 'B']; // Array to hold custom names for each voting bloc
  
  // Voter bloc mode toggle
  let voterBlocMode: 'count' | 'share' = 'count';
  let totalVoters = 100;
  
  // Advanced voter settings
  let showTurnoutSettings = false;
  let blocPopulations = [10000, 10000]; // Array to hold population for each bloc
  let blocTurnouts = [1.0, 1.0]; // Array to hold turnout for each bloc

  // Candidate preference (per bloc, cross-preferences), default to 'random' (all bets are off)
  type VoterPreference = 'strong' | 'random' | 'indifferent';
  let blocPreferences: VoterPreference[][] = [
    ['random', 'random'], // Bloc A preferences for [A candidates, B candidates]
    ['random', 'random']  // Bloc B preferences for [A candidates, B candidates]
  ];

  // Cohesion (0-1 range) - arrays for dynamic slates and voter blocs
  let blocCohesion: number[][] = [
    [1.0, 0], // Bloc A cohesion to each slate
    [0, 1.0]  // Bloc B cohesion to each slate
  ];

  // Slates
  let numSlates = 2;
  let slateCandidates = [3, 3]; // Array to hold candidates per slate
  let slateNames = ['A', 'B']; // Array to hold custom names for each slate

  const MAX_CANDIDATES = 12;
  $: totalCandidates = slateCandidates.reduce((sum, count) => sum + count, 0);
  $: maxRankingCandidates = totalCandidates;

  // Election
  let mode: 'blocPlurality' | 'multiseat' = 'multiseat';
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
  
  // Handle dynamic voter bloc creation
  $: if (numVoterBlocs !== blocCounts.length) {
    if (numVoterBlocs > blocCounts.length) {
      // Add new blocs
      for (let i = blocCounts.length; i < numVoterBlocs; i++) {
        blocCounts = [...blocCounts, 50];
        blocShares = [...blocShares, 1 / numVoterBlocs];
        blocPopulations = [...blocPopulations, 10000];
        blocTurnouts = [...blocTurnouts, 1.0];
        blocPreferences = [...blocPreferences, new Array(numSlates).fill('random')];
        blocCohesion = [...blocCohesion, new Array(numSlates).fill(1 / numSlates)];
        blocNames = [...blocNames, String.fromCharCode(65 + i)];
      }
    } else {
      // Remove excess blocs
      blocCounts = blocCounts.slice(0, numVoterBlocs);
      blocShares = blocShares.slice(0, numVoterBlocs);
      blocPopulations = blocPopulations.slice(0, numVoterBlocs);
      blocTurnouts = blocTurnouts.slice(0, numVoterBlocs);
      blocPreferences = blocPreferences.slice(0, numVoterBlocs);
      blocCohesion = blocCohesion.slice(0, numVoterBlocs);
      blocNames = blocNames.slice(0, numVoterBlocs);
    }
  }
  
  // Share calculations
  $: if (voterBlocMode === 'share') {
    blocCounts = blocShares.map(share => Math.round(totalVoters * share));
  }
  
  // Advanced settings: update voter counts when turnout changes in count mode
  $: if (voterBlocMode === 'count' && showTurnoutSettings) {
    blocCounts = blocPopulations.map((pop, i) => Math.round(pop * blocTurnouts[i]));
  }
  
  // Ensure shares add to 1
  $: if (voterBlocMode === 'share') {
    const sum = blocShares.reduce((s, share) => s + share, 0);
    if (Math.abs(sum - 1) > 0.001) {
      blocShares = blocShares.map(share => share / sum);
    }
  }
  
  // Handle dynamic slate creation
  $: if (numSlates !== slateCandidates.length) {
    if (numSlates > slateCandidates.length) {
      // Add new slates
      for (let i = slateCandidates.length; i < numSlates; i++) {
        slateCandidates = [...slateCandidates, 1];
        slateNames = [...slateNames, String.fromCharCode(65 + i)];
      }
    } else {
      // Remove excess slates
      slateCandidates = slateCandidates.slice(0, numSlates);
      slateNames = slateNames.slice(0, numSlates);
    }
  }
  
  // Handle dynamic cohesion arrays
  $: if (numSlates !== blocCohesion[0]?.length) {
    blocCohesion = blocCohesion.map(blocCohesionArray => {
      if (numSlates > blocCohesionArray.length) {
        // Add new cohesion values (distribute remaining evenly)
        const currentSum = blocCohesionArray.reduce((sum, val) => sum + val, 0);
        const remaining = Math.max(0, 1 - currentSum);
        const newSlatesCount = numSlates - blocCohesionArray.length;
        const newValue = newSlatesCount > 0 ? remaining / newSlatesCount : 0;
        const newValues = new Array(newSlatesCount).fill(newValue);
        return [...blocCohesionArray, ...newValues];
      } else {
        // Remove excess cohesion values and renormalize
        const truncated = blocCohesionArray.slice(0, numSlates);
        const sum = truncated.reduce((sum, val) => sum + val, 0);
        return sum > 0 ? truncated.map(val => val / sum) : new Array(numSlates).fill(1 / numSlates);
      }
    });
  }
  
  // Handle dynamic preferences arrays
  $: if (numSlates !== blocPreferences[0]?.length) {
    blocPreferences = blocPreferences.map(preferencesArray => {
      if (numSlates > preferencesArray.length) {
        // Add new preferences (default to 'random')
        const newPreferences = new Array(numSlates - preferencesArray.length).fill('random');
        return [...preferencesArray, ...newPreferences];
      } else {
        // Remove excess preferences
        return preferencesArray.slice(0, numSlates);
      }
    });
  }

  function updateSlateCandidates(index: number, value: number) {
    const newCandidates = [...slateCandidates];
    newCandidates[index] = Math.max(1, Math.min(MAX_CANDIDATES, value));
    slateCandidates = newCandidates;
  }
  
  function updateCohesion(blocIndex: number, slateIndex: number, value: number) {
    const newBlocCohesion = [...blocCohesion];
    const newCohesion = [...newBlocCohesion[blocIndex]];
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
    newBlocCohesion[blocIndex] = newCohesion;
    blocCohesion = newBlocCohesion;
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
        voterBlocs: blocCounts.map((count, index) => ({
          count,
          preference: {
            forA: blocPreferences[index][0] || 'random',
            forB: blocPreferences[index][1] || 'random'
          },
          cohesionPct: blocCohesion[index][0] || 0.7
        })),
        slates: {
          slateA: { numCandidates: slateCandidates[0] || 1 },
          slateB: { numCandidates: slateCandidates[1] || 1 }
        },
        election: mode === 'blocPlurality' ? { mode: 'blocPlurality' } : { mode: 'multiseat', stv: true, numSeats: stvNumSeats },
        ballotGenerator,
        trials,
        maxRankingCandidates: maxRankingCandidatesInput,
        numSlates,
        slateCandidates,
        slateNames,
        numVoterBlocs,
        blocCounts,
        blocShares,
        blocNames,
        blocPopulations,
        blocTurnouts,
        blocPreferences,
        blocCohesion,
        voterBlocMode,
        totalVoters,
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
          description="Votes transfer as candidates are elected/eliminated."
          selected={mode === 'multiseat'}
          onSelect={() => (mode = 'multiseat')}
        />
        <OptionCard
          title="Bloc plurality"
          description="Most votes wins."
          selected={mode === 'blocPlurality'}
          onSelect={() => (mode = 'blocPlurality')}
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
          <div class="space-y-2">
            <label class="block text-sm">Slate name
              <input type="text" class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" 
                value={slateNames[index]}
                on:input={(e) => {
                  const newNames = [...slateNames];
                  newNames[index] = (e.target as HTMLInputElement).value || String.fromCharCode(65 + index);
                  slateNames = newNames;
                }} />
            </label>
            <label class="block text-sm">Number of candidates
              <input type="number" min="1" max={MAX_CANDIDATES} class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" 
                value={candidates}
                on:input={(e) => updateSlateCandidates(index, Number((e.target as HTMLInputElement).value))} />
            </label>
          </div>
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
      
       <!-- Number of voter blocs -->
       <div class="mb-3">
        <label class="block text-sm">Number of voter blocs
          <input type="number" min="1" max="5" class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" bind:value={numVoterBlocs} />
        </label>
        <div class="mt-1 text-xs text-slate-500">
          At most 5.
        </div>
      </div>


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
          {#each blocCounts as count, index}
            <div class="space-y-2">
              <label class="block text-sm">Bloc name
                <input type="text" class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" 
                  value={blocNames[index]}
                  on:input={(e) => {
                    const newNames = [...blocNames];
                    newNames[index] = (e.target as HTMLInputElement).value || String.fromCharCode(65 + index);
                    blocNames = newNames;
                  }} />
              </label>
              <label class="block text-sm">Number of voters
                <input type="number" min="0" class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" 
                  value={count}
                  on:input={(e) => {
                    const newCounts = [...blocCounts];
                    newCounts[index] = Math.max(0, Number((e.target as HTMLInputElement).value));
                    blocCounts = newCounts;
                  }} />
              </label>
            </div>
          {/each}
        </div>
      {:else}
        <div class="mb-3">
          <label class="block text-sm">Total number of voters
            <input type="number" min="1" class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" bind:value={totalVoters} />
          </label>
        </div>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          {#each blocShares as share, index}
            <div class="space-y-2">
              <label class="block text-sm">Bloc name
                <input type="text" class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" 
                  value={blocNames[index]}
                  on:input={(e) => {
                    const newNames = [...blocNames];
                    newNames[index] = (e.target as HTMLInputElement).value || String.fromCharCode(65 + index);
                    blocNames = newNames;
                  }} />
              </label>
              <label class="block text-sm">Share: {(share * 100).toFixed(1)}%
                <input type="range" min="0" max="1" step="0.01" class="mt-1 w-full" 
                  value={share}
                  on:input={(e) => {
                    const newShares = [...blocShares];
                    newShares[index] = Number((e.target as HTMLInputElement).value);
                    blocShares = newShares;
                  }} />
              </label>
              <div class="text-xs text-slate-500">Voters: {blocCounts[index]}</div>
            </div>
          {/each}
        </div>
      {/if}

      <!-- Advanced settings -->
      <div class="mt-3">
        <button type="button" class="text-sm text-indigo-600 hover:text-indigo-800" on:click={() => showTurnoutSettings = !showTurnoutSettings}>
          {showTurnoutSettings ? '▼' : '▶'} Turnout settings
        </button>
        {#if showTurnoutSettings}
          <div class="mt-2 p-3 bg-slate-50 rounded-lg">
            {#if voterBlocMode === 'count'}
              <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                {#each blocPopulations as population, index}
                  <div>
                    <label class="block text-sm">{blocNames[index]} population
                      <input type="number" min="1" class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" 
                        value={population}
                        on:input={(e) => {
                          const newPopulations = [...blocPopulations];
                          newPopulations[index] = Math.max(1, Number((e.target as HTMLInputElement).value));
                          blocPopulations = newPopulations;
                        }} />
                    </label>
                    <label class="block text-sm mt-2">{blocNames[index]} turnout rate
                      <input type="range" min="0" max="1" step="0.01" class="mt-1 w-full" 
                        value={blocTurnouts[index]}
                        on:input={(e) => {
                          const newTurnouts = [...blocTurnouts];
                          newTurnouts[index] = Number((e.target as HTMLInputElement).value);
                          blocTurnouts = newTurnouts;
                        }} />
                      <div class="text-xs text-slate-500">{(blocTurnouts[index] * 100).toFixed(1)}%</div>
                    </label>
                  </div>
                {/each}
              </div>
              <div class="mt-2 text-xs text-slate-500">
                Calculated voters: {blocPopulations.map((pop, i) => `${blocNames[i]} = ${Math.round(pop * blocTurnouts[i])}`).join(', ')}
              </div>
            {:else}
              <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                {#each blocTurnouts as turnout, index}
                  <div>
                    <label class="block text-sm">{blocNames[index]} turnout rate
                      <input type="range" min="0" max="1" step="0.01" class="mt-1 w-full" 
                        value={turnout}
                        on:input={(e) => {
                          const newTurnouts = [...blocTurnouts];
                          newTurnouts[index] = Number((e.target as HTMLInputElement).value);
                          blocTurnouts = newTurnouts;
                        }} />
                      <div class="text-xs text-slate-500">{(turnout * 100).toFixed(1)}%</div>
                    </label>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Candidate strength breakdown -->
      <div class="mt-4">
        <h3 class="text-sm font-medium text-slate-700 mb-2">Candidate strength</h3>
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          {#each blocPreferences as preferences, blocIndex}
            <fieldset class="space-y-2">
              <legend class="text-xs font-medium text-slate-500">{blocNames[blocIndex]} voters</legend>
              {#each Array(numSlates) as _, slateIndex}
                <label class="block text-xs">Towards {slateNames[slateIndex]} candidates
                  <select class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" 
                    value={preferences[slateIndex] || 'random'}
                    on:change={(e) => {
                      const newPreferences = [...blocPreferences];
                      newPreferences[blocIndex] = [...newPreferences[blocIndex]];
                      // Ensure the array is long enough for all slates
                      while (newPreferences[blocIndex].length < numSlates) {
                        newPreferences[blocIndex].push('random');
                      }
                      newPreferences[blocIndex][slateIndex] = (e.target as HTMLSelectElement).value as VoterPreference;
                      blocPreferences = newPreferences;
                    }}>
                    <option value="random">Unknown</option>
                    <option value="strong">Yes</option>
                    <option value="indifferent">No</option>
                  </select>
                </label>
              {/each}
            </fieldset>
          {/each}
        </div>
      </div>

      <!-- Cohesion sliders -->
      <div class="mt-4">
        <h3 class="text-sm font-medium text-slate-700 mb-2">Cohesion</h3>
        <!-- {#if numSlates === 2 && numVoterBlocs === 2}
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label class="block text-sm">A voters lean to A candidates: {(blocCohesion[0][0] * 100).toFixed(0)}%
              <input type="range" min="0" max="1" step="0.01" class="mt-1 w-full" 
                value={blocCohesion[0][0]}
                on:input={(e) => updateCohesion(0, 0, Number((e.target as HTMLInputElement).value))} />
            </label>
            <label class="block text-sm">B voters lean to B candidates: {(blocCohesion[1][1] * 100).toFixed(0)}%
              <input type="range" min="0" max="1" step="0.01" class="mt-1 w-full" 
                value={blocCohesion[1][1]}
                on:input={(e) => updateCohesion(1, 1, Number((e.target as HTMLInputElement).value))} />
            </label>
          </div>
        {:else} -->
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            {#each blocCohesion as blocCohesionArray, blocIndex}
              <div>
                <h4 class="text-xs font-medium text-slate-600 mb-3">{blocNames[blocIndex]} voters cohesion to each slate (must sum to 100%)</h4>
                <div class="space-y-3">
                  {#each blocCohesionArray as cohesion, slateIndex}
                    <label class="block text-sm">To {slateNames[slateIndex]}: {(cohesion * 100).toFixed(0)}%
                      <input type="range" min="0" max="1" step="0.01" class="mt-1 w-full" 
                        value={cohesion}
                        on:input={(e) => updateCohesion(blocIndex, slateIndex, Number((e.target as HTMLInputElement).value))} />
                    </label>
                  {/each}
                </div>
                <div class="text-xs text-slate-500 mt-2">Sum: {(blocCohesionArray.reduce((sum, val) => sum + val, 0) * 100).toFixed(1)}%</div>
              </div>
            {/each}
          </div>
        <!-- {/if} -->
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
        <div><strong>Election style:</strong> {mode === 'blocPlurality' ? 'Bloc plurality' : 'Single transferable vote (STV)'}</div>
        <div><strong>Voter blocs:</strong> {blocCounts.map((count, index) => `${blocNames[index]}: ${count} voters`).join(', ')}</div>
        <div><strong>Cohesion:</strong></div>
        {#if numSlates === 2 && numVoterBlocs === 2}
          <div class="ml-2">{blocNames[0]} voters have {(blocCohesion[0][0] * 100).toFixed(0)}% lean to {slateNames[0]} candidates</div>
          <div class="ml-2">{blocNames[1]} voters have {(blocCohesion[1][1] * 100).toFixed(0)}% lean to {slateNames[1]} candidates</div>
        {:else}
          {#each blocCohesion as blocCohesionArray, blocIndex}
            <div class="ml-2">{blocNames[blocIndex]} voters: {blocCohesionArray.map((cohesion, index) => `${(cohesion * 100).toFixed(0)}% to ${slateNames[index]}`).join(', ')}</div>
          {/each}
        {/if}
        <div><strong>Candidate strength:</strong></div>
        {#each blocPreferences as preferences, blocIndex}
          {#each preferences as preference, slateIndex}
            <div class="ml-2">Do {blocNames[blocIndex]} voters have preferred {slateNames[slateIndex]} candidates: {preference === 'strong' ? 'yes' : preference === 'indifferent' ? 'no' : 'unknown'}</div>
          {/each}
        {/each}
        <div><strong>Candidate pool:</strong> {slateCandidates.map((count, index) => `${slateNames[index]} fields ${count} candidates`).join(', ')}</div>
        <div><strong>Behavior:</strong> {ballotGenerator === 'sPL' ? 'Impulsive voting' : ballotGenerator === 'sBT' ? 'Deliberative voting' : 'Cambridge-style voting'}</div>
        <div><strong>Number of simulated elections:</strong> {trials}</div>
      </div>
    </div>
  </div>
</div>


