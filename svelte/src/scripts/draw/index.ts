import * as d3 from 'd3';
import {notNaN} from '$helper';
import type {DrawSettingsInterface, GraphData, GraphDataNode, LayoutOptions} from '$types';

import {setupGradient} from './helper/gradient-setup';
import {
	forceBasedLayout,
	circularLayout,
	straightTreeLayout,
	layerTreeLayout,
	type NodeLayout,
} from './layouts';
import {renderLinks} from './link-render';
import {addDragAndDrop} from './drag-and-drop';
import {renderNodes, renderNodeLabels, addLiftCollapseButtons} from './nodes-render';

export function draw(
	svgElement: SVGElement,
	graphData: GraphData,
	drawSettings: DrawSettingsInterface,
	onCollapse: (datum: GraphDataNode) => void,
	onLift: (datum: GraphDataNode) => void,
	OnNodeClick: (datum: GraphDataNode) => void,
) {
	// CALCULATE LAYOUT
	// Transform graphData, split the nodes according to which layout-algorithm we are going to use.
	const {simpleNodes, innerNodes, intermediateNodes, rootNodes} = splitNodes(graphData.nodes);

	// Initialize width and height of simple nodes
	simpleNodes.forEach(n => {
		n.width = notNaN(drawSettings.minimumNodeSize);
		n.height = notNaN(drawSettings.minimumNodeSize);
	});

	// Populate renderedLinksId
	drawSettings.renderedLinksId.clear();
	graphData.renderedLinks.forEach(link => {
		drawSettings.renderedLinksId.add(link.id);
	});

	const layoutOptionToFunction: {[layout in LayoutOptions]: NodeLayout} = {
		circular: circularLayout,
		straightTree: straightTreeLayout,
		layerTree: layerTreeLayout,
	};
	try {
		// Calculate layouts for non-simple nodes
		innerNodes.forEach(n =>
			layoutOptionToFunction[drawSettings.innerLayout](drawSettings, n.members, n),
		);
		intermediateNodes.forEach(n =>
			layoutOptionToFunction[drawSettings.intermediateLayout](drawSettings, n.members, n),
		);
		rootNodes.forEach(n =>
			layoutOptionToFunction[drawSettings.intermediateLayout](drawSettings, n.members, n),
		);
		layoutOptionToFunction[drawSettings.rootLayout](drawSettings, rootNodes); // Todo this is weird
	} catch (e) {
		// Force the graph to be re calculated using another layout first, because the current layout failed (should be impossible).
		innerNodes.forEach(n => circularLayout(drawSettings, n.members, n));
		intermediateNodes.forEach(n => circularLayout(drawSettings, n.members, n));
		rootNodes.forEach(n => circularLayout(drawSettings, n.members, n));
		circularLayout(drawSettings, rootNodes);
	} finally {
		innerNodes.forEach(n =>
			layoutOptionToFunction[drawSettings.innerLayout](drawSettings, n.members, n),
		);
		intermediateNodes.forEach(n =>
			layoutOptionToFunction[drawSettings.intermediateLayout](drawSettings, n.members, n),
		);
		rootNodes.forEach(n =>
			layoutOptionToFunction[drawSettings.intermediateLayout](drawSettings, n.members, n),
		);
		layoutOptionToFunction[drawSettings.rootLayout](drawSettings, rootNodes);
	}

	// ZOOM HANDLING
	// Create canvas to contain all elements, so we can transform it for zooming etc.
	const canvas = d3.select(svgElement).append('g').attr('id', 'canvas');
	const canvasElement = document.getElementById('canvas')!;
	// Add zoom handler
	d3.select(svgElement).call(
		d3.zoom<SVGElement, unknown>().on('zoom', ({transform}) => {
			canvas.attr('transform', transform);
			drawSettings.transformation = transform;
		}),
	);
	// // handle scroll
	// d3.select(svgElement).call(
	// 	d3.zoom<SVGElement, unknown>().on('zoom', e => {
	// 		// Typing
	// 		const source = e.sourceEvent as MouseEvent;

	// 		// Calculate node movement, keeping the transformation (specifically the scaling) in mind.
	// 		// propagate the event to the zoom handler
	// 		const newX = (drawSettings.transformation?.x ?? 0) + source.movementX;
	// 		const newY = (drawSettings.transformation?.y ?? 0) + source.movementY;

	// 		const {transform} = e;
	// 		const newK = transform.k;
	// 		const newTransform = {
	// 			k: newK,
	// 			x: newX,
	// 			y: newY,
	// 		};
	// 		canvas.attr(
	// 			'transform',
	// 			'translate(' + newTransform.x + ',' + newTransform.y + ') scale(' + newTransform.k + ')',
	// 		);
	// 		drawSettings.transformation = newTransform;
	// 	}),
	// );

	//Reload last transformation, if available
	if (drawSettings.transformation) {
		canvas.attr(
			'transform',
			`translate(${drawSettings.transformation.x}, ${drawSettings.transformation.y}) scale(${drawSettings.transformation.k})`,
		);
	}

	// Render links
	const linkCanvas = d3.select(canvasElement).append('g').attr('id', 'link-canvas');
	setupGradient(linkCanvas);
	// DRAG AND DROP

	/** Callback to rerender with new drawSettings, to prevent unnecessary rerenders
	 * TODO actually use this somewhere
	 */

	d3.select(canvasElement).append('g').attr('id', 'node-canvas');
	const nodeCanvasElement = document.getElementById('node-canvas')!;

	function rerender(drawSettings: DrawSettingsInterface) {
		// remove all elements
		d3.select(nodeCanvasElement).selectAll('*').remove();

		renderNodes(rootNodes, nodeCanvasElement, drawSettings, OnNodeClick);
		renderNodeLabels(nodeCanvasElement, drawSettings);
		addLiftCollapseButtons(nodeCanvasElement, drawSettings, onCollapse, onLift);
		addDragAndDrop(
			graphData.renderedLinks,
			rootNodes,

			graphData.nodesDict,
			nodeCanvasElement,
			linkCanvas,
			drawSettings,
			graphData,
		);

		renderLinks(graphData.renderedLinks, graphData.nodesDict, linkCanvas, drawSettings);
	}
	return rerender;
}

/**
 * Splits node per layout-algorithm
 * TODO Maybe move to parser?
 */
function splitNodes(nodes: GraphDataNode[]) {
	const simpleNodes: GraphDataNode[] = [];
	const intermediateNodes: GraphDataNode[] = [];
	const innerNodes: GraphDataNode[] = [];
	const rootNodes: GraphDataNode[] = [];

	function recurse(node: GraphDataNode) {
		node.members.forEach(node => recurse(node));
		if (node.level === 0) {
			if (node.members.length === 0) {
				simpleNodes.push(node);
				// TODO, also weird, rethink the split
			}
			rootNodes.push(node);
		} else if (node.members.length === 0) {
			simpleNodes.push(node);
		} else if (
			node.members.reduce(
				(a: number, item) => (item.members.length ? (item.members.length > 0 ? a + 1 : a) : a),
				0,
			) === 0
		) {
			innerNodes.push(node);
		} else {
			intermediateNodes.push(node);
		}
	}

	nodes.forEach(node => recurse(node));

	return {simpleNodes, innerNodes, rootNodes, intermediateNodes};
}

export default draw;
