<script lang="ts">
	const sections = [
		{
			title: 'References',
			body: 'To read more about the mathematics that underlies VoteKit Lite, please see our \
			<a href="https://votekit.readthedocs.io/en/latest/social_choice_docs/scr/" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">documentation.</a>\
			To download the Python package VoteKit, please visit our <a href="https://github.com/mggg/VoteKit" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">GitHub.</a>\
			To launch your own instance of VoteKit Lite, please visit this <a href="https://github.com/mggg/votekit-frontend" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">repository.</a>'
		},
		{
			title: 'Have questions?',
			body: 'If you are interested in partnering with us, have questions about VoteKit Lite, or have feedback or a bug to report, \
			reach out to us at <a href="mailto:votekit@mggg.org" class="text-blue-600 underline hover:text-blue-800">votekit@mggg.org</a>. \
			Our team aims to respond within a week.'
		},
		{
			title: 'Development Team',
			body: 'Chris Donnay, Moon Duchin (PI), and Dylan Halpern.'
		}
	];
</script>

<div class="prose max-w-none prose-slate">
	<div class="not-prose card mb-8 bg-base-100 p-6 text-center shadow-sm">
		<h1 class="text-2xl font-semibold text-slate-800">About VoteKit Lite</h1>
		<p class="mt-2 text-left text-slate-600">
			VoteKit Lite is, well, a lite version of the Python package
			<a
				href="https://votekit.readthedocs.io/en/latest/"
				target="_blank"
				rel="noopener noreferrer"
				class="text-blue-600 underline hover:text-blue-800">VoteKit.</a
			>
			Born out of conversations and feedback from community groups and election advocates, VoteKit Lite
			allows users to explore alternative election methods without needing to code in Python. This empowers
			organizations to use modeling tools to inform their decisions about which election methods are
			best for <i>their</i> communities.
		</p>
	</div>

	<div class="not-prose grid grid-cols-1 gap-4 md:grid-cols-1">
		{#each sections as s}
			<div class="card bg-base-100 p-5 shadow-sm">
				<h2 class="text-lg font-semibold text-slate-800">{s.title}</h2>
				<p class="mt-2 text-slate-600">{@html s.body}</p>
			</div>
		{/each}
	</div>
</div>
