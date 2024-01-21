<script lang="ts">
	import type { ConfigType } from "$lib/types";

	export let config: any;
	let dependencyLimit: string = "";
</script>

<div class="side-panel-container">
	<!-- for every config key, create a button to toggle between true and false -->
	{#each Object.keys(config).filter((key) => key !== 'isConfigChanged') as key}
		{#if typeof config[key] == 'boolean'}
			<button
				on:click={() => {
					config[key] = !config[key];
					config.isConfigChanged = true;
				}}
				>{key}: {config[key] ? 'true' : 'false'}
			</button>
		{:else if typeof config[key] == 'number'}
			<input type='input' bind:value={dependencyLimit} placeholder={key}
			on:input={() => {
				config[key] = dependencyLimit === "" ? NaN : Number(dependencyLimit);
				return true;
			}}/>
		{/if}
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
