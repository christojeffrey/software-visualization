<script lang="ts">
	export let type: string;
	export let value: any;
	export let onChange: (e: any) => void;
</script>

<input class="ml-4 border-2" {type} min="1" max="100" {value} on:change={onChange} />
