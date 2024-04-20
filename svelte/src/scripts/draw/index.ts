import * as d3 from 'd3';
import {notNaN} from '$helper';
import type {DrawSettingsInterface, GraphData, GraphDataNode} from '$types';

import {setupGradient} from './helper/gradient-setup';
import {forceBasedLayout, circularLayout, straightTreeLayout, layerTreeLayout} from './layouts';
import {renderLinks} from './link-render';
import {addDragAndDrop} from './drag-and-drop';
import {renderNodes, renderNodeLabels, addLiftCollapseButtons} from './nodes-render';

export function draw(
	svgElement: SVGElement,
	graphData: GraphData,
	drawSettings: DrawSettingsInterface,
	onCollapse: (datum: GraphDataNode) => void,
	onLift: (datum: GraphDataNode) => void,
) {
	// CALCULATE LAYOUT
	// Transform graphData, split the nodes according to which layout-algorithm we are going to use.
	const {simpleNodes, innerNodes, intermediateNodes, rootNodes} = splitNodes(graphData.nodes);

	// Transform graphData, split the nodes according to which layout-algorithm we are going to use.
	const {simpleNodes, innerNodes, intermediateNodes, rootNodes} = splitNodes(nodes);

	// Initialize width and height of simple nodes
	simpleNodes.forEach(n => {
		n.width = notNaN(drawSettings.minimumNodeSize);
		n.height = notNaN(drawSettings.minimumNodeSize);
	});

	// Calculate layouts for non-simple nodes

	innerNodes.forEach(n => layerTreeLayout(drawSettings, n.members, n));
	intermediateNodes.forEach(n => layerTreeLayout(drawSettings, n.members, n));
	rootNodes.forEach(n => layerTreeLayout(drawSettings, n.members, n));
	layerTreeLayout(drawSettings, rootNodes); // Todo this is weird

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

	//Reload last transformation, if available
	if (drawSettings.transformation) {
		canvas.attr(
			'transform',
			`translate(${drawSettings.transformation.x}, ${drawSettings.transformation.y}) scale(${drawSettings.transformation.k})`,
		);
	}

	// Render links
	const linkCanvas = d3.select(canvasElement).append('g').attr('id', 'link-canvas').lower();
	setupGradient(linkCanvas);

	// DRAG AND DROP

	/** Callback to rerender with new drawSettings, to prevent unnecessary rerenders
	 * TODO actually use this somewhere
	 */

	function rerender(drawSettings: DrawSettingsInterface) {
		renderNodes(rootNodes, canvasElement, drawSettings);
		renderNodeLabels(canvasElement, drawSettings);
		addLiftCollapseButtons(canvasElement, drawSettings, onCollapse, onLift);
		addDragAndDrop(rootNodes, graphData.nodesDict, canvasElement, linkCanvas, drawSettings);

		renderLinks(graphData.links, graphData.nodesDict, linkCanvas, drawSettings);
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
