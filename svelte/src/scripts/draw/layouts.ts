import * as d3 from 'd3';
import type { DrawSettingsInterface, GraphDataEdge, GraphDataNode } from "$types";
import { notNaN } from "$helper";

type GraphDataNodeExt = (GraphDataNode & {width: number; height: number});

/**
 * Helper function
 * Throws an error if any nodes in the given array is not yet drawn
 * Returns the same object but with different type
 */
function checkWidthHeight(nodes: GraphDataNode[]) : GraphDataNodeExt[] {
	nodes.forEach(n => {
		if (!n.width || !n.height) {
			console.log({node: n})
			throw new TypeError(`Unexpected value: node ${n.id} has no dimensions ${n.width}, ${n.height}`);
		}
		if (!Number.isFinite(n.width) || !Number.isFinite(n.height) || Number.isNaN(n.width) || Number.isNaN(n.height)) {
			console.log({node: n})
			throw new TypeError(`Unexpected value: node ${n.id} has NaN/infinite dimensions ${n.width}, ${n.height}`);
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
		const width = 2*(Math.max(.5*drawSettings.minimumNodeSize, ...childNodes.map(node => Math.abs(node.x!) + .5*node.width!)) 
			+ drawSettings.nodePadding);
		const height = 2*(Math.max(.5*drawSettings.minimumNodeSize, ...childNodes.map(node => Math.abs(node.y!) + 0.5*node.height!)) 
			+ drawSettings.nodePadding);
		parentNode.width = notNaN(width);
		parentNode.height = notNaN(height);
	}
}

/**
 * Planar, straight line orthogonal tree drawing 
 * ([Crescenzi Di Battista Piperno 92] [Shiloach 76])
 * 
 * Designed for binary trees, but there is no reason at all this should not generalize if we accept edge crossings 
 * (which is unavoidable anyway)
 */

export function straightTree(drawSettings: DrawSettingsInterface, childNodes: GraphDataNode[], parentNode?: GraphDataNode) {
	// TODO: Once again, rethink split
	if (childNodes.length === 0) {return}

	// Initialize the nodes, and augment their datatype
	// The next property holds the next nodes in tree-structure
	type STNode = GraphDataNodeExt & {next: STNode[]};
	const nodes = checkWidthHeight(childNodes) as STNode[];
	nodes.forEach(n => n.next = []);


	// Function (and type) to find the next root node (via reduce)
	type NextRootNodeAccType = {node: STNode, score: number} | undefined;
	const nextRootNode = (acc: NextRootNodeAccType, node: STNode) => {
		const score = node.incomingLinksLifted.length - node.outgoingLinksLifted.length;
		if (score < (acc?.score ?? Infinity)) {
			return {node: node, score: score};
		} else {
			return acc;
		}
	};

	// Pick root at random (preferably the least amount of incoming nodes)
	const rootNode: STNode = nodes.reduce(nextRootNode, undefined as NextRootNodeAccType)!.node;
	console.log({rootNode});

	// Discover tree structure by breadth-first-search
	// https://en.wikipedia.org/wiki/Edmonds%27_algorithm
	const toExplore = [rootNode];
	while (toExplore.length != childNodes.length) {
		for(let i = 0; i < toExplore.length; i++) {
			toExplore[i].outgoingLinksLifted.forEach(edge => {
				const target = edge.liftedTarget! as STNode;
				if (!toExplore.includes(target)) {
					toExplore.push(target);
					toExplore[i].next.push(target);
				}
			});
		}

		if (toExplore.length != childNodes.length) {
			// Lets just say the disjointed part is a random leaf.
			const randomNode = nodes.filter(n => !toExplore.includes(n)).reduce(nextRootNode, undefined as NextRootNodeAccType)!.node
			const lastNode = toExplore[toExplore.length-1]!;
			lastNode.next.push(randomNode);
			toExplore.push(randomNode);

			// console.warn(`Straight tree layout is not built for disjoint graphs. \r\n
			// 	Continuing by treating ${randomNode.id} as a child of ${lastNode.id}`);
		}
	}

	if (toExplore.length !== nodes.length) {
		throw new Error("Unexplored nodes", {cause: nodes.filter(n => !toExplore.includes(n))});
	}

	// Make sure all nodes have their top left coordinate at the same spot, namely the center of the parentnode 
	nodes.forEach(n => {
		n.x = 0.5*n.width + drawSettings.nodePadding;
		n.y = 0.5*n.height + drawSettings.nodePadding;
	});

	/** Actually layout the nodes, recursively */ 
	function layoutRec(node: STNode): {
		width: number,
		height: number,
		nodes: STNode[],
	} {
		// Base case: we have a singular node.
		if(node.next.length === 0) {
			return {
				width: node.width,
				height: node.height,
				nodes: [node],
			}
		}

		// Recurse: calculate a sub-layout for all successors in the tree-structure
		const layouts = node.next.map(n => layoutRec(n)!)

		// Sort all layouts by size, increasing
		layouts.sort((a, b) => a.width * a.height - b.width * b.height);

		let verticalLayout = layouts[0];
		let horizontalLayout = layouts.slice(1);
		if (horizontalLayout.length === 0) {
			horizontalLayout = [verticalLayout];
			verticalLayout = {
				width: 0, height: 0, nodes: []
			}
		}

		// Layout 0 (the smallest layout) should go to the bottom
		let currentHeight = node.height + drawSettings.nodePadding;
		verticalLayout.nodes.forEach(n => {n.y! += currentHeight});
		currentHeight += verticalLayout.height;

		// Layouts 1-n should go to the right
		let currentWidth = Math.max(verticalLayout.width, node.width) + drawSettings.nodePadding;
		horizontalLayout.reverse().forEach(layout => {
			layout.nodes.forEach(n => {n.x = (n.x ?? 0) + currentWidth});
			currentWidth += layout.width
		});

		return {
			width: currentWidth,
			height: Math.max(currentHeight, ...layouts.map(l => l.height)),
			nodes: [node, ...layouts.flatMap(l => l.nodes)],
		}
	}

	const finalLayout = layoutRec(rootNode);

	if (parentNode) {
		parentNode.width = finalLayout.width + 2*drawSettings.nodePadding;
		parentNode.height = finalLayout.height  + 2*drawSettings.nodePadding;

		// Translate all nodes such that the top-left coordinate of the rootNode is in the top-left corner of the parentNode.
		finalLayout.nodes.forEach(n => {
			n.x! -= 0.5*parentNode.width!;
			n.y! -= 0.5*parentNode.height!;
		})
	}

	//Finally, cleanup and remove excess property
	nodes.forEach(n => {
		//@ts-expect-error Cleanup
		delete n.next;
	})
}