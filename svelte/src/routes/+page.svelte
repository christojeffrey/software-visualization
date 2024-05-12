<script lang="ts">
	import {onMount} from 'svelte';

	import {debuggingConsole, extractAvailableEdgeType} from '$helper';
	import type {
		ConfigInterface,
		ConvertedData,
		DrawSettingsInterface,
		EdgeType,
		GraphDataNode,
		GraphData,
		RawInputType,
		RawDataConfigType,
	} from '$types';

	// scripts
	import {cleanCanvas, draw, filter, converter, createGraphData} from '$scripts';

	// components
	import RawDataInputer from './components/raw-data-inputer.svelte';
	import ConfigChanger from './components/config-changer.svelte';
	import DrawSettingsChanger from './components/draw-settings-changer.svelte';

	let redrawFunction = (_: DrawSettingsInterface) => {};
	let rawData: RawInputType;
	let convertedData: ConvertedData;
	let rawDataConfig: RawDataConfigType = {
		filterPrimitives: true,
		filterAllEncompassingNodes: true,
	};
	let config: ConfigInterface = {
		collapsedNodes: [],
		dependencyLifting: [],
		dependencyTolerance: 0,
	};
	let graphData: GraphData;
	let drawSettings: DrawSettingsInterface = {
		minimumNodeSize: 50,
		buttonRadius: 5,
		nodeCornerRadius: 5,
		nodePadding: 50,
		textSize: 10,
		shownEdgesType: new Map<EdgeType, boolean>(),
		showEdgeLabels: false,
		showNodeLabels: true,
		showEdgePorts: true,
		nodeDefaultColor: '#6a6ade',
		nodeColors: ['#32a875', '#d46868'],
		innerLayout: 'layerTree',
		intermediateLayout: 'layerTree',
		rootLayout: 'layerTree',
	};

	let svgElement: SVGElement | undefined = undefined;

	let doReconvert = true;
	let doRecreateWholeGraphData = true;
	let doRefilter = true;
	let doRedraw = true;
	let doRelayout = true;

	let isMounted = false;

	function handleNodeCollapseClick(clickedNode: GraphDataNode) {
		debuggingConsole('clicked');
		// push if not exist
		if (!config.collapsedNodes.includes(clickedNode)) {
			config.collapsedNodes.push(clickedNode);
		} else {
			config.collapsedNodes = config.collapsedNodes.filter(node => node !== clickedNode);
		}
		// on finish
		doRefilter = true;
	}

	function handleDependencyLiftClick(clickedNode: GraphDataNode): void {
		debuggingConsole('clicked');

		// push if not exist
		if (!config.dependencyLifting.find(nodeConfig => nodeConfig.node.id === clickedNode.id)) {
			config.dependencyLifting.push({node: clickedNode, sensitivity: config.dependencyTolerance});
		} else {
			// remove if exist
			debuggingConsole('remove');
			config.dependencyLifting = config.dependencyLifting.filter(
				nodeConfig => nodeConfig.node.id !== clickedNode.id,
			);
		}

		// on finish
		doRefilter = true;
	}
	$: {
		if (isMounted) {
			// handle config changes
			if (doReconvert) {
				// will setup graphData. Will also setup shownEdgesType
				convertedData = converter(rawData, rawDataConfig);
				graphData = createGraphData(convertedData);

				// Initialize shownEdgesType
				extractAvailableEdgeType(graphData.links).forEach((e, index) =>
					drawSettings.shownEdgesType.set(e, index == 0 ? true : false),
				);

				doReconvert = false;
				doRefilter = true;
			}
			if (doRefilter) {
				filter(config, graphData);
				doRefilter = false;
				doRelayout = true;
			}

			if (doRelayout) {
				// remove the old data
				cleanCanvas(svgElement!);
				redrawFunction = draw(
					svgElement!,
					graphData,
					drawSettings,
					handleNodeCollapseClick,
					handleDependencyLiftClick,
				);
				doRedraw = true;
				doRelayout = false;
			}

			if (doRedraw) {
				redrawFunction(drawSettings);
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
		<RawDataInputer bind:rawData bind:doReconvert bind:rawDataConfig />
		<div class="bg-neutral-300 h-[1px]" />
		<ConfigChanger bind:config />
		<div class="bg-neutral-300 h-[1px]" />
		<DrawSettingsChanger bind:drawSettings bind:doRedraw bind:doRelayout />
	</div>
</div>
