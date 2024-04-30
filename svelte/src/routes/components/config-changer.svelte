<script lang="ts">
	import Heading from '$ui/heading.svelte';
	import type {ConfigInterface} from '$types';
	import {runMetrics} from '$scripts/draw/metrics';
	let dependencyLiftTolarance: string;
	export let config: ConfigInterface;
</script>

<div>
	<Heading class="mt-2">Config Changer</Heading>
	<div>
		to collapse node, you can click on the red button <br />
		to collapse node, click the green button. Tolerance:
		<input
			type="input"
			style="width: 2em; border: 1px solid black; margin: 0 0 10px 4px;"
			bind:value={dependencyLiftTolarance}
			on:keyup={d => {
				const num = Math.trunc(Number(dependencyLiftTolarance));
				dependencyLiftTolarance = String(num || 0);
				config.dependencyTolerance = num || 0;
			}}
		/>
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
