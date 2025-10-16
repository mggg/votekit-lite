<script lang="ts">
	import { tourState } from '$lib/stores/tourStore.svelte';
	let top = $state(0);
	let left = $state(0);
	let maxWidth = $state(300);

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
		const scrollY = entry.sticky ? 0 : window.scrollY || window.pageYOffset;
		const scrollX = entry.sticky ? 0 : window.scrollX || window.pageXOffset;
		const rect = element?.getBoundingClientRect() ?? { top: 0, left: 0, height: 0, width: 0 };
		const elementTop = rect.top + scrollY;
		const elementLeft = rect.left + scrollX;
		const elementHeight = rect.height;
		const elementWidth = rect.width;

		if (entry.position === 'top') {
			top = elementTop - 20; // place above element, adjust 20px upward
		} else {
			// default to bottom
			top = elementTop + elementHeight + 20;
		}

		if (entry.sticky) {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		} else if (entry.position === 'top') {
			window.scrollTo({ top: elementTop + scrollY + elementHeight - 100, behavior: 'smooth' });
		} else {
			window.scrollTo({ top: rect.top + scrollY - 100, behavior: 'smooth' });
		}

		// TODO: handle left/right positions
		left = elementLeft;
		maxWidth = elementWidth;
	});
</script>

{#if tourState.isTouring}
	<div
		style={`top: ${top}px; left: ${left}px; z-index: 1000; max-width: ${maxWidth}px;
		${tourState.steps[tourState.currentStep]?.position === 'top' ? 'transform: translateY(-100%);' : ''}
		`}
		class="{tourState.steps[tourState.currentStep]?.sticky
			? 'fixed'
			: 'absolute'} rounded-md border-2 border-primary bg-white p-4 shadow-xl"
	>
		<div class="flex w-full flex-row justify-between gap-2">
			<h1 class="text-lg font-bold">{tourState.steps[tourState.currentStep].title}</h1>
			<button
				onclick={() => {
					tourState.isTouring = false;
					tourState.currentStep = 0;
				}}>&times;</button
			>
		</div>
		<p>{tourState.steps[tourState.currentStep].description}</p>
		<button
			class="btn btn-outline"
			onclick={() => tourState.stepDown()}
			disabled={tourState.currentStep === 0}>Prev</button
		>
		<button
			class="btn btn-outline {tourState.lastStep ? 'btn-primary' : 'btn-outline'}"
			onclick={!tourState.lastStep
				? () => tourState.stepUp()
				: () => {
						tourState.isTouring = false;
						tourState.currentStep = 0;
					}}
			disabled={!tourState.isTouring}
		>
			{tourState.lastStep ? 'End' : 'Next'}
		</button>
	</div>
{/if}
