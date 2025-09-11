<script lang="ts">
  import { randomRunName, saveRun, mockHistogramData, type Run } from '$lib';
  import { onMount } from 'svelte';
  import OptionCard from '$lib/components/OptionCard.svelte';

  let name = '';
  let trials = 100;

  // Voter blocs (counts instead of proportions)
  let blocACount = 50;
  let blocBCount = 50;

  // Candidate preference (per bloc, cross-preferences), default to 'random' (all bets are off)
  type VoterPreference = 'strong' | 'random' | 'indifferent';
  let blocAPrefForA: VoterPreference = 'random';
  let blocAPrefForB: VoterPreference = 'random';
  let blocBPrefForB: VoterPreference = 'random';
  let blocBPrefForA: VoterPreference = 'random';

  // Cohesion hidden for 2-bloc setup; keep internal defaults
  let blocACohesion = 70;
  let blocBCohesion = 70;

  // Slates
  let slateANum = 3;
  let slateBNum = 3;

  const MAX_CANDIDATES = 12;
  $: totalCandidates = slateANum + slateBNum;
  $: maxA = Math.max(1, MAX_CANDIDATES - slateBNum);
  $: maxB = Math.max(1, MAX_CANDIDATES - slateANum);

  // Election
  let mode: 'plurality' | 'multiseat' = 'multiseat';
  let ballotGenerator: 'sBT' | 'sPL' | 'CS' = 'sPL';
  let stvNumSeats = 5;
  $: stvMin = 2;
  $: stvMax = Math.max(stvMin, totalCandidates);
  $: if (mode === 'multiseat') {
    if (stvNumSeats < stvMin) stvNumSeats = stvMin;
    if (stvNumSeats > stvMax) stvNumSeats = stvMax;
  }

  function clampSlateANum(event: Event) {
    const target = event.target as HTMLInputElement;
    const v = Number(target.value);
    slateANum = Math.max(1, Math.min(maxA, isNaN(v) ? 1 : v));
  }

  function clampSlateBNum(event: Event) {
    const target = event.target as HTMLInputElement;
    const v = Number(target.value);
    slateBNum = Math.max(1, Math.min(maxB, isNaN(v) ? 1 : v));
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
          blocA: { count: blocACount, preference: { forA: blocAPrefForA, forB: blocAPrefForB }, cohesionPct: blocACohesion },
          blocB: { count: blocBCount, preference: { forA: blocBPrefForA, forB: blocBPrefForB }, cohesionPct: blocBCohesion }
        },
        slates: {
          slateA: { numCandidates: slateANum },
          slateB: { numCandidates: slateBNum }
        },
        election: mode === 'plurality' ? { mode: 'plurality' } : { mode: 'multiseat', stv: true, numSeats: stvNumSeats },
        ballotGenerator,
        trials,
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
    <!-- Slates and Election combined -->
    <div class="rounded-2xl border border-slate-200/70 bg-white/70 p-3 shadow-sm backdrop-blur">
      <h2 class="mb-2 text-lg font-semibold text-slate-800">Election details</h2>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label class="block text-sm">Slate A - number of candidates
          <input type="number" min="1" max={maxA} class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200"
            bind:value={slateANum}
            on:input={clampSlateANum} />
        </label>
        <label class="block text-sm">Slate B - number of candidates
          <input type="number" min="1" max={maxB} class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200"
            bind:value={slateBNum}
            on:input={clampSlateBNum} />
        </label>
      </div>
      <div class="mt-1 flex items-center justify-between text-xs text-slate-500">
        <span>Total candidates: {totalCandidates} / {MAX_CANDIDATES}</span>
        {#if totalCandidates >= MAX_CANDIDATES}
          <span class="text-amber-600">Maximum of {MAX_CANDIDATES} candidates reached</span>
        {/if}
      </div>

      <div class="mt-3">
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
      <div class="mt-2 grid grid-cols-1 gap-3 md:grid-cols-3">
        <label class="block text-sm">Number of seats
          <input type="number" min={stvMin} max={stvMax} class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" bind:value={stvNumSeats} />
        </label>
      </div>
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

    <!-- Voter blocs -->
    <div class="rounded-2xl border border-slate-200/70 bg-white/70 p-3 shadow-sm backdrop-blur">
      <h2 class="mb-2 text-lg font-semibold text-slate-800">Voter blocs</h2>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <fieldset class="space-y-3">
          <legend class="text-sm font-medium text-slate-700">Bloc A</legend>
          <label class="block text-sm">Number of voters
            <input type="number" min="0" class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" bind:value={blocACount} />
          </label>
          <fieldset class="space-y-2">
            <legend class="text-xs font-medium text-slate-500">Candidate preference</legend>
            <label class="block text-xs">For A candidates
              <select class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" bind:value={blocAPrefForA}>
                <option value="random">All bets are off</option>
                <option value="strong">Strong preference</option>
                <option value="indifferent">Candidate indifference</option>
              </select>
            </label>
            <label class="block text-xs">For B candidates
              <select class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" bind:value={blocAPrefForB}>
                <option value="random">All bets are off</option>
                <option value="strong">Strong preference</option>
                <option value="indifferent">Candidate indifference</option>
              </select>
            </label>
          </fieldset>
          <!-- Cohesion hidden when only two blocs -->
        </fieldset>
        <fieldset class="space-y-3">
          <legend class="text-sm font-medium text-slate-700">Bloc B</legend>
          <label class="block text-sm">Number of voters
            <input type="number" min="0" class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" bind:value={blocBCount} />
          </label>
          <fieldset class="space-y-2">
            <legend class="text-xs font-medium text-slate-500">Candidate preference</legend>
            <label class="block text-xs">For B candidates
              <select class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" bind:value={blocBPrefForB}>
                <option value="random">All bets are off</option>
                <option value="strong">Strong preference</option>
                <option value="indifferent">Candidate indifference</option>
              </select>
            </label>
            <label class="block text-xs">For A candidates
              <select class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" bind:value={blocBPrefForA}>
                <option value="random">All bets are off</option>
                <option value="strong">Strong preference</option>
                <option value="indifferent">Candidate indifference</option>
              </select>
            </label>
          </fieldset>
          <!-- Cohesion hidden when only two blocs -->
        </fieldset>
      </div>
      <div class="mt-1 text-xs text-slate-500">Counts are summed; no auto-balancing.</div>
    </div>

    <!-- Voter behavior -->
    <div class="rounded-2xl border border-slate-200/70 bg-white/70 p-3 shadow-sm backdrop-blur">
      <h2 class="mb-2 text-lg font-semibold text-slate-800">Voter behavior</h2>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
        <button type="button" class="rounded-xl border border-slate-200/70 bg-white/60 p-3 text-left text-sm hover:bg-white/80 focus:outline-none {ballotGenerator === 'sPL' ? 'ring-2 ring-indigo-300' : ''}"
          on:click={() => (ballotGenerator = 'sPL')}>
          <div class="font-medium">Impulsive voter</div>
          <div class="mt-1 text-xs text-slate-600">Makes quick picks with minimal deliberation.</div>
        </button>
        <button type="button" class="rounded-xl border border-slate-200/70 bg-white/60 p-3 text-left text-sm hover:bg-white/80 focus:outline-none {ballotGenerator === 'sBT' ? 'ring-2 ring-indigo-300' : ''}"
          on:click={() => (ballotGenerator = 'sBT')}>
          <div class="font-medium">Deliberative voter</div>
          <div class="mt-1 text-xs text-slate-600">Carefully ranks candidates based on bloc preferences.</div>
        </button>
        <button type="button" class="rounded-xl border border-slate-200/70 bg-white/60 p-3 text-left text-sm hover:bg-white/80 focus:outline-none {ballotGenerator === 'CS' ? 'ring-2 ring-indigo-300' : ''}"
          on:click={() => (ballotGenerator = 'CS')}>
          <div class="font-medium">Cambridge voter</div>
          <div class="mt-1 text-xs text-slate-600">Follows patterns similar to Cambridge ballots.</div>
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
      <p>Preview:</p>
      <ul class="mt-2 list-disc space-y-1 pl-5">
        <li>Blocs: A {blocACount} voters (A→A {blocAPrefForA}, A→B {blocAPrefForB}), B {blocBCount} voters (B→B {blocBPrefForB}, B→A {blocBPrefForA})</li>
        <li>Slates: A {slateANum}, B {slateBNum}</li>
        <li>Mode: {mode === 'plurality' ? 'Bloc plurality' : `STV, ${stvNumSeats} seats`}; Behavior: {ballotGenerator}</li>
        <li>Trials: {trials}</li>
      </ul>
    </div>
  </div>
</div>


