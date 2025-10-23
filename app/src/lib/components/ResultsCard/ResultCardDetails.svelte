<script lang="ts">
	import type { Run } from '$lib/stores/types';
	import DetailsSection from './DetailsSection.svelte';
	import Section from './Section.svelte';
	import GeneralTable from './GeneralTable.svelte';
	import ElectionTable from './ElectionTable.svelte';
	import SlatesTable from './SlatesTable.svelte';
	import VoterBlocsTable from './VoterBlocsTable.svelte';
	import TwoByTwoGroupsTable from './TwoByTwoGroupsTable.svelte';
	import TwoByTwoVoterBehavior from './TwoByTwoVoterBehavior.svelte';
	import TwoByTwoElectionProperties from './TwoByTwoElectionProperties.svelte';
	const { run, compact = false } = $props<{ run: Run; compact?: boolean }>();
	let sectionOpen = $state('General');
	const onOpenChange = (title: string) => {
		sectionOpen = title;
	};
</script>

{#if run}
	<!-- Section definitions as fragments for reuse -->
	{#if compact}
		<div class="flex flex-col gap-2">
			<DetailsSection title="General" open={sectionOpen === 'General'} {onOpenChange}>
				<GeneralTable {run} />
			</DetailsSection>
			<DetailsSection title="Election" open={sectionOpen === 'Election'} {onOpenChange}>
				<ElectionTable {run} />
			</DetailsSection>
			<DetailsSection title="Slates" open={sectionOpen === 'Slates'} {onOpenChange}>
				<SlatesTable {run} />
			</DetailsSection>
			<DetailsSection title="Voter Blocs" open={sectionOpen === 'Voter Blocs'} {onOpenChange}>
				<VoterBlocsTable {run} />
			</DetailsSection>
		</div>
	{:else}
		<div class="flex flex-col gap-4">
			<Section title="General">
				<GeneralTable {run} />
			</Section>
			<Section title="Groups">
				<TwoByTwoGroupsTable {run} />
			</Section>
			<Section title="Voter behavior">
				<TwoByTwoVoterBehavior {run} />
			</Section>
			<Section title="Election properties">
				<TwoByTwoElectionProperties {run} />
			</Section>
		</div>
	{/if}
{:else}
	<p>No run found.</p>
{/if}
