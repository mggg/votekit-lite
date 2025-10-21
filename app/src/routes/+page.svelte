<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		goto('/run');
	});
</script>

<p class="text-sm text-slate-500">Redirecting…</p>
