<script lang="ts">
	export let selected: boolean = false;
	export let title: string = '';
	export let description: string = '';
	export let onSelect: (() => void) | undefined;
</script>

<button
	type="button"
	class="rounded-xl border border-slate-200/70 bg-white/60 p-3 text-left text-sm transition hover:bg-white/80 focus:outline-none {selected
		? 'ring-2 ring-indigo-300'
		: ''}"
	aria-pressed={selected}
	on:click={() => onSelect && onSelect()}
>
	<div class="font-medium">{title}</div>
	{#if description}
		<div class="mt-1 text-xs text-slate-600">{description}</div>
	{/if}
</button>
