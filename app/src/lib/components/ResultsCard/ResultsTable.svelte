<script lang="ts">
	import { COLOR_MAP } from '$lib/constants';
	import type { Run } from '$lib/stores/types';
	import * as d3 from 'd3';

	const { run } = $props<{ run: Run }>();
	const flatValues = $derived(
		Object.values((run as Run).result ?? {})
			.map((result) => Object.values(result))
			.flat()
	);
	const maxValue = $derived(Math.max(...flatValues));
	const minValue = $derived(Math.min(...flatValues));
	const countValues = $derived(
		run.result ? Object.keys(run.result[Object.keys(run.result)[0]]) : []
	);

	const topColor = COLOR_MAP.SLATES[0];
	const y = $derived(
		d3
			.scaleLinear()
			.domain([minValue, maxValue])
			.range(['white', topColor] as any)
	);
</script>

<table class="table table-xs">
	<thead>
		<tr>
			<th>Slate</th>
			{#each countValues as countValue}
				<th>{countValue}</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each Object.keys(run.result ?? {}) as slate}
			<tr>
				<td class="aspect-square">{slate}</td>
				{#each Object.entries(run.result?.[slate] ?? {}).sort((a, b) => (a as any) - (b as any)) as [_, count]}
					<td class="aspect-square" style={`background-color:${y(count as any)};`}>{count}</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>
