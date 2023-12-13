<script lang="ts">
	export let config: any;
</script>

<div>
	<!-- for every config key, create a button to toggle between true and false -->
	{#each Object.keys(config).filter((key) => key !== 'isConfigChanged') as key}
		<button
			on:click={() => {
				config[key] = !config[key];
				config.isConfigChanged = true;
			}}
			>{key}: {config[key] ? 'true' : 'false'}
		</button>
	{/each}
</div>
