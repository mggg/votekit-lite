<script lang="ts">
  import { listRuns, type Run } from '$lib';
	import type { VotekitConfig } from '$lib/types/votekitConfig';
  import { onMount } from 'svelte';

  let runs: Run[] = [];
  let selectedIds: string[] = [];
  let selectedRuns: Run[] = [];

  const palette = [
    { name: 'indigo', hex: '#6366f1' },
    { name: 'emerald', hex: '#10b981' },
    { name: 'amber', hex: '#f59e0b' },
    { name: 'rose', hex: '#f43f5e' },
    { name: 'sky', hex: '#0ea5e9' },
    { name: 'violet', hex: '#8b5cf6' }
  ];

  function getColorHexForId(id: string) {
    const idx = selectedIds.indexOf(id);
    const color = palette[idx % palette.length];
    return color?.hex || palette[0].hex;
  }

  onMount(() => {
    runs = listRuns();
    const first = runs[0]?.params.id;
    selectedIds = first ? [first] : [];
  });

  function toggleSelected(id: string) {
    if (selectedIds.includes(id)) {
      selectedIds = selectedIds.filter((x) => x !== id);
    } else {
      selectedIds = [...selectedIds, id];
    }
  }

  function selectAll() {
    selectedIds = runs.map((r) => r.params.id);
  }

  function clearSelection() {
    selectedIds = [];
  }

  function totalTrials(run: Run | undefined) {
    if (!run) return 0;
    return run.params.trials;
  }

  function formatMode(election: VotekitConfig['election']): string {
    if (election.system === 'blocPlurality') return `Bloc plurality`;
    return `STV, ${election.numSeats} seats`;
  }

  $: selectedRuns = runs.filter((r) => selectedIds.includes(r.params.id));
</script>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
  <aside class="lg:col-span-1 rounded-2xl border border-slate-200/70 bg-white/70 p-3 shadow-sm backdrop-blur">
    <div class="mb-3 flex items-center justify-between">
      <h2 class="text-sm font-semibold text-slate-800">My runs</h2>
      <div class="flex gap-1">
        <button class="rounded-full px-2 py-1 text-xs text-slate-600 hover:bg-white/70 hover:ring-1 hover:ring-slate-200" on:click={selectAll}>Select all</button>
        <button class="rounded-full px-2 py-1 text-xs text-slate-600 hover:bg-white/70 hover:ring-1 hover:ring-slate-200" on:click={clearSelection}>Clear</button>
      </div>
    </div>
    <div class="space-y-1">
      {#if runs.length === 0}
        <p class="text-sm text-slate-500">No runs yet. Create one on the Run page.</p>
      {:else}
        {#each runs as run}
          <button class="relative w-full rounded-xl px-2 py-2 pl-3 text-left text-sm hover:bg-white/70 hover:ring-1 hover:ring-slate-200 transition {selectedIds.includes(run.params.id) ? 'bg-white/70 ring-1 ring-slate-200' : ''}"
            on:click={() => toggleSelected(run.params.id)}>
            {#if selectedIds.includes(run.params.id)}
              <span class="absolute left-1 top-1/2 -translate-y-1/2" style={`background-color:${getColorHexForId(run.params.id)}; width:8px; height:8px; border-radius:9999px`}></span>
            {/if}
            <div class="truncate">{run.params.name}</div>
            <div class="text-xs text-slate-500">{new Date(run.params.createdAt).toLocaleString()}</div>
          </button>
        {/each}
      {/if}
    </div>
  </aside>

  <section class="lg:col-span-3 space-y-6">
    <div class="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm backdrop-blur">
      <h2 class="mb-2 text-lg font-semibold text-slate-800">Report</h2>
      {#if selectedIds.length === 0}
        <p class="text-sm text-slate-500">Select at least one run to view results.</p>
      {:else}
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {#each selectedRuns as selected}
            <div class="rounded-xl border border-slate-200/70 bg-white/70 p-4" style={`border-top:4px solid ${getColorHexForId(selected.params.id)}` }>
              <h3 class="mb-2 text-sm font-medium text-slate-700 truncate">{selected.params.name}</h3>
              <div class="grid grid-cols-6 items-end gap-2 rounded-xl border border-slate-200/70 bg-gradient-to-b from-indigo-50/60 to-white p-3">
                {#each selected.result.slateAElected as count, seats}
                  <div class="flex flex-col items-center gap-1">
                    <div class="w-full rounded-lg shadow-sm" style={`background-color:${getColorHexForId(selected.params.id)}; opacity:0.85; height:${count === 0 ? 4 : Math.min(160, 10 + count)}px`}></div>
                    <span class="text-[11px] text-slate-600">{seats}</span>
                  </div>
                {/each}
              </div>
              <dl class="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <dt class="text-slate-500">Blocs</dt>
                <dd>
                  <!-- TODO Fix run output -->
                  <!-- A {selected.params.voterBlocs.blocA.count} (A→A {selected.params.voterBlocs.blocA.preference.forA}, A→B {selected.params.voterBlocs.blocA.preference.forB}), -->
                  <!-- B {selected.params.voterBlocs.blocB.count} (B→B {selected.params.voterBlocs.blocB.preference.forB}, B→A {selected.params.voterBlocs.blocB.preference.forA}) -->
                </dd>
                <dt class="text-slate-500">Mode</dt>
                <dd>{formatMode(selected.params.election)}</dd>
                <dt class="text-slate-500">Behavior</dt>
                <dd>{selected.params.ballotGenerator}</dd>
                <dt class="text-slate-500">Trials</dt>
                <dd>{selected.params.trials}</dd>
              </dl>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <div class="rounded-2xl border border-slate-200/70 bg-white/70 p-5 text-sm text-slate-600 backdrop-blur">
      <p>Recent runs are stored locally in your browser for this mockup.</p>
    </div>
  </section>
</div>


