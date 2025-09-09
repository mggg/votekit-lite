<script lang="ts">
  import { randomRunName, saveRun, mockHistogramData, type Run } from '$lib';
  import { onMount } from 'svelte';

  let name = '';
  let trials = 100;

  // Voter blocs
  let blocAProportion = 50;
  let blocAPreference: 'strong' | 'random' | 'indifferent' = 'strong';
  let blocACohesion = 70;
  let blocBProportion = 50;
  let blocBPreference: 'strong' | 'random' | 'indifferent' = 'strong';
  let blocBCohesion = 70;

  // Slates
  let slateANum = 3;
  let slateBNum = 3;

  // Election
  let mode: 'plurality' | 'multiseat' = 'plurality';
  let ballotGenerator: 'sBT' | 'sPL' | 'CS' = 'sBT';
  let stvNumSeats = 5;

  let recaptchaChecked = false;

  onMount(() => {
    name = randomRunName();
  });

  // Keep bloc proportions linked to 100
  $: blocBProportion = 100 - blocAProportion;

  function submitMock() {
    const id = crypto.randomUUID();
    const run: Run = {
      params: {
        id,
        name,
        voterBlocs: {
          blocA: { proportionPct: blocAProportion, preference: blocAPreference, cohesionPct: blocACohesion },
          blocB: { proportionPct: blocBProportion, preference: blocBPreference, cohesionPct: blocBCohesion }
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

<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
  <div class="lg:col-span-2 space-y-6">
    <div class="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm backdrop-blur">
      <h2 class="mb-4 text-lg font-semibold text-slate-800">Voter blocs</h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <fieldset class="space-y-3">
          <legend class="text-sm font-medium text-slate-700">Bloc A</legend>
          <label class="block text-sm">Proportion (%)
            <input type="range" min="0" max="100" bind:value={blocAProportion} class="mt-1 w-full accent-indigo-600" />
          </label>
          <fieldset class="space-y-1">
            <legend class="text-xs font-medium text-slate-500">Voter preference</legend>
            <label class="flex items-center gap-2 text-sm"><input type="radio" name="prefA" value="strong" bind:group={blocAPreference} class="accent-indigo-600" />Voters have a strong candidate preference</label>
            <label class="flex items-center gap-2 text-sm"><input type="radio" name="prefA" value="random" bind:group={blocAPreference} class="accent-indigo-600" />All bets are off</label>
            <label class="flex items-center gap-2 text-sm"><input type="radio" name="prefA" value="indifferent" bind:group={blocAPreference} class="accent-indigo-600" />Candidate indifference</label>
          </fieldset>
          <label class="block text-sm">Cohesion (0-100)
            <input type="range" min="0" max="100" bind:value={blocACohesion} class="mt-1 w-full accent-indigo-600" />
          </label>
        </fieldset>
        <fieldset class="space-y-3">
          <legend class="text-sm font-medium text-slate-700">Bloc B</legend>
          <label class="block text-sm">Proportion (%)
            <input type="range" min="0" max="100" bind:value={blocBProportion} class="mt-1 w-full accent-indigo-600" />
          </label>
          <fieldset class="space-y-1">
            <legend class="text-xs font-medium text-slate-500">Voter preference</legend>
            <label class="flex items-center gap-2 text-sm"><input type="radio" name="prefB" value="strong" bind:group={blocBPreference} class="accent-indigo-600" />Voters have a strong candidate preference</label>
            <label class="flex items-center gap-2 text-sm"><input type="radio" name="prefB" value="random" bind:group={blocBPreference} class="accent-indigo-600" />All bets are off</label>
            <label class="flex items-center gap-2 text-sm"><input type="radio" name="prefB" value="indifferent" bind:group={blocBPreference} class="accent-indigo-600" />Candidate indifference</label>
          </fieldset>
          <label class="block text-sm">Cohesion (0-100)
            <input type="range" min="0" max="100" bind:value={blocBCohesion} class="mt-1 w-full accent-indigo-600" />
          </label>
        </fieldset>
      </div>
      <div class="mt-4 text-xs text-slate-500">Tip: proportions should sum to 100.</div>
    </div>

    <div class="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm backdrop-blur">
      <h2 class="mb-4 text-lg font-semibold text-slate-800">Slates</h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label class="block text-sm">Slate A – candidates
          <input type="number" min="1" class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" bind:value={slateANum} />
        </label>
        <label class="block text-sm">Slate B – candidates
          <input type="number" min="1" class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" bind:value={slateBNum} />
        </label>
      </div>
    </div>

    <div class="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm backdrop-blur">
      <h2 class="mb-4 text-lg font-semibold text-slate-800">Election mode</h2>
      <div class="flex gap-4">
        <label class="flex items-center gap-2 text-sm">
          <input type="radio" name="mode" value="plurality" bind:group={mode} class="accent-indigo-600" />
          Plurality
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input type="radio" name="mode" value="multiseat" bind:group={mode} class="accent-indigo-600" />
          Multiseat (STV)
        </label>
      </div>
      {#if mode === 'multiseat'}
        <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <label class="block text-sm">Number of seats
            <input type="number" min="1" class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" bind:value={stvNumSeats} />
          </label>
        </div>
      {/if}
    </div>

    <div class="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm backdrop-blur">
      <h2 class="mb-4 text-lg font-semibold text-slate-800">Ballot generator</h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <label class="block text-sm">Generator
          <select class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" bind:value={ballotGenerator}>
            <option value="sBT">sBT</option>
            <option value="sPL">sPL</option>
            <option value="CS">CS</option>
          </select>
        </label>
      </div>
    </div>

    <div class="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm backdrop-blur">
      <h2 class="mb-4 text-lg font-semibold text-slate-800">Trials & verification</h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <label class="block text-sm">Number of trials
          <input type="number" min="1" class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" bind:value={trials} />
        </label>
        <label class="mt-2 flex items-center gap-2 text-sm md:mt-0">
          <input type="checkbox" bind:checked={recaptchaChecked} class="accent-indigo-600" />
          I'm not a robot (mock reCAPTCHA)
        </label>
      </div>
    </div>
  </div>

  <div class="space-y-4">
    <div class="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm backdrop-blur">
      <h2 class="mb-3 text-lg font-semibold text-slate-800">Run details</h2>
      <label class="block text-sm">Run name
        <input class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" bind:value={name} />
      </label>
      <button class="mt-4 w-full rounded-full bg-indigo-600/90 px-4 py-2 text-white shadow-sm transition hover:bg-indigo-600 disabled:opacity-40" on:click={submitMock} disabled={!recaptchaChecked}>
        Run simulation (mock)
      </button>
      <p class="mt-2 text-xs text-slate-500">This saves a mock run and takes you to Results.</p>
    </div>
    <div class="rounded-2xl border border-slate-200/70 bg-white/70 p-5 text-sm text-slate-600 backdrop-blur">
      <p>Preview:</p>
      <ul class="mt-2 list-disc space-y-1 pl-5">
        <li>Blocs: A {blocAProportion}% ({blocAPreference}), B {blocBProportion}% ({blocBPreference}); cohesion A {blocACohesion}%, B {blocBCohesion}%</li>
        <li>Slates: A {slateANum}, B {slateBNum}</li>
        <li>Mode: {mode === 'plurality' ? 'Plurality' : `STV, ${stvNumSeats} seats`}; Generator: {ballotGenerator}</li>
        <li>Trials: {trials}</li>
      </ul>
    </div>
  </div>
</div>


