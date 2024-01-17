<script lang="ts">
	import type { ConfigType } from "$lib/types";

	export let config: any;
	let dependencyLimit: string = "";
</script>

<div>
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
				config.liftDependencies = dependencyLimit === "" ? NaN : Number(dependencyLimit);
				return true;
			}} on:keydown={(e) => {if (e.key === "Enter") config.isConfigChanged = true}}/>
		{/if}
	{/each}
</div>
