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
		shownEdgesType: new Map<EdgeType, boolean>(),
		showEdgeLabels: true,
		showNodeLabels: true,
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
	debuggingConsole("testing");

	function handleDependencyLiftClick(node: ConvertedNode): void {
		const existingLift = config.dependencyLifting.find((i) => i.nodeId === node.id);
		if (existingLift) {
			config.dependencyLifting = config.dependencyLifting.filter((i) => i.nodeId !== node.id);
		} else {
			config.dependencyLifting.push({ nodeId: node.id, depth: config.dependencyTolerance });
		}
		doRecreateWholeGraphData = true;
		doRefilter = true;
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
