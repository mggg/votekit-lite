<script lang="ts">
	const { message } = $props<{ message?: string }>();
</script>

<div class="mt-2 flex flex-row items-center gap-2 text-xs text-slate-500">
	<div class="loading loading-xl loading-ring text-success"></div>
	<h3 class="text-md text-success">{message || 'Running simulation...'}</h3>
</div>
