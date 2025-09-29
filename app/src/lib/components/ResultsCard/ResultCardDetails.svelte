<script lang="ts">
	import { BALLOT_GENERATOR_MAP, ELECTION_SYSTEM_MAP, VOTER_PREFERENCE_MAP } from '$lib/constants';
	import type { FormState } from '$lib/stores/formStore.svelte';
	import type { Run } from '$lib/stores/types';
	import { percentFormatter } from '$lib/utils/format';
	const { run } = $props<{ run: Run }>();
</script>

{#if run}
	<div class="flex flex-col gap-4">
		<div>
			<h3 class="mb-1 text-base font-bold">General</h3>
			<table class="table w-auto table-xs">
				<tbody>
					<tr>
						<td class="font-semibold">Name</td>
						<td>{run.name}</td>
					</tr>
					<tr>
						<td class="font-semibold">Created</td>
						<td>{new Date(+run.createdAt).toLocaleString()}</td>
					</tr>
					<tr>
						<td class="font-semibold">Trials</td>
						<td>{run.config.trials}</td>
					</tr>
					<tr>
						<td class="font-semibold">Voter Profile</td>
						<td
							>{BALLOT_GENERATOR_MAP[run.config.ballotGenerator as FormState['ballotGenerator']] ??
								'Unknown'}</td
						>
					</tr>
				</tbody>
			</table>
		</div>

		<div>
			<h3 class="mb-1 text-base font-bold">Election</h3>
			<table class="table w-auto table-xs">
				<tbody>
					<tr>
						<td class="font-semibold">System</td>
						<td
							>{ELECTION_SYSTEM_MAP[run.config.election.system as FormState['system']]?.name ??
								'Unknown'}</td
						>
					</tr>
					<tr>
						<td class="font-semibold">Seats</td>
						<td>{run.config.election.numSeats}</td>
					</tr>
					<tr>
						<td class="font-semibold">Max Ballot Length</td>
						<td>{run.config.election.maxBallotLength}</td>
					</tr>
				</tbody>
			</table>
		</div>

		<div>
			<h3 class="mb-1 text-base font-bold">Slates</h3>
			<table class="table w-auto table-xs">
				<thead>
					<tr>
						<th>Name</th>
						<th>Num. Candidates</th>
					</tr>
				</thead>
				<tbody>
					{#each Object.entries(run.config.slates) as Array<[string, Run['config']['slates']]> as [slateName, slate]}
						<tr>
							<td>{slateName}</td>
							<td>{slate.numCandidates}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div>
			<h3 class="mb-1 text-base font-bold">Voter Blocs</h3>
			<table class="table w-full table-xs">
				<thead>
					<tr>
						<th>Name</th>
						<th>Voters</th>
						<th>Cohesion</th>
						<th>Strong Candidate</th>
					</tr>
				</thead>
				<tbody>
					{#each Object.entries(run.config.voterBlocs) as Array<[string, any]> as [blocName, bloc]}
						<tr>
							<td>{blocName}</td>
							<td>{Math.round((run.config.numVoters as number) * (bloc.proportion as number))}</td>
							<td>
								{#each Object.entries(bloc.cohesion) as Array<[string, number]> as [slate, coh]}
									<p>{slate}: {percentFormatter.format(coh)}</p>
								{/each}
							</td>
							<td>
								{#each Object.entries(bloc.preference) as Array<[string, string]> as [slate, pref]}
									<p>
										{slate}: {VOTER_PREFERENCE_MAP[
											pref as FormState['blocPreferences'][number][number]
										] ?? 'Unknown'}
									</p>
								{/each}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{:else}
	<p>No run found.</p>
{/if}

<style>
	table,
	tr,
	td,
	th {
		padding: 2px 2px 2px 0px;
		margin: 0;
	}
</style>
