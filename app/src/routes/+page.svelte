<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		goto('/2x2');
	});
</script>

<p class="text-sm text-slate-500">Redirecting…</p>
