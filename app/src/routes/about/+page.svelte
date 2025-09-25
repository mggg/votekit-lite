<script lang="ts">
  const sections = [
    { title: 'Overview', body: 'This is a high-fidelity mock UI for a voting simulation frontend. The real computation will be provided by a separate library.' },
    { title: 'Voter blocs', body: 'Two blocs with adjustable proportions, Dirichlet alpha for candidate strengths, and cohesion to model bloc loyalty.' },
    { title: 'Slates', body: 'Two candidate slates with configurable counts. Results highlight the number of candidates elected from each slate.' },
    { title: 'Election modes', body: 'Plurality with selectable ballot generators (sBT, sPL, CS) and Multiseat STV with configurable seats.' },
    { title: 'Results', body: 'Histogram of elected seats and a parameter summary. Recent runs are stored in localStorage for this mock.' }
  ];
</script>

<div class="prose prose-slate max-w-none">
  <div class="not-prose mb-8 card bg-base-100 p-6 text-center shadow-sm">
    <h1 class="text-2xl font-semibold text-slate-800">About this project</h1>
    <p class="mt-2 text-slate-600">A friendly mock interface for a voting simulation library, built with SvelteKit and Tailwind CSS.</p>
  </div>

  <div class="not-prose grid grid-cols-1 gap-4 md:grid-cols-2">
    {#each sections as s}
      <div class="card bg-base-100 p-5 shadow-sm">
        <h2 class="text-lg font-semibold text-slate-800">{s.title}</h2>
        <p class="mt-2 text-slate-600">{s.body}</p>
      </div>
    {/each}
  </div>

  <div class="not-prose mt-8 card bg-base-100 p-5 shadow-sm">
    <h2 class="text-lg font-semibold text-slate-800">Next steps</h2>
    <ul class="mt-2 list-disc space-y-1 pl-5 text-slate-700">
      <li>Wire form to the simulation engine</li>
      <li>Validate inputs and add presets</li>
      <li>Add charts and richer reporting</li>
      <li>Persist runs to backend and support sharing</li>
    </ul>
  </div>
</div>


