<script lang="ts">
	import Button from '$ui/button.svelte';

	export let config;
	export let handleNodeCollapseClick;
	export let handleDependencyLiftClick;
	export let doRefilter;
</script>

<div>
	{#if config.nodeInFocus}
		<div>
			<h1 class="text-2xl pb-4 text-center">{config.nodeInFocus.id}</h1>
		</div>
		<div>
			<!-- collapse -->
			<Button
				onClick={() => {
					config.nodeInFocus && handleNodeCollapseClick(config.nodeInFocus);
				}}>Collapse</Button
			>

			<!-- lift -->
			<Button
				onClick={() => {
					config.nodeInFocus && handleDependencyLiftClick(config.nodeInFocus);
				}}>Lift</Button
			>
			<!-- only focus on it. do this by filtering everything else beside this -->
			<Button
				onClick={() => {
					config.filteredNodes = new Set([config.nodeInFocus.id]);
					doRefilter = true;
				}}>Focus</Button
			>
		</div>
	{:else}
		<p>No node in focus</p>
	{/if}
</div>
