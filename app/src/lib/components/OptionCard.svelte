<script lang="ts">
	export let selected: boolean = false;
	export let title: string = '';
	export let description: string = '';
	export let onSelect: (() => void) | undefined;
</script>

<button
	type="button"
	class="btn flex h-auto flex-col items-start gap-0 px-4 py-2 {selected
		? 'btn-outline btn-primary hover:text-white'
		: 'btn-soft btn-secondary'}"
	aria-pressed={selected}
	onclick={() => onSelect && onSelect()}
>
	<div class="text-md text-left">{title}</div>
	{#if description}
		<div class="mt-1 text-left text-xs">{description}</div>
	{/if}
</button>
