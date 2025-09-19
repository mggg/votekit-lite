<script lang="ts">
	export let selected: boolean = false;
	export let title: string = '';
	export let description: string = '';
	export let onSelect: (() => void) | undefined;
</script>

<button
	type="button"
	class="btn flex h-auto flex-col items-start gap-0 px-4 py-2 btn-soft {selected
		? 'btn-primary'
		: 'btn-secondary'}"
	aria-pressed={selected}
	on:click={() => onSelect && onSelect()}
>
	<div class="text-md">{title}</div>
	{#if description}
		<div class="mt-1 text-xs font-light">{description}</div>
	{/if}
</button>
