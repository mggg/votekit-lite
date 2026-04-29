<script lang="ts">
	const {
		color,
		size = 'size-4',
		editable = true,
		onChange = () => {}
	} = $props<{
		color: string;
		size?: string;
		editable?: boolean;
		onChange?: (color: string) => void;
	}>();

	const FALLBACK_COLOR = '#999999';
	const normalizeColor = (value: string) =>
		/^#[0-9a-fA-F]{6}$/.test(value) ? value : FALLBACK_COLOR;
</script>

{#if editable}
	<div
		class="tooltip tooltip-right m-0 aspect-square flex-none p-0 {!editable &&
			'pointer-events-none'} aspect-square {size} relative overflow-hidden rounded-full"
		data-tip={'Edit color'}
	>
		<input
			type="color"
			class="size-[150%]"
			style="transform:translate(-4px, -4px)"
			value={normalizeColor(color)}
			onchange={(e) => onChange(e.currentTarget.value)}
		/>
	</div>
{:else}
	<span
		class="aspect-square {size} rounded-full"
		style={`background-color: ${normalizeColor(color)}`}
	></span>
{/if}
