<script lang="ts">
	import Heading from '$ui/heading.svelte';
	import Toggle from '$ui/toggle.svelte';
	import type {ConfigInterface, GraphDataNode} from '$types';
	import {runMetrics} from '$scripts/draw/metrics';

	export let config: ConfigInterface;
	export let doRefilter: boolean;
	export let flattenNodes: GraphDataNode[];

	let dependencyLiftTolerance: string;
	let liftAll: boolean = false;
</script>

<div>
	<Heading class="mt-2">Config Changer</Heading>
	<div>
		to collapse node, you can click on the red button <br />
		to collapse node, click the green button. Tolerance:
		<input
			type="input"
			style="width: 2em; border: 1px solid black; margin: 0 0 10px 4px;"
			bind:value={dependencyLiftTolerance}
			on:keyup={d => {
				const num = Math.trunc(Number(dependencyLiftTolerance));
				dependencyLiftTolerance = String(num || 0);
				config.dependencyTolerance = num || 0;
			}}
		/>
		<Toggle
			class="ml-4"
			bind:state={liftAll}
			onToggle={() => {
				liftAll = !liftAll;
				if (liftAll) {
					config.dependencyLifting = flattenNodes.map(n => ({
						node: n,
						sensitivity: config.dependencyTolerance ?? 0,
					}));
				} else {
					config.dependencyLifting = [];
				}
				doRefilter = true;
			}}
		>
			{config.dependencyLifting.length > 0
				? config.dependencyLifting.length < flattenNodes.length
					? 'Some edged lifted'
					: 'All edges lifted'
				: 'No edges lifted'}
		</Toggle>
		<br />
		<input
			type="button"
			on:click={_ => {
				runMetrics();
			}}
			value="Evaluate layout"
			style="background: #e5e7eb; padding: 5px; border-radius: 3px; margin-bottom: 5px; border: 1px solid gray;"
		/>
	</div>
</div>
