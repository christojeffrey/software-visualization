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
	} from '$types';

	// scripts
	import {cleanCanvas, draw, filter, converter, createGraphData} from '$scripts';

	// components
	import RawDataInputer from './components/raw-data-inputer.svelte';
	import ConfigChanger from './components/config-changer.svelte';
	import DrawSettingsChanger from './components/draw-settings-changer.svelte';
	import InfoBox from '$ui/info-box.svelte';
	import FocusControl from './components/focus-control.svelte';

	let redrawFunction = (_: DrawSettingsInterface) => {};
	let rawData: RawInputType;
	let convertedData: ConvertedData;
	let config: ConfigInterface = {
		collapsedNodes: [],
		dependencyLifting: [],
		dependencyTolerance: 0,
		filteredNodes: new Set<string>(),
		nodeInFocus: null,
	};
	let graphData: GraphData;
	let drawSettings: DrawSettingsInterface = {
		minimumNodeSize: 100,
		buttonRadius: 5,
		nodeCornerRadius: 15,
		nodePadding: 25,
		textSize: 10,
		shownEdgesType: new Map<EdgeType, boolean>(),
		showEdgeLabels: false,
		showNodeLabels: true,
		renderedLinksId: new Set<string>(),
		nodeDefaultColor: '#6a6ade',
		nodeColors: ['#32a875', '#d46868'],
		innerLayout: 'circular',
		intermediateLayout: 'layerTree',
		rootLayout: 'layerTree',
		isPanning: false,
	};

	let svgElement: SVGElement | undefined = undefined;

	let doReconvert = true;
	let doRefilter = true;
	let doRedraw = true;
	let doRelayout = true;

	let isMounted = false;

	function handleOnNodeClick(clickedNode: GraphDataNode) {
		debuggingConsole('clicked');
		console.log(clickedNode);
		config.nodeInFocus = clickedNode;
		// set every other node to not in focus
		graphData.flattenNodes.forEach(node => {
			if (node !== clickedNode) {
				node.isInFocus = false;
			}
		});
		clickedNode.isInFocus = true;
	}
	function handleNodeCollapseClick(clickedNode: GraphDataNode) {
		// push if not exist
		if (!config.collapsedNodes.includes(clickedNode)) {
			config.collapsedNodes.push(clickedNode);
		} else {
			config.collapsedNodes = config.collapsedNodes.filter(node => node !== clickedNode);
		}
		// on finish
		doRefilter = true;
		// doRedraw = true;
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
				convertedData = converter(rawData);
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
					handleOnNodeClick,
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
		// change mouse cursor to panning mode when space is pressed
		window?.addEventListener('keydown', e => {
			if (e.code === 'Space') {
				svgElement?.classList.add('cursor-grab');
				drawSettings.isPanning = true;
			}
		});
		// on release, change back to default
		window?.addEventListener('keyup', e => {
			if (e.code === 'Space') {
				svgElement?.classList.remove('cursor-grab');
				drawSettings.isPanning = false;
			}
		});
	});
</script>

<div class="flex justify-between h-full">
	<!-- canvas -->
	<div class="relative m-6 w-full">
		<div class="absolute right-0 bottom-0">
			<InfoBox />
		</div>
		<!-- in focus box -->
		<div class="absolute left-0 bottom-0 border-2 border-black rounded-xl p-4 bg-white">
			<FocusControl
				bind:config
				{handleNodeCollapseClick}
				{handleDependencyLiftClick}
				bind:doRefilter
			/>
		</div>
		<svg bind:this={svgElement} class="w-full h-full" />
	</div>

	<!-- vertical line -->
	<div class="bg-neutral-300 w-[2px]" />

	<!-- sidepanel -->
	<div class="flex flex-col m-6">
		<RawDataInputer bind:rawData bind:doReconvert />
		<div class="bg-neutral-300 h-[1px]" />
		<ConfigChanger bind:config bind:doRefilter bind:graphData />
		<div class="bg-neutral-300 h-[1px]" />
		<DrawSettingsChanger bind:drawSettings bind:doRedraw bind:doRelayout />
	</div>
</div>
