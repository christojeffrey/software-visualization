<script lang="ts">
	import { onMount } from 'svelte';

	import { cleanCanvas, draw, setupGraphData } from '$lib';
	import type { ConfigType } from '$lib/types';

	import SidePanel from './components/side-panel.svelte';
	import DataSetter from './components/data-setter.svelte';

	let svgElement: any; // Reference to the svg tag
	let simulation: any;

	let doRedraw = true;
	let config: ConfigType = {
		isGrouped: false,
		showNodeLabels: false,
		showLinkLabels: false,
		isForceSimulationEnabled: true,
		collapsedGroups: []
	};

	// graph

	let isMounted = false;

	let convertedData: any;

	$: {
		if (isMounted) {
			// handle config changes
			if (doRedraw) {
				// remove the old data
				cleanCanvas(svgElement, simulation);

				// setup graphData
				const graphData = setupGraphData(config, convertedData);
				console.log('graphData');
				console.log(graphData);
				// draw
				const result = draw(config, svgElement, graphData, () => {
					doRedraw = true;
				});
				simulation = result.simulation;
				svgElement = result.svgElement;

				doRedraw = false;
			}
		}
	}
	onMount(() => {
		isMounted = true;
	});
</script>

<div class="graph">
	<svg bind:this={svgElement} />
	<div>
		<DataSetter bind:doRedraw bind:convertedData />

		<SidePanel bind:config bind:doRedraw />
	</div>
</div>

<style>
	.graph {
		/* border black 2px */
		border: 2px solid black;
		display: flex;
		justify-content: space-between;
		padding: 2rem;
	}
	.graph svg {
		/* border red 2px */
		border: 2px solid red;
	}
</style>
