<script lang="ts">
	export let selected: boolean = false;
	export let title: string = '';
	export let description: string = '';
	export let onSelect: (() => void) | undefined;
	export let showOverlay: boolean = false;
</script>

<div class="relative">
	<button
		type="button"
		class="btn flex h-full flex-col items-start gap-0 px-4 py-2 {selected
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
	{#if showOverlay}
		<div class="absolute inset-0 flex items-center justify-center rounded-lg bg-red-500/20">
			<svg class="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="3"
					d="M6 18L18 6M6 6l12 12"
				></path>
			</svg>
		</div>
	{/if}
</div>
