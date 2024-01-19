<script lang="ts">
	import { onMount } from 'svelte';

	import {
		addCanvasInteractivity,
		cleanCanvas,
		collapsedGroupHandler,
		draw,
		setupGraphData
	} from '$lib';
	import type { ConfigType, GraphDataType, GraphElementsType } from '$lib/types';

	import SidePanel from './components/side-panel.svelte';
	import DataSetter from './components/data-setter.svelte';

	let svg: any; // The svg data that is manipulated
	let svgElement: any; // Reference to the svg tag
	let simulation: any;
	let graphElements: GraphElementsType;

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
				const graphData = setupGraphData(convertedData);

				// prepare data
				collapsedGroupHandler(config.collapsedGroups, graphData);

				// draw
				const result = draw(config, svgElement, graphData, () => {
					doRedraw = true;
				});
				svg = result.svg;
				simulation = result.simulation;
				graphElements = result.graphElements;
				svgElement = result.svgElement;

				doRedraw = false;
			}

			// Add a drag behavior.
			addCanvasInteractivity(graphElements, simulation, config, svg);
		}
	}
	onMount(() => {
		isMounted = true;
	});
</script>

<div class="graph">
	<svg bind:this={svgElement} />
	<div>
		<!-- data setter -->
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
