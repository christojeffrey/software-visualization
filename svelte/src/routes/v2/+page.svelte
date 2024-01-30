<script lang="ts">
	import { onMount } from 'svelte';
	import { cleanCanvas } from './scripts/clean-canvas';
	import { draw } from './scripts/draw';
	import { filter } from './scripts/filter';
	import { converter } from './scripts/converter';
	import { createGraphData } from './scripts/create-graph-data';
	import RawDataInputer from './components/raw-data-inputer.svelte';
	import ConfigChanger from './components/config-changer.svelte';
	import DrawSettingsChanger from './components/draw-settings-changer.svelte';
	import { onVertexCollapseClick } from './scripts/filter/collapse-vertices';
	import type { ConfigInterface, ConvertedData, ConvertedNode, DrawSettingsInterface, EdgeType } from './types';
	import type { RawInputType } from './types/raw-data';
	import { extractAvailableEdgeType } from './scripts/helper';
	import {debuggingConsole} from '$helper';
	import { onDependencyLiftClick } from './scripts/filter/lift-edges';

	let simulations: any[] = [];
	let rawData: RawInputType;
	let convertedData: ConvertedData;
	let config: ConfigInterface = {
		collapsedVertices: [],
		dependencyLifting: [],
		dependencyTolerance: 0
	};
	let graphData: any;
	let drawSettings: DrawSettingsInterface = {
		minimumVertexSize: 50,
		buttonRadius: 5,
		nodeCornerRadius: 5,
		nodePadding:5,
		shownEdgesType: new Map<EdgeType, boolean>(),
		showEdgeLabels: false,
		showNodeLabels: false,
		nodeDefaultColor: '#6a6ade',
		nodeColors: [
			"#32a875",
			"#d46868",
		]
	};
	let svgElement: SVGElement | undefined = undefined;

	let doReconvert = true;
	let doRecreateWholeGraphData = true;
	let doRefilter = false; // nothing to filter at first
	let doRedraw = true;

	let isMounted = false;

	function handleVertexCollapseClick(datum: any) {
		onVertexCollapseClick(datum, config, () => {
			doRefilter = true;
		});
	}


	function handleDependencyLiftClick(node: ConvertedNode): void {
		onDependencyLiftClick(node, config, () => {
			doRefilter = true;
		});
	}
	$: {
		if (isMounted) {
			// handle config changes
			if (doReconvert) {
				convertedData = converter(rawData);
				doReconvert = false;

				// must recreate graph data after reconvert
				doRecreateWholeGraphData = true;
			}
			if (doRecreateWholeGraphData) {
				graphData = createGraphData(convertedData);
				// Initialize shownEdgesType
				extractAvailableEdgeType(graphData.links).forEach((e, index) =>
					drawSettings.shownEdgesType.set(e, index == 0 ? true : false)
				);
				doRecreateWholeGraphData = false;

				// must redraw after recreate
				doRedraw = true;
			}
			if (doRefilter) {
				filter(config, graphData);
				doRefilter = false;

				// must redraw after refilter
				doRedraw = true;
			}
			if (doRedraw) {
				// remove the old data
				cleanCanvas(svgElement!, simulations);

				let result = draw(
					svgElement,
					graphData,
					config,
					drawSettings,
					handleVertexCollapseClick,
					handleDependencyLiftClick
				);
				simulations = result.simulations;
				doRedraw = false;
			}
		}
	}
	onMount(() => {
		isMounted = true;
	});
</script>

<div class="flex justify-between h-full">
	<!-- canvas -->
	<div class="m-6 w-full">
		<svg bind:this={svgElement} class="w-full h-full" />
	</div>

	<!-- vertical line -->
	<div class="bg-neutral-300 w-[2px]" />

	<!-- sidepanel -->
	<div class="flex flex-col m-6">
		<RawDataInputer bind:rawData bind:doReconvert />
		<div class="bg-neutral-300 h-[1px]" />
		<ConfigChanger bind:config />
		<div class="bg-neutral-300 h-[1px]" />
		<DrawSettingsChanger bind:drawSettings bind:doRedraw />
	</div>
</div>
