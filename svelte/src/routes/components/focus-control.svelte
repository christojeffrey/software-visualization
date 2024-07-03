<script lang="ts">
	export let config;
	export let handleNodeCollapseClick;
	export let handleDependencyLiftClick;
	export let doRefilter;
</script>

<div>
	<!-- collapse -->
	<button
		on:click={() => {
			config.nodeInFocus && handleNodeCollapseClick(config.nodeInFocus);
		}}>Collapse</button
	>

	<!-- lift -->
	<button
		on:click={() => {
			config.nodeInFocus && handleDependencyLiftClick(config.nodeInFocus);
		}}>Lift</button
	>
	<!-- only focus on it. do this by filtering everything else beside this -->
	<button
		on:click={() => {
			config.filteredNodes = new Set([config.nodeInFocus.id]);
			doRefilter = true;
		}}>Focus</button
	>
</div>
