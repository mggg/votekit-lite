<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { resultsState } from '$lib/stores/resultsStore.svelte';
	import { COLOR_MAP } from '$lib/constants';

	// props (Svelte 5 runes)
	const { runId } = $props<{ runId: string }>();

	// sizing
	const DEFAULT_WIDTH = 500;
	const DEFAULT_HEIGHT = 200;
	const margin = { top: 20, right: 90, bottom: 40, left: 30 };

	let svg = $state<SVGSVGElement>();
	let width = $state(DEFAULT_WIDTH);
	let height = $state(DEFAULT_HEIGHT);

	const innerWidth = $derived(Math.max(0, width - margin.left - margin.right));
	const innerHeight = $derived(Math.max(0, height - margin.top - margin.bottom));

	function resize() {
		const box = svg?.getBoundingClientRect();
		({ width, height } = box
			? { width: Math.max(DEFAULT_WIDTH, box.width), height: Math.max(DEFAULT_HEIGHT, box.height) }
			: { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
	}
	onMount(resize);

	// data
	const raw = $derived(resultsState.runs.find((r) => r.id === runId)?.result ?? {});
	const groups = $derived(Object.keys(raw)); // series keys
	const entries = $derived(
		Array.from(new Set(Object.values(raw).flatMap((d: any) => Object.keys(d ?? {}))))
	);

	// interactive series filter (legend toggles)
	let activeSlates = $state<string[]>([]);
	$effect(() => {
		activeSlates = raw ? Object.keys(raw) : [];
		return () => {
			activeSlates = [];
		};
	});

	const visibleGroups = $derived(
		activeSlates.length ? groups.filter((g) => activeSlates.includes(g)) : groups
	);

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
		if (activeSlates.includes(g)) {
			activeSlates.splice(activeSlates.indexOf(g), 1);
			activeSlates = [...activeSlates];
		} else {
			activeSlates = [...activeSlates, g];
		}
	}
	function isActive(g: string) {
		return activeSlates.length === 0 || activeSlates.includes(g);
	}
</script>

<svelte:window onresize={resize} />

<svg bind:this={svg} {height}>
	<!-- chart group with margins -->
	<g transform={`translate(${margin.left},${margin.top})`}>
		<!-- Y gridlines -->
		<g aria-hidden="true">
			{#each yTicks as t}
				<line x1="0" x2={innerWidth} y1={y(t)} y2={y(t)} stroke="#ddd" stroke-width="1" />
			{/each}
		</g>

		<!-- grouped bars -->
		{#each byEntry as bucket}
			<g transform={`translate(${x0(bucket.entry) ?? 0},0)`}>
				{#each bucket.values as d}
					<rect
						x={x1(d.group) ?? 0}
						y={y(d.value)}
						width={x1.bandwidth()}
						height={Math.max(0, innerHeight - y(d.value))}
						fill={color(d.group)}
						opacity={isActive(d.group) ? 1 : 0.35}
					>
						<title>{d.group} • {bucket.entry}: {d.value}</title>
					</rect>
				{/each}
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
		</g>
	</g>

	<!-- Legend -->
	<g transform={`translate(${margin.left},${height - 10})`}>
		{#each groups as g, i}
			<g
				transform={`translate(${i * 110},0)`}
				on:click={() => toggleGroup(g)}
				style="cursor: pointer;"
			>
				<rect
					x="0"
					y="-14"
					width="12"
					height="12"
					fill={color(g)}
					opacity={isActive(g) ? 1 : 0.35}
					rx="2"
				/>
				<text x="18" y="-8" dy="0.8em" font-size="12" fill="#222">{g}</text>
			</g>
		{/each}
	</g>
</svg>

<style>
	svg {
		display: block;
		width: 100%;
	}
	text {
		user-select: none;
	}
</style>
