<script lang="ts">
	const sections = [
		{
			title: 'Overview',
			body: 'This interfaces allows users to run simulations using the VoteKit python library without the need for coding or a developer set up.'
		},
		{
			title: 'Voter blocs',
			body: 'Voters blocs with adjustable proportions, Dirichlet alpha for candidate strengths, and cohesion to model bloc loyalty.'
		},
		{
			title: 'Slates',
			body: 'Two or more candidate slates with configurable counts. Results highlight the number of candidates elected from each slate.'
		},
		{
			title: 'Election modes',
			body: 'Plurality with selectable ballot generators (sBT, sPL, CS) and Multiseat STV with configurable seats.'
		},
		{
			title: 'Results',
			body: 'Histogram of elected seats and a parameter summary. Recent runs are stored in localStorage.'
		}
	];
</script>

<div class="prose max-w-none prose-slate">
	<div class="not-prose card mb-8 bg-base-100 p-6 text-center shadow-sm">
		<h1 class="text-2xl font-semibold text-slate-800">About this project</h1>
		<p class="mt-2 text-slate-600">
			A friendly interface for a voting simulation library, built with SvelteKit and Tailwind CSS.
		</p>
	</div>

	<div class="not-prose grid grid-cols-1 gap-4 md:grid-cols-2">
		{#each sections as s}
			<div class="card bg-base-100 p-5 shadow-sm">
				<h2 class="text-lg font-semibold text-slate-800">{s.title}</h2>
				<p class="mt-2 text-slate-600">{s.body}</p>
			</div>
		{/each}
	</div>
</div>
