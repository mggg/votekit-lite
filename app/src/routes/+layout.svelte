<script lang="ts">
	import '../app.css';
	import votekitIcon from '$lib/assets/votekit_icon_naked.png';

</script>

<svelte:head>
</svelte:head>


<div class="min-h-dvh bg-gradient-to-b from-slate-50 to-indigo-50/30 text-slate-900">
	<header class="sticky top-0 z-10 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
		<nav class="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4">
			<a href="/run" class="flex items-center gap-2 font-semibold tracking-tight text-slate-800">
				<img src={votekitIcon} alt="Votekit" class="size-6" />
				<span>Votekit Simulator</span>
			</a>
			<div class="flex items-center gap-1.5 text-sm">
				<a href="/run" class="rounded-full px-3 py-1.5 text-slate-700 hover:bg-white/70 hover:text-slate-900 ring-1 ring-transparent hover:ring-slate-200 transition">Run simulation</a>
				<a href="/results" class="rounded-full px-3 py-1.5 text-slate-700 hover:bg-white/70 hover:text-slate-900 ring-1 ring-transparent hover:ring-slate-200 transition">My results</a>
				<a href="/about" class="rounded-full px-3 py-1.5 text-slate-700 hover:bg-white/70 hover:text-slate-900 ring-1 ring-transparent hover:ring-slate-2 00 transition">About</a>
			</div>
		</nav>
	</header>
	<main class="mx-auto max-w-7xl px-4 py-6">
		<slot />
	</main>
	<footer class="bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
		<div class="mx-auto max-w-7xl px-4 py-6 text-xs text-slate-500">
			© {new Date().getFullYear()} Votekit. Mock UI.
		</div>
	</footer>
</div>
