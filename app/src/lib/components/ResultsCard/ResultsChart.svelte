<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { resultsState } from '$lib/stores/resultsStore.svelte';
	import { calculateCombinedSupport } from '$lib/stores/utils';
	import { DEFAULT_SLATE_BLOCS } from '$lib/constants';

	// props (Svelte 5 runes)
	const { runId } = $props<{ runId: string }>();
	// sizing
	const DEFAULT_WIDTH = 500;
	const DEFAULT_HEIGHT = 240;
	const margin = { top: 80, right: 0, bottom: 40, left: 64 }; // increase left margin for y label

	let svg = $state<SVGSVGElement>();
	let width = $state(DEFAULT_WIDTH);
	let height = $state(DEFAULT_HEIGHT);
	const innerWidth = $derived(Math.max(0, width - margin.left - margin.right));
	const innerHeight = $derived(Math.max(0, height - margin.top - margin.bottom));

	function resize() {
		const box = svg?.getBoundingClientRect();
		({ width, height } =
			box && box.width > 0 && box.height > 0
				? { width: box.width, height: box.height }
				: { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
	}
	onMount(resize);

	// data
	const run = $derived(resultsState.runs.find((r) => r.id === runId));
	const colors = $derived(
		run?.config?.meta?.slateColors
			? Object.values(run.config.meta.slateColors)
			: DEFAULT_SLATE_BLOCS.map((s) => s.color)
	);
	const combinedSupport = $derived(run?.config ? calculateCombinedSupport(run.config) : []);
	const raw = $derived(run?.result ?? {});
	const groups = $derived(Object.keys(raw)); // series keys
	const maxNameLength = $derived(Math.max(...groups.map((g) => g.length)));
	const entries = $derived(
		Array.from(new Set(Object.values(raw).flatMap((d: any) => Object.keys(d ?? {}))))
	);
	let hoveredGroupIndex = $state<number | null>(null);

	// Only one group at a time (selectedGroup)
	let selectedGroupIndex = $state(0);

	const selectedGroup = $derived(groups[selectedGroupIndex] ?? groups[0]);
	const color = $derived(d3.scaleOrdinal<string, string>().domain(groups).range(colors));

	// flatten for stats
	type Row = { entry: string; group: string; value: number };
	const flatData = $derived<Row[]>(
		entries.map((entry) => ({
			entry,
			group: selectedGroup,
			// @ts-expect-error
			value: (raw?.[selectedGroup]?.[entry] ?? 0) as number
		}))
	);

	// scales
	const x0 = $derived(
		d3.scaleBand<string>().domain(entries).range([0, innerWidth]).paddingInner(0.2)
	);
	const yMax = $derived(d3.max(flatData, (d) => d.value) ?? 0);
	const y = $derived(d3.scaleLinear().domain([0, yMax]).nice().range([innerHeight, 0]));

	// axis ticks/format
	const yTicks = $derived(y.ticks(Math.min(6, Math.max(2, Math.floor(innerHeight / 40)))));
	const formatY = (v: number) => d3.format('~s')(v);

	// grouped for markup compat
	const byEntry = $derived(
		entries.map((entry) => ({
			entry,
			value: (raw?.[selectedGroup]?.[entry as any] ?? 0) as number
		}))
	);

	// Combined support vertical line for selected group, if exists
	const selectedCombinedSupport = $derived(combinedSupport.find((c) => c.slate === selectedGroup));

	const numSeats = $derived(run?.config?.election?.numSeats ?? null);
	const ratio = $derived(
		selectedCombinedSupport?.seats && numSeats ? selectedCombinedSupport.seats / numSeats : 0
	);
	const ratioWidth = $derived(x0.bandwidth() / 2 + (innerWidth - x0.bandwidth()) * ratio);
	function handleBarMouseEnter(idx: number) {
		hoveredGroupIndex = idx;
	}
	function handleBarMouseLeave() {
		hoveredGroupIndex = null;
	}

	function selectGroup(idx: number) {
		selectedGroupIndex = idx;
	}
</script>

<svelte:window onresize={resize} />

{#if hoveredGroupIndex !== null}
	<div
		class="pointer-events-none absolute top-[50%] w-36 rounded-md bg-base-100 p-2 shadow-md"
		style={`left: ${x0(byEntry[hoveredGroupIndex].entry) ?? 0}px; transform: translate(-50%, -50%); pointer-events: none !important;`}
	>
		<p class="mb-2 text-xs font-bold">
			{selectedGroup}: {byEntry[hoveredGroupIndex].entry} seats won ({run?.config.trials} trials)
		</p>
		<p class="text-xs">
			<b>Frequency:</b>
			{byEntry[hoveredGroupIndex].value}
		</p>
	</div>
{/if}

<svg bind:this={svg} {height} id={`chart-svg-${runId}`} class="chart-svg">
	<!-- chart group with margins -->
	<g transform={`translate(${margin.left},${margin.top})`}>
		<!-- Y gridlines -->
		<g aria-hidden="true">
			{#each yTicks as t}
				<line x1="0" x2={innerWidth} y1={y(t)} y2={y(t)} stroke="#ddd" stroke-width="1" />
			{/each}
		</g>

		<!-- Bars for selected group only -->
		{#each byEntry as bucket, idx}
			<g transform={`translate(${x0(bucket.entry) ?? 0},0)`}>
				<rect
					x={0}
					y={y(bucket.value)}
					width={x0.bandwidth()}
					height={Math.max(0, innerHeight - y(bucket.value))}
					fill={color(selectedGroup)}
					opacity={1}
				>
					<title>{selectedGroup} • {bucket.entry}: {bucket.value}</title>
				</rect>
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

		<!-- Combined support vertical line for selected group -->
		{#if selectedCombinedSupport && numSeats && ratio > 0}
			<g>
				<line
					x1={ratioWidth}
					x2={ratioWidth}
					y1="0"
					y2={innerHeight}
					stroke="#333"
					stroke-width="2"
					stroke-dasharray="6 4"
					opacity="0.85"
				/>
				<text
					x={ratioWidth + 8}
					y={innerHeight / 2 + 4}
					text-anchor="middle"
					font-size="10"
					fill="#333"
					font-weight="normal"
					transform={`rotate(-90,${ratioWidth + 8},${innerHeight / 2})`}
				>
					Combined support ({selectedCombinedSupport.seats})
				</text>
			</g>
		{/if}

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
				transform={`rotate(-90 -54,${innerHeight / 2})`}
			>
				Frequency of Result
			</text>
		</g>
	</g>

	<!-- Group switcher (vertical, truncated, translucent background) -->
	<g transform={`translate(${width - (Math.min(5, maxNameLength) * 10 + 42)}, 20)`}>
		<rect
			x="-10"
			y="-18"
			width={Math.min(5, maxNameLength) * 10 + 42}
			height={groups.length * 28 + 10}
			fill="rgba(255, 255, 255, 0.9)"
			stroke="rgba(0, 0, 0, 0.25)"
			stroke-width="1"
			opacity="1"
			rx="6"
		/>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		{#each groups as g, i}
			<g
				transform={`translate(0,${i * 28})`}
				onclick={() => selectGroup(i)}
				style="cursor: pointer;"
				aria-label={`Show ${g} results`}
				role="button"
				tabindex="0"
			>
				<rect
					x="0"
					y="-10"
					width="16"
					height="16"
					fill={color(g)}
					stroke={i === selectedGroupIndex ? '#222' : 'transparent'}
					stroke-width={i === selectedGroupIndex ? 2 : 0}
					opacity={i === selectedGroupIndex ? 1 : 0.3}
					rx="3"
				/>
				<text
					x="22"
					y="2"
					font-size="12"
					fill="#222"
					font-weight={i === selectedGroupIndex ? 'bold' : 'normal'}
				>
					{g.length > 7 ? `${g.slice(0, 7)}…` : g}
				</text>
			</g>
		{/each}
	</g>
</svg>

<style>
	.chart-svg {
		display: block;
		width: 100%;
		max-width: 100%;
		height: 100%;
		max-height: 100%;
	}
	text {
		user-select: none;
	}
</style>
