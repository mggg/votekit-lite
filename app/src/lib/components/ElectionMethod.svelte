<script lang="ts">
  // formState passed in
  import { formState } from '$lib/stores/formStore.svelte';
  import OptionCard from '$lib/components/OptionCard.svelte';
</script>

<div class="rounded-2xl border border-slate-200/70 bg-white/70 p-3 shadow-sm backdrop-blur">
  <h2 class="mb-2 text-lg font-semibold text-slate-800">Election method</h2>
  <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
    <OptionCard
      title="Single transferable vote (STV)"
      description="Votes transfer as candidates are elected/eliminated."
      selected={formState.system === 'STV'}
      onSelect={() => (formState.system = 'STV')}
    />
    <OptionCard
      title="Bloc plurality"
      description="Most votes wins."
      selected={formState.system === 'blocPlurality'}
      onSelect={() => (formState.system = 'blocPlurality')}
    />
  </div>
</div>
