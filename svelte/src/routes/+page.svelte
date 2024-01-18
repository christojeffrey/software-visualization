<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	import {
		addCanvasInteractivity,
		cleanCanvas,
		collapsedGroupHandler,
		dataSetter,
		draw,
		rawToGraphDataConverter
	} from '$lib';
	import type { ConfigType, GraphDataType, GraphElementsType } from '$lib/types';

	import SidePanel from './components/side-panel.svelte';

	let svgElement: any; // Reference to the svg tag

	let config: ConfigType = {
		isGrouped: false,
		useRawData: true,
		isConfigChanged: true,
		showNodeLabels: false,
		showLinkLabels: false,
		isForceSimulationEnabled: true
	};

	// graph
	let graphData: GraphDataType = {
		nodes: [],
		links: [],
		groups: [],
		groupLinks: [],
		groupButtons: [],
		collapsedGroups: []
	};

	let svg: any; // The svg data that is manipulated
	let simulation: any;

	let graphElements: GraphElementsType;

	let isMounted = false;

	$: {
		if (isMounted) {
			// handle config changes
			if (config.isConfigChanged) {
				// remove the old data
				cleanCanvas(svgElement, simulation);

				// set data used
				dataSetter(config, graphData);

				// prepare data
				collapsedGroupHandler(graphData.collapsedGroups, graphData);

				// draw
				let result = draw(config, svgElement, graphData);

				svg = result.svg;
				simulation = result.simulation;
				graphElements = result.graphElements;

				config.isConfigChanged = false;
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

	<SidePanel bind:config />
</div>

<style>
	.graph {
		/* border black 2px */
		border: 2px solid black;
	}
	.graph svg {
		/* border red 2px */
		border: 2px solid red;
	}
</style>
