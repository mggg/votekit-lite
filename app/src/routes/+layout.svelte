<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';
	import { NAV_CONFIG } from '$lib/constants';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<div class="min-h-dvh bg-gradient-to-b from-slate-50 to-indigo-50/30 text-slate-900">
	<header class="sticky top-0 z-10">
		<div class="navbar bg-base-100/90 backdrop-blur supports-[backdrop-filter]:bg-base-100/80">
			<div class="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-2">
				<a href="/run" class="flex items-center gap-2 font-semibold tracking-tight text-slate-800">
					<img src={favicon} alt="Votekit" class="size-6" />
					<span>Votekit Simulator</span>
				</a>
				<div class="flex items-center gap-1.5 text-sm">
					{#each NAV_CONFIG as config}
						<a
							href={config.href}
							class={`btn btn-ghost btn-sm ${$page.url.pathname === config.href ? 'bg-blue-300 btn-soft' : ''}`}
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
			© {new Date().getFullYear()} Votekit. Mock UI.
		</div>
	</footer>
</div>
