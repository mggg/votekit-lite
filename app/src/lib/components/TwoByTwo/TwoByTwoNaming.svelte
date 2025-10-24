<script lang="ts">
	import { formState } from '$lib/stores/formStore.svelte';
	import PalettePip from '../PalettePip.svelte';
</script>

<div class="card bg-base-100 p-4 shadow-sm">
	<h2 class="mb-2 text-lg font-semibold text-slate-800">Name your groups</h2>
	<p class="mb-4 text-sm text-slate-500">
		First, give names to the two groups of voters (blocs). These names will also be used for their
		preferred candidate slates.
	</p>

	<div class="grid grid-cols-1 gap-3 md:grid-cols-2">
		{#each formState.blocs.slice(0, 2) as bloc, index}
			<div class="flex items-center gap-2">
				<PalettePip
					color={bloc.color}
					onChange={(color: string) => {
						bloc.color = color;
						formState.slates[index].color = color;
					}}
				/>
				<label class="input input-sm w-full">
					<span class="text-gray-400">Group {index + 1}</span>
					<input
						type="text"
						class="w-full grow px-1 text-sm"
						placeholder={`e.g., Group ${String.fromCharCode(65 + index)}`}
						value={bloc.name}
						oninput={(e) => {
							console.log(e.currentTarget.value);
							bloc.name = e.currentTarget.value;
							formState.slates[index].name = e.currentTarget.value;
						}}
					/>
				</label>
			</div>
		{/each}
	</div>
</div>
