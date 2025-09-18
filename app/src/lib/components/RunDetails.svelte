<script lang="ts">
  import { formState } from '$lib/stores/formStore.svelte.ts';
  import { saveRun, mockHistogramData, type Run } from '$lib';
 
  function submitMock() {
    const id = crypto.randomUUID();
    const run: Run = {
      params: {
        id,
        name: formState.name,
        voterBlocs: formState.blocCounts.map((count, index) => ({
          count,
          preference: {
            forA: formState.blocPreferences[index][0] || 'random',
            forB: formState.blocPreferences[index][1] || 'random'
          },
          cohesionPct: formState.blocCohesion[index][0] || 0.7
        })),
        slates: {
          slateA: { numCandidates: formState.slateCandidates[0] || 1 },
          slateB: { numCandidates: formState.slateCandidates[1] || 1 }
        },
        election: formState.mode === 'blocPlurality' ? { mode: 'plurality' } : { mode: 'multiseat', stv: true, numSeats: formState.stvNumSeats },
        ballotGenerator: formState.ballotGenerator,
        trials: formState.trials,
        maxRankingCandidates: formState.maxRankingCandidatesInput,
        numSlates: formState.numSlates,
        slateCandidates: formState.slateCandidates,
        slateNames: formState.slateNames,
        numVoterBlocs: formState.numVoterBlocs,
        blocCounts: formState.blocCounts,
        blocShares: formState.blocShares,
        blocNames: formState.blocNames,
        blocPopulations: formState.blocPopulations,
        blocTurnouts: formState.blocTurnouts,
        blocPreferences: formState.blocPreferences,
        blocCohesion: formState.blocCohesion,
        voterBlocMode: formState.voterBlocMode,
        totalVoters: formState.totalVoters,
        createdAt: Date.now()
      },
      result: {
        slateAElected: mockHistogramData(formState.trials, 0.5, formState.mode === 'multiseat' ? formState.stvNumSeats : 1),
        slateBElected: []
      }
    };
    saveRun(run);
    window.location.href = '/results';
  }
</script>

<div class="rounded-2xl border border-slate-200/70 bg-white/70 p-3 shadow-sm backdrop-blur">
  <h2 class="mb-2 text-lg font-semibold text-slate-800">Run details</h2>
  <label class="block text-sm">Run name
    <input 
      class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" 
      bind:value={formState.name}
    />
  </label>
  <label class="mt-2 block text-sm">Number of trials
    <input 
      type="number" 
      min="1" 
      class="mt-1 w-full rounded-lg border-slate-200 bg-white/70 focus:border-indigo-300 focus:ring-indigo-200" 
      bind:value={formState.trials}
    />
  </label>
  <label class="mt-2 flex items-center gap-2 text-sm">
    <input 
      type="checkbox" 
      bind:checked={formState.recaptchaChecked}
      class="accent-indigo-600" 
    />
    I'm not a robot (mock reCAPTCHA)
  </label>
  <button 
    class="mt-2 w-full rounded-full bg-indigo-600/90 px-4 py-2 text-white shadow-sm transition hover:bg-indigo-600 disabled:opacity-40" 
    on:click={submitMock} 
    disabled={!formState.recaptchaChecked}
  >
    Run simulation (mock)
  </button>
  <p class="mt-2 text-xs text-slate-500">This saves a mock run and takes you to Results.</p>
</div>
