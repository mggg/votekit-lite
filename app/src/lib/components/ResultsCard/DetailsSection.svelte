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

<div class="collapse-arrow collapse rounded-none border-b-1 border-b-base-300 p-0">
	<input
		type="radio"
		name="run-details-accordion"
		checked={open}
		onchange={() => onOpenChange(open)}
	/>
	<div class="collapse-title font-semibold">{title}</div>
	<div class="collapse-content text-sm">
		{@render children()}
	</div>
</div>
