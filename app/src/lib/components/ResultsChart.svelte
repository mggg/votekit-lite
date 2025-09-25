<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { resultsState } from '$lib/stores/resultsStore.svelte';
	import { COLOR_MAP } from '$lib/constants';
	const { runId } = $props();
	const data = resultsState.runs.find((r) => r.id === runId)?.result;

	let container: HTMLDivElement;

	const margin = { top: 20, right: 20, bottom: 40, left: 50 };
	const width = 600;
	const height = 400;

	onMount(() => {
		if (!data) return;

		// Transform input into flat array
		const groups = Object.keys(data); // groupNames (outer colors)
		const entries = Array.from(new Set(Object.values(data).flatMap(Object.keys))); // x-axis categories

		const flatData = entries.flatMap((entry) =>
			groups.map((group) => ({
				entry,
				group,
				// @ts-expect-error
				value: data[group]?.[entry] ?? 0
			}))
		);

		// Clear previous svg if hot reloaded
		d3.select(container).selectAll('*').remove();

		const svg = d3.select(container).append('svg').attr('width', width).attr('height', height);

		const innerWidth = width - margin.left - margin.right;
		const innerHeight = height - margin.top - margin.bottom;

		const x0 = d3.scaleBand().domain(entries).range([0, innerWidth]).paddingInner(0.2);

		const x1 = d3.scaleBand().domain(groups).range([0, x0.bandwidth()]).padding(0.05);

		const y = d3
			.scaleLinear()
			.domain([0, d3.max(flatData, (d) => d.value)!])
			.nice()
			.range([innerHeight, 0]);

		const color = d3.scaleOrdinal(COLOR_MAP.SLATES).domain(groups);

		const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

		// X axis
		g.append('g').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(x0));

		// Y axis
		g.append('g').call(d3.axisLeft(y));

		// Bars
		g.append('g')
			.selectAll('g')
			.data(
				flatData.reduce(
					(acc, d) => {
						const group = acc.find((g) => g.entry === d.entry);
						if (group) group.values.push(d);
						else acc.push({ entry: d.entry, values: [d] });
						return acc;
					},
					[] as { entry: string; values: typeof flatData }[]
				)
			)
			.join('g')
			.attr('transform', (d) => `translate(${x0(d.entry)!},0)`)
			.selectAll('rect')
			.data((d) => d.values)
			.join('rect')
			.attr('x', (d) => x1(d.group)!)
			.attr('y', (d) => y(d.value))
			.attr('width', x1.bandwidth())
			.attr('height', (d) => innerHeight - y(d.value))
			.attr('fill', (d) => color(d.group)!);

		// Legend
		const legend = svg.append('g').attr('transform', `translate(${margin.left},${height - 5})`);

		groups.forEach((group, i) => {
			const legendGroup = legend.append('g').attr('transform', `translate(${i * 100},0)`);

			legendGroup
				.append('rect')
				.attr('x', 0)
				.attr('y', -15)
				.attr('width', 12)
				.attr('height', 12)
				.attr('fill', color(group)!);

			legendGroup
				.append('text')
				.attr('x', 18)
				.attr('y', -5)
				.text(group)
				.style('font-size', '12px')
				.attr('alignment-baseline', 'middle');
		});
	});
</script>

<div bind:this={container}></div>
