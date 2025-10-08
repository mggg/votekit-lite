<script lang="ts">
	import type { Snippet } from 'svelte';
	const { title, children } = $props<{ title: string; children: Snippet }>();
</script>

<div>
	<h3 class="mb-1 text-base font-bold">{title}</h3>
	{@render children()}
</div>
