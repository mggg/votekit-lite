<script lang="ts">
	export let color: string;
  export let size: string = 'size-4';
</script>

<span class={`aspect-square ${size} rounded-full`} style={`background-color: ${color}`}></span>
