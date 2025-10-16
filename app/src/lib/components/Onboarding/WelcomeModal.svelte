<script lang="ts">
	import { tourState } from '$lib/stores/tourStore.svelte';
	const previouslyDismissed =
		typeof localStorage !== 'undefined' && localStorage.getItem('dontShowWelcomeModal') === 'true';
	let modalOpen = $state(!previouslyDismissed);
	let dontShowAgain = $state(previouslyDismissed);
	const toggleDontShowAgain = () => {
		localStorage.setItem('dontShowWelcomeModal', 'true');
	};
</script>

<dialog id="modal-welcome" class="modal {modalOpen ? 'modal-open' : 'hidden'}">
	<div class="modal-box">
		<h3 class="text-lg font-bold">Welcome to VoteKit Lite!</h3>
		<p class="py-4">If this is your first time here, take a tour to see how to use this tool.</p>
		<div class="flex flex-row gap-4">
			<button
				class="btn btn-soft btn-primary"
				onclick={() => {
					console.log('tour started');
					tourState.isTouring = true;
					modalOpen = false;
				}}>Tour VoteKit Lite</button
			>
			<button class="btn btn-soft" onclick={() => (modalOpen = false)}>Start Simulating</button>
		</div>
		<!-- checkbox don't show me this again -->
		<label class="label mt-4">
			<input
				type="checkbox"
				checked={dontShowAgain}
				class="checkbox"
				onchange={() => toggleDontShowAgain()}
			/>
			Don't show me this again
		</label>
	</div>
</dialog>
