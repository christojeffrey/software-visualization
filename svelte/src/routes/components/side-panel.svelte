<script lang="ts">
	export let config: any;
	export let doRedraw: boolean;
</script>

<div class="side-panel-container">
	<!-- for every config key, create a button to toggle between true and false -->
	{#each Object.keys(config) as key}
		<button
			on:click={() => {
				config[key] = !config[key];
				doRedraw = true;
			}}
			>{key}: {config[key] ? 'true' : 'false'}
		</button>
	{/each}
</div>

<style>
	.side-panel-container {
		display: flex;
		flex-direction: column;
		width: 200px;
	}
	button {
		margin: 1rem;
		padding: 1rem;
		width: 100%;
	}
</style>
