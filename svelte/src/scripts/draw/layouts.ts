/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as d3 from 'd3';
import type { DrawSettingsInterface, GraphDataEdge, GraphDataNode } from "$types";
import { notNaN } from "$helper";

type GraphDataNodeExt = (GraphDataNode & {width: number; height: number});
type TreeNode = GraphDataNodeExt & {next: TreeNode[]};
type NodeLayout = (drawSettings: DrawSettingsInterface, childNodes: GraphDataNode[], parentNode?: GraphDataNode) => void;

/**
 * Helper function for layouts
 * 
 * Throws an error if any nodes in the given array is not yet drawn.
 * Returns the same object but with different type.
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
export const circularLayout: NodeLayout = function(drawSettings, childNodes, parentNode?) {
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

export const forceBasedLayout: NodeLayout = function(drawSettings, childNodes, parentNode) {
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

function discoverTree(graphNodes: GraphDataNode[]) {
	// Initialize the nodes, and augment their datatype
	// The next property holds the next nodes in tree-structure
	const nodes = checkWidthHeight(graphNodes) as TreeNode[];
	nodes.forEach(n => n.next = []);

	// Function (and type) to find the next root node (via reduce)
	type NextRootNodeAccType = {node: TreeNode, score: number} | undefined;
	const nextRootNode = (acc: NextRootNodeAccType, node: TreeNode) => {
		const score = node.incomingLinksLifted.length - node.outgoingLinksLifted.length;
		if (score < (acc?.score ?? Infinity)) {
			return {node: node, score: score};
		} else {
			return acc;
		}
	};

	// Pick root at random (preferably the least amount of incoming nodes)
	const rootNode: TreeNode = nodes.reduce(nextRootNode, undefined as NextRootNodeAccType)!.node;

	// Discover tree structure by breadth-first-search
	// https://en.wikipedia.org/wiki/Edmonds%27_algorithm
	const toExplore = [rootNode];
	while (toExplore.length != nodes.length) {
		for(let i = 0; i < toExplore.length; i++) {
			toExplore[i].outgoingLinksLifted.forEach(edge => {
				const target = edge.liftedTarget! as TreeNode;
				if (!toExplore.includes(target)) {
					toExplore.push(target);
					toExplore[i].next.push(target);
				}
			});
		}

		if (toExplore.length != nodes.length) {
			// Lets just say the disjointed part is a random leaf.
			const randomNode = nodes.filter(n => !toExplore.includes(n)).reduce(nextRootNode, undefined as NextRootNodeAccType)!.node
			const lastNode = toExplore[toExplore.length-1]!;
			lastNode.next.push(randomNode);
			toExplore.push(randomNode);
		}
	}

	if (toExplore.length !== nodes.length) {
		throw new Error("Unexplored nodes", {cause: nodes.filter(n => !toExplore.includes(n))});
	}

	return {nodes, rootNode};
}

function cleanupTree(nodes: TreeNode[]) {
	//Finally, cleanup and remove excess property
	nodes.forEach(n => {
		//@ts-expect-error Cleanup
		delete n.next;
	})
}

/**
 * Planar, straight line orthogonal tree drawing 
 * ([Crescenzi Di Battista Piperno 92] [Shiloach 76])
 * 
 * Designed for binary trees, but there is no reason at all this should not generalize if we accept edge crossings 
 * (which is unavoidable anyway)
 */

export const straightTreeLayout: NodeLayout = function(drawSettings, childNodes, parentNode?) {
	if (childNodes.length === 0) {return}

	const {nodes, rootNode} = discoverTree(childNodes);

	// Make sure all nodes have their top left coordinate at the same spot, namely the center of the parentnode 
	nodes.forEach(n => {
		n.x = 0.5*n.width + drawSettings.nodePadding;
		n.y = 0.5*n.height + drawSettings.nodePadding;
	});

	/** Actually layout the nodes, recursively */ 
	function layoutRec(node: TreeNode): {
		width: number,
		height: number,
		nodes: TreeNode[],
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

	cleanupTree(nodes);
}

/** Helper function for layout algorithms
 * Given a list of nodes, reposition them such that the nodes are centered around the point 0,0.
 * 
 * Necessary to make sure the node "fits" its parent. Returns the required height and width
 */
function centerize(nodes: GraphDataNode[], edges?: GraphDataEdge[]) {
	const minX = nodes.reduce((acc,n) => Math.min(acc, n.x! - 0.5*n.width!), Infinity);
	const minY = nodes.reduce((acc,n) => Math.min(acc, n.y! - 0.5*n.height!), Infinity);
	const maxX = nodes.reduce((acc,n) => Math.max(acc, n.x! + 0.5*n.width!), -Infinity);
	const maxY = nodes.reduce((acc,n) => Math.max(acc, n.y! + 0.5*n.height!), -Infinity);
	
	const centerX = (maxX - minX) / 2;
	const centerY = (maxY - minY) / 2;

	nodes.forEach(n => {
		n.x! -= centerX;
		n.y! -= centerY;
	});

	if (edges) {
		edges.forEach(e => {
			e.routing.forEach((point) => {
				point.x -= centerX;
				point.y -= centerY;
			})
		})
	}

	return {
		width: 2*centerX,
		height: 2*centerY,
	}
}

/**
 * A layered tree using the Sugiyama method
 */
export const layerTreeLayout: NodeLayout = function(drawSettings, childNodes, parentNode?) {
	if (childNodes.length === 0) return;

	/**
	 * Apply the Sugiyama method:
	 * 1. Discard edges until the graph is a DAG (implemented as finding a spanning DAG instead)
	 * 2. Assign layers
	 * 3. Vertex ordering
	 * 4. Coordinate assignment
	 */

	/** GraphDataNode extended with a property assigning a layer to the node
	 * The layer indicates at which layer the node will be rendered (top to bottom) */
	type LayerTreeNode = GraphDataNodeExt & {
		layer?: number;
	}
	/** Same as childNodes, but cast to the right type */
	const nodes = checkWidthHeight(childNodes) as LayerTreeNode[];

	/** DummyType for vertex ordering step */
	type DummyNode = {
		layer: number
		height: number,
		width: number,
		x?: number,
		y?: number,
		/** The existence of this property is used to mark this node as a DummyNode */
		isDummy: true,
		/** In between steps 3 and 4, dummynodes are merged and deleted. 
		 * If this node has been deleted, this property points to the merged node */
		realDummy?: DummyNode,
	}

	/** Array containing all layers, where layers themselves are stored. 
	 * Layers themselves are modelled as arrays of nodes, where the position in the array indicated the position the node is rendered in.
	 * 
	 * Dummynodes may be inserted in the vertex ordering step.
	 */
	const layerNodes: (LayerTreeNode | DummyNode)[][] = [];

	// Step 1: building DAG.
	/** Edges from the spanning DAG used to generate the layered tree */
	const DAGedges = discoverDAG(nodes);

	// Step 2: Layer assignment via simple topological sort
	{
		let edgeSort = [...DAGedges];
		let nodeSort = [...nodes];

		let i = 0;

		while (nodeSort.length > 0) {
			// All nodes with no incoming edges are in layer i
			layerNodes[i] = nodeSort.filter(node => edgeSort.filter(e => e.liftedTarget === node).length === 0);
			layerNodes[i].forEach(n => {n.layer = i;})

			// If we filtered no nodes, we're going to get stuck.
			if (layerNodes[i].length === 0) {
				console.error({nodes, layerNodes, i, nodeSort, edgeSort});
				throw new Error('Invalid data in layering algorithm');
			}

			// Remove these nodes from the graph
			nodeSort = nodeSort.filter(n => !layerNodes[i].includes(n))

			// And remove the edges going to the nodes we just filtered out
			edgeSort = edgeSort.filter(e => !(
				layerNodes[i].includes(e.liftedTarget as LayerTreeNode) ||
				layerNodes[i].includes(e.liftedSource as LayerTreeNode)
			));

			// On to the next layer
			i++;
		}
	}

	// Step 3: Put nodes in the layer in a clean order.
	// First, give us a copy of the edgedata we can easily edit and extend. For this we only need the source and target.
	type SugEdge = {
		source: LayerTreeNode | DummyNode;
		target: LayerTreeNode | DummyNode;
		original: GraphDataEdge;
	};

	const sugEdges = [...DAGedges].map((e): SugEdge => {return {
		source: e.liftedSource as LayerTreeNode,
		target: e.liftedTarget as LayerTreeNode,
		original: e,
	}});

	// Step 3 part 1: Insert dummy nodes for edges spanning multiple layers
	for(let i = 0; i < sugEdges.length; i++) {
		const e = sugEdges[i];
		const distance = e.target.layer! - e.source.layer!;
		if (distance > 1) {
			// make dummy node
			const dummyNode: DummyNode = {
				layer: e.source.layer! + 1,
				height: 0,
				width: 0,
				isDummy: true,
			};
			layerNodes[e.source.layer! + 1].push(dummyNode);
			
			// Add new edge from dummy to target
			sugEdges.push({
				source: dummyNode,
				target: e.target,
				original: e.original,
			})

			// Change current edge to go to the dummy node
			e.target = dummyNode
		}
	}

	// Step3 part 2: Sort the vertices using a heuristic.
	// The heuristic puts the nodes in each layer in the median position of their predecessor
	const amountOfIterations = 40;
	for(let j = 0; j < amountOfIterations; j++) {
		layerNodes.forEach((layer, i) => {
			const newLayer = layer.map(node => {
				const predecessorsRanks = sugEdges.filter(e => e.target === node)
					.map(e => layerNodes[i-1]?.findIndex(x => x === e.source));
				const median = predecessorsRanks.sort((a, b) => a - b)[Math.floor(predecessorsRanks.length/2)]
				return {median, node}
			}).sort((a, b) => a.median - b.median)
			.map(({node}) => node);
			
			layerNodes[i] = newLayer;
		});
	};

	// In between: let's remove consecutive dummy edges, otherwise the result will look ugly
	//@ts-ignore Assume everything is a dummy (we check by checking isDummy)
	layerNodes.forEach((layer: DummyNode[]) => {
		for (let i = 0; i < layer.length;) {
			if (layer[i]?.isDummy && layer[i+1]?.isDummy) {
				layer[i+1].realDummy = layer[i];
				layer.splice(i+1, 1);
			} else {
				i++;
			}
		}
	})

	// Step 4: Coordinate assignment
	// First, make sure everything has the same width and height
	const numColumns = Math.max(...layerNodes.map(l => l.length));

	layerNodes.forEach(layer => {
		const maxHeight = Math.max(...layer.map(l => l.height));
		layer.forEach(node => node.height = maxHeight);
	})

	for (let i = 0; i < numColumns; i++) {
		const columnWidth = Math.max(...layerNodes.map(l => l[i]?.width ?? 0));
		layerNodes.forEach(layer => layer[i] ? layer[i].width = columnWidth : undefined);
	}

	// Assign coordinates
	let currentHeight = 0;

	layerNodes.forEach(layer => {
		let currentWidth = 0;
		layer.forEach(node => {
			node.y = currentHeight + 0.5*node.height;
			node.x = currentWidth + 0.5*node.width;
			currentWidth += node.width + drawSettings.nodePadding;
		});
		currentHeight += layer[0]?.height + drawSettings.nodePadding;
	});

	// Finally: edge routing
	// We want to rout edges through their dummy nodes.
	sugEdges.forEach(e => {
		//@ts-ignore typescript is not very clever
		if (e.target.isDummy === true) {
			// Dummynode might have been deleted, in that case the property realDummy will point us to the 
			// correct dummy.
			const target = (e.target as DummyNode).realDummy ?? e.target as DummyNode;
			e.original.routing.push({
				x: notNaN(target.x),
				y: notNaN(target.y),
				origin: parentNode,
			});
		}
	});

	if (parentNode) {
		const {width, height} = centerize(nodes, [...DAGedges]);

		parentNode.width = width + 2*drawSettings.nodePadding;
		parentNode.height = height + 2*drawSettings.nodePadding;
	}
}

/**
 * Searches for a spanning DAG in the given nodes. Returns the edges of said DAG.
 * 
 * Should be optimized at some point.
 */
function discoverDAG(graphNodes: (GraphDataNode)[]) {
	type MarkedNode = GraphDataNode & {mark?: boolean};
	const nodes = graphNodes as  MarkedNode[];
	const DAGedges: GraphDataEdge[] = [];

	// Start with all edges
	nodes.forEach(node => {
		node.outgoingLinksLifted.forEach(e => {
			if (!DAGedges.includes(e)) {
				DAGedges.push(e)
			};
		})
	})

	/** Depth first search: remove node if we run into a cycle*/ 
	function dfs(node: MarkedNode, markedNodes: GraphDataNode[]) {
		DAGedges.filter(e => e.liftedSource === node).forEach(edge => {
			const target = edge.liftedTarget!;
			if (markedNodes.includes(target)) {
				const index = DAGedges.findIndex(e => e === edge);
				DAGedges.splice(index, 1);
			} else {
				if (!node.mark) dfs(target, [...markedNodes, target]);
			}
		})
		node.mark = true;
	}

	nodes.forEach(node => {
		if (!node.mark) {
			dfs(node, [node]);
		}
	})

	nodes.forEach(node => {
		delete node.mark;
	});

	return new Set(DAGedges);
}
