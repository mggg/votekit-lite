<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/draft-logo-2.png';
	import { page } from '$app/stores';
	import { NAV_CONFIG } from '$lib/constants';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>VoteKit Lite: social choice research & computational toolkit</title>
	<meta
		name="description"
		content="VoteKit Lite is a tool for simulating elections and voting systems."
	/>
	<meta name="keywords" content="VoteKit Lite, elections, voting systems, simulation" />
	<meta name="author" content="VoteKit Lite" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta name="robots" content="index, follow" />
	<meta name="googlebot" content="index, follow" />
	<meta name="bingbot" content="index, follow" />
	<script
		defer
		src="https://analytics.ds.uchicago.edu/script.js"
		data-website-id="426f6f26-02e9-49aa-b9e4-1ff5e0861c71"
	></script>
</svelte:head>
<div class="min-h-dvh bg-gradient-to-b from-slate-50 to-indigo-50/30 text-slate-900">
	<header class="sticky top-0 z-10 shadow-sm">
		<div class="navbar bg-base-100/90 backdrop-blur supports-[backdrop-filter]:bg-base-100/80">
			<div class="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-2">
				<a href="/run" class="flex items-center gap-2 font-semibold tracking-tight text-slate-800">
					<img src={favicon} alt="Votekit" class="size-10" />
					<h1 class="text-2xl font-bold text-primary">VoteKit Lite</h1>
				</a>
				<div class="flex items-center gap-1.5 text-sm">
					{#each NAV_CONFIG as config}
						<a
							href={config.href}
							class={`btn btn-ghost btn-sm ${$page.url.pathname === config.href ? 'border-primary text-primary' : ''}`}
							>{config.label}</a
						>
					{/each}
				</div>
			</div>
		</div>
	</header>
	<main class="mx-auto max-w-7xl px-4 py-6">
		<slot />
	</main>
	<footer class="footer bg-base-100 text-xs text-slate-500">
		<div class="mx-auto w-full max-w-7xl px-4 py-6">
			© {new Date().getFullYear()} Data and Democracy Lab.
		</div>
	</footer>
</div>
