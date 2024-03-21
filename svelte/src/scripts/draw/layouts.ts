import * as d3 from 'd3';
import type { DrawSettingsInterface, GraphDataEdge, GraphDataNode } from "$types";
import { notNaN } from "$helper";

/**
 * Helper function
 * Throws an error if any nodes in the given array is not yet drawn
 * Returns the same object but with different type
 */
function checkWidthHeight(nodes: GraphDataNode[]) : (GraphDataNode & {
	width: number; height: number
})[] {
	nodes.forEach(n => {
		if (!n.width || !n.height) {
			console.log({node: n})
			throw new TypeError(`Unexpected value: node ${n.id} has no dimensions ${n.width}, ${n.height}`);
		}
	})
	
	//@ts-expect-error Values can now not be undefined
	return nodes;
}

/** 
 * Circular layout
 * 
 * Assumes all nodes already have a width and height assigned
 * Only works on leaf nodes!
 */
export function circularLayout(drawSettings: DrawSettingsInterface, childNodes: GraphDataNode[], parentNode?: GraphDataNode) {
	const nodes = checkWidthHeight(childNodes)

	const circumference = nodes.reduce((acc, n) => {
		const thisNode = Math.sqrt(n.width**2 + n.height**2) + drawSettings.nodePadding;
		return acc + thisNode;
	}, 0);

	const radius = (circumference / (2*Math.PI)) + 20;
	const deltaAngle = 2*Math.PI/nodes.length;

	let maxX = .5 * notNaN(drawSettings.minimumNodeSize), 
		maxY = .5 * notNaN(drawSettings.minimumNodeSize), 
		minX = -.5 * notNaN(drawSettings.minimumNodeSize), 
		minY = -.5 * notNaN(drawSettings.minimumNodeSize);
	
	// Assign actual coordinates
	nodes.forEach((n, i) => {
		const angle = deltaAngle * i;
		n.x = notNaN(Math.sin(angle)*radius);
		n.y = notNaN(Math.cos(angle)*radius);
		maxX = Math.max(maxX, n.x + 0.5 * n.width);
		maxY = Math.max(maxY, n.y + 0.5 * n.height);
		minX = Math.min(minX, n.x - 0.5 * n.width);
		minY = Math.min(minY, n.y - 0.5 * n.height);
	});

	if (parentNode) {
		parentNode.width = notNaN(Math.abs(maxX) + Math.abs(minX) + 6*drawSettings.nodePadding); // TODO why 6?
		parentNode.height = notNaN(Math.abs(maxY) + Math.abs(minY) + 6*drawSettings.nodePadding);
	}
}

export function forceBasedLayout(drawSettings: DrawSettingsInterface, childNodes: GraphDataNode[], parentNode?: GraphDataNode) {
	checkWidthHeight(childNodes);

	// collect relevant edges
	const allLinks = new Set<GraphDataEdge>();
	childNodes.forEach(node => node.incomingLinksLifted.forEach(node => allLinks.add(node)));
	const copyLinks = [...allLinks].map(l => {return {
		source: l.liftedSource!,
		target: l.liftedTarget!,
	}});

	// Make and run simulation
	const simulation = d3.forceSimulation<GraphDataNode>(childNodes);
	simulation.force('charge', d3.forceManyBody().strength(d => {
		return (d as GraphDataNode).width! + (d as GraphDataNode).height! *-75;
	}));
	simulation.force('x', d3.forceX(0));
	simulation.force('y', d3.forceY(0));
	simulation.force('link', d3.forceLink(copyLinks)
		.id(n => (n as GraphDataNode).id)
	);
	simulation.tick(300);
	simulation.stop();

	// set parent dimensions
	if (parentNode) {
		const width = 2*(Math.max(...childNodes.map(node => Math.abs(node.x!) + .5*node.width!)) + drawSettings.nodePadding);
		const height = 2*(Math.max(...childNodes.map(node => Math.abs(node.y!) + 0.5*node.height!)) + drawSettings.nodePadding);
		parentNode.width = notNaN(width);
		parentNode.height = notNaN(height);
	}
}
