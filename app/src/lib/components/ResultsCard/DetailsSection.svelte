<script lang="ts">
	const {
		title,
		open = false,
		onOpenChange,
		children
	} = $props<{
		title: string;
		open?: boolean;
		onOpenChange: (title: string) => void;
		children: any;
	}>();
</script>

<div
	class="collapse-arrow collapse rounded-none border-b-1 border-b-base-300 p-0 {open
		? 'collapse-open'
		: 'collapse-close'}"
>
	<button
		class="collapse-title cursor-pointer text-left font-semibold"
		onclick={() => onOpenChange(title)}>{title}</button
	>
	<div class="collapse-content text-sm">
		{@render children()}
	</div>
</div>
