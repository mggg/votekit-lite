<script lang="ts">
	import { tourState } from '$lib/stores/tourStore.svelte';
	let top = $state(0);
	let left = $state(0);

	const removeTourFocused = () => {
		// remove tour-focused class from all elements
		const elements = document.querySelectorAll('.tour-focused');
		elements.forEach((element) => {
			element.classList.remove('tour-focused');
		});
	};
	$effect(() => {
		removeTourFocused();
		if (!tourState.isTouring) {
			return;
		}
		const entry = tourState.steps[tourState.currentStep];
		const element = document.getElementById(entry.id);
		// apply "tour-focused" class to element
		element?.classList.add('tour-focused');
		// get the element position and
		const elementTop = element?.getBoundingClientRect().top ?? 0;
		const elementLeft = element?.getBoundingClientRect().left ?? 0;
		const elementHeight = element?.getBoundingClientRect().height ?? 0;
		top = elementTop + elementHeight + 20;
		left = elementLeft;
	});
</script>

{#if tourState.isTouring}
	<div
		style={`top: ${top}px; left: ${left}px; z-index: 1000;`}
		class="absolute rounded-md border-2 border-primary bg-white p-4 shadow-xl"
	>
		<div class="flex w-full flex-row justify-between gap-2">
			<h1 class="text-lg font-bold">{tourState.steps[tourState.currentStep].title}</h1>
			<button onclick={() => (tourState.isTouring = false)}>&times;</button>
		</div>
		<p>{tourState.steps[tourState.currentStep].description}</p>
		<button
			class="btn btn-outline"
			onclick={() => tourState.stepDown()}
			disabled={tourState.currentStep === 0}>Prev</button
		>
		<button
			class="btn btn-outline"
			onclick={!tourState.lastStep ? () => tourState.stepUp() : () => (tourState.isTouring = false)}
			disabled={!tourState.isTouring}
		>
			{tourState.lastStep ? 'End' : 'Next'}
		</button>
	</div>
{/if}
