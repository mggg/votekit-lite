<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { resultsState } from '$lib/stores/resultsStore.svelte';
	import { COLOR_MAP } from '$lib/constants';

	// props (Svelte 5 runes)
	const { runId } = $props<{ runId: string }>();

	// sizing
	const DEFAULT_WIDTH = 500;
	const DEFAULT_HEIGHT = 240;
	const margin = { top: 60, right: 0, bottom: 40, left: 44 }; // increase left margin for y label

	let svg = $state<SVGSVGElement>();
	let width = $state(DEFAULT_WIDTH);
	let height = $state(DEFAULT_HEIGHT);
	const innerWidth = $derived(Math.max(0, width - margin.left - margin.right));
	const innerHeight = $derived(Math.max(0, height - margin.top - margin.bottom));

	function resize() {
		const box = svg?.getBoundingClientRect();

		({ width, height } = box
			? { width: box.width, height: box.height }
			: { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
	}
	onMount(resize);

	// data
	const raw = $derived(resultsState.runs.find((r) => r.id === runId)?.result ?? {});
	const groups = $derived(Object.keys(raw)); // series keys
	const maxNameLength = $derived(Math.max(...groups.map((g) => g.length)));
	const entries = $derived(
		Array.from(new Set(Object.values(raw).flatMap((d: any) => Object.keys(d ?? {}))))
	);
	let hoveredGroupIndex = $state<number | null>(null);

	// interactive series filter (legend toggles)
	let hiddenSlates = $state<Record<string, boolean>>({});
	$effect(() => {
		hiddenSlates = raw ? Object.fromEntries(groups.map((g) => [g, false])) : {};
		return () => {
			hiddenSlates = {};
		};
	});

	const visibleGroups = $derived(groups.filter((g) => !hiddenSlates[g]));

	const allHidden = $derived(Object.values(hiddenSlates).every((h) => h));

	// flatten for stats
	type Row = { entry: string; group: string; value: number };
	const flatData = $derived<Row[]>(
		entries.flatMap((entry) =>
			visibleGroups.map((group) => ({
				entry,
				group,
				// @ts-expect-error
				value: (raw?.[group]?.[entry] ?? 0) as number
			}))
		)
	);

	// scales
	const x0 = $derived(
		d3.scaleBand<string>().domain(entries).range([0, innerWidth]).paddingInner(0.2)
	);
	const x1 = $derived(
		d3.scaleBand<string>().domain(visibleGroups).range([0, x0.bandwidth()]).padding(0.05)
	);
	const yMax = $derived(d3.max(flatData, (d) => d.value) ?? 0);
	const y = $derived(d3.scaleLinear().domain([0, yMax]).nice().range([innerHeight, 0]));
	const color = $derived(d3.scaleOrdinal<string, string>().domain(groups).range(COLOR_MAP.SLATES));

	// axis ticks/format
	const yTicks = $derived(y.ticks(Math.min(6, Math.max(2, Math.floor(innerHeight / 40)))));
	const formatY = (v: number) => d3.format('~s')(v);

	// helpers to group by entry for markup
	const byEntry = $derived(
		entries.map((entry) => ({
			entry,
			values: visibleGroups.map((group) => ({
				entry,
				group,
				// @ts-expect-error
				value: (raw?.[group]?.[entry] ?? 0) as number
			}))
		}))
	);

	// legend interaction
	function toggleGroup(g: string) {
		if (groups.length === 1) return;
		hiddenSlates = {
			...hiddenSlates,
			[g]: !hiddenSlates[g]
		};
	}

	function isActive(g: string) {
		return !hiddenSlates[g];
	}

	// Placeholder mouse event handlers for invisible bars
	function handleBarMouseEnter(idx: number) {
		hoveredGroupIndex = idx;
	}
	function handleBarMouseLeave() {
		hoveredGroupIndex = null;
	}
</script>

<svelte:window onresize={resize} />
{#if hoveredGroupIndex !== null}
	<div
		class="pointer-events:none; absolute top-[50%] rounded-md bg-base-100 p-2 shadow-md"
		style={`left: ${x0(byEntry[hoveredGroupIndex].entry) ?? 0}px; transform: translate(-50%, -50%); pointer-events: none !important;`}
	>
		<p class="text-xs font-bold">Elections with {hoveredGroupIndex} seats won</p>
		{#each byEntry[hoveredGroupIndex].values as g}
			<p class="text-xs">
				<b>{g.group}:</b>
				{g.value}
			</p>
		{/each}
	</div>
{/if}
{#if allHidden}
	<div class="absolute top-0 left-0 flex h-full w-96 items-center justify-center">
		<p class="w-1/2 text-center text-sm text-amber-600">
			All slates hidden. Select a slate in the legend to show its results.
		</p>
	</div>
{/if}
<svg bind:this={svg} {height}>
	<!-- chart group with margins -->
	<g transform={`translate(${margin.left},${margin.top})`}>
		<!-- Y gridlines -->
		<g aria-hidden="true">
			{#each yTicks as t}
				<line x1="0" x2={innerWidth} y1={y(t)} y2={y(t)} stroke="#ddd" stroke-width="1" />
			{/each}
		</g>

		<!-- grouped bars with invisible background bars for interaction -->
		{#each byEntry as bucket, idx}
			<g transform={`translate(${x0(bucket.entry) ?? 0},0)`}>
				<!-- Invisible background bar for group interaction -->
				{#each bucket.values as d}
					<rect
						x={x1(d.group) ?? 0}
						y={y(d.value)}
						width={x1.bandwidth()}
						height={Math.max(0, innerHeight - y(d.value))}
						fill={color(d.group)}
						opacity={isActive(d.group) ? 1 : 0.35}
						class="pointer-events:none;"
					>
						<title>{d.group} • {bucket.entry}: {d.value}</title>
					</rect>
				{/each}
				<rect
					x="0"
					y="0"
					width={x0.bandwidth()}
					height={innerHeight}
					fill={hoveredGroupIndex === idx ? 'rgba(0, 0, 0, 0.05)' : 'transparent'}
					style="pointer-events: all;"
					onmouseenter={() => handleBarMouseEnter(idx)}
					onmouseleave={() => handleBarMouseLeave()}
					aria-hidden="true"
				/>
			</g>
		{/each}

		<!-- X axis -->
		<g transform={`translate(0,${innerHeight})`}>
			<line x1="0" x2={innerWidth} y1="0" y2="0" stroke="#333" stroke-width="1" />
			{#each entries as e}
				<g transform={`translate(${(x0(e) ?? 0) + x0.bandwidth() / 2},0)`}>
					<line y2="6" stroke="#333" />
					<text y="9" dy="0.71em" text-anchor="middle" font-size="11" fill="#333">
						{e}
					</text>
				</g>
			{/each}
			<!-- X axis label -->
			<text
				x={margin.left}
				y="30"
				text-anchor="middle"
				font-size="10"
				fill="#333"
				font-weight="normal"
			>
				Number of Seats Won
			</text>
		</g>

		<!-- Y axis -->
		<g>
			<line x1="0" x2="0" y1="0" y2={innerHeight} stroke="#333" stroke-width="1" />
			{#each yTicks as t}
				<g transform={`translate(0,${y(t)})`}>
					<line x2="-6" stroke="#333" />
					<text x="-9" dy="0.32em" text-anchor="end" font-size="11" fill="#333">
						{formatY(t)}
					</text>
				</g>
			{/each}
			<!-- Y axis label -->
			<text
				x="-44"
				y={innerHeight / 2}
				text-anchor="middle"
				font-size="10"
				fill="#333"
				font-weight="normal"
				transform={`rotate(-90 -36,${innerHeight / 2})`}
			>
				Frequency of Result
			</text>
		</g>
	</g>

	<!-- Legend (vertical, truncated, translucent background) -->
	<g transform={`translate(${width - (Math.min(5, maxNameLength) * 10 + 42)}, 20)`}>
		<rect
			x="-10"
			y="-18"
			width={Math.min(5, maxNameLength) * 10 + 42}
			height={groups.length * 24 + 10}
			fill="rgba(255, 255, 255, 0.9)"
			stroke="rgba(0, 0, 0, 0.25)"
			stroke-width="1"
			opacity="1"
			rx="6"
		/>
		{#each groups as g, i}
			<g
				transform={`translate(0,${i * 24})`}
				onclick={() => toggleGroup(g)}
				style="cursor: pointer;"
				aria-hidden="true"
			>
				<rect
					x="0"
					y="-10"
					width="16"
					height="16"
					fill={isActive(g) ? color(g) : 'transparent'}
					stroke={color(g)}
					stroke-width={isActive(g) ? 0 : 1}
					opacity={1}
					rx="3"
				/>
				<text x="22" y="2" font-size="12" fill="#222">
					{g.length > 7 ? `${g.slice(0, 7)}…` : g}
				</text>
			</g>
		{/each}
	</g>
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		margin-top: -40px;
	}
	text {
		user-select: none;
	}
</style>
