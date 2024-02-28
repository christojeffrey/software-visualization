import * as d3 from 'd3';
import { toHTMLToken } from '$helper';
import type {
	ConfigInterface,
	DrawSettingsInterface,
	GraphData,
	GraphDataEdge,
	GraphDataEdgeD3,
	GraphDataNode
} from '$types';

import { downForce, radialClampForce, rectangleCollideForce } from './helper/custom-d3-forces';
import {
	addCollapseNodeButtonElements,
	addLiftEdgeButtonElements,
	addLinkContainerElements,
	addLinkElements,
	addLinkLabelElements,
	addNodeContainerElements,
	addNodeElements,
	addNodeLabelElements
} from './helper/element-adder';
import { setupGradient } from './helper/gradient-setup';
import { innerTicked, linkTicked, masterSimulationTicked } from './helper/tick';

const SVGSIZE = 800;
const SVGMARGIN = 50;

/**
 * Filters and maps links to make them suitable to use for a linkforce within a simulation (inner or outer)
 * Every link will only be present in the innermost simulation where it can exists, meaning the simulation 
 * corresponding to the node which is the least common ancestor to the source and target node.
 * 
 * WARNING: The resulting object will contain IDs rather than links. However, D3 will replace them with 
 * objects in place if this method is used as intended, hence the incorrect return type.
 */
function makeSimulationLinks(
	links: GraphDataEdge[], 
	simulationNodes: GraphDataNode[], // Nodes present in the simulation of parentNode 
	allNodes: GraphDataNode[], // All nodes (flattened)
	parentNode?: GraphDataNode, // Leave undefined for mastersimulation
): GraphDataEdgeD3[] {
	/** Returns the id of the ancestor of node s, present in the given nodeList */
	function findIdInNodeList(s: string, nodeList: GraphDataNode[] = simulationNodes): string | undefined {
		return nodeList.find(n => n.id === s || findIdInNodeList(s, n.members ?? []))?.id
	}

	/** Checks if parentNode is the least common ancestor of the 2 given nodes */
	function parentIsLCA(id1: string, id2: string) {
		const n1 = allNodes.find(n => n.id === id1)!;
		const n2 = allNodes.find(n => n.id === id2)!;
		const zipped = [n1, ...n1.ancestors!].map((e, i) => [e, [n2, ...n2.ancestors!][i]])
		const parentId = zipped.findLast(n => n[0]?.id === n[1]?.id)?.[0]?.id;
		return parentId === parentNode?.id;
	}

	// @ts-expect-error See method description.
	const result: GraphDataEdgeD3[] = links.flatMap((l => {	
		const source = findIdInNodeList(l.source);
		const target = findIdInNodeList(l.target);
		if (parentIsLCA(l.source, l.target)) {
			return [{...l,
				source: source,
				target: target,
				realSource: allNodes.find(n => n.id === l.source),
				realTarget: allNodes.find(n => n.id === l.target),
			}]
		} else {
			return [];
		}
	}));
	return result;
}

function createInnerSimulation(
	level: number,
	nodes: GraphDataNode[], // Nodes in the inner simulation
	allLinks: GraphDataEdge[], // All links, including those outside the simulation
	allNodes: GraphDataNode[],
	canvas: d3.Selection<SVGGElement, unknown, null, undefined>,
	allSimulation: d3.Simulation<GraphDataNode, undefined>[],
	parentNode: GraphDataNode,
	drawSettings: DrawSettingsInterface,
	onCollapse: (datum: GraphDataNode) => void,
	onLift: (datum: GraphDataNode) => void
) {
	if (nodes.length < 1) return;

	// use this instead of forEach so that it is passed by reference.

	// bind for easy reference.
	for (let i = 0; i < nodes.length; i++) {
		nodes[i].parent = parentNode;
	}

	// create simulation and add forces
	const innerSimulation = d3.forceSimulation(nodes);
	innerSimulation.force('collide', rectangleCollideForce());

	const useRadialLayout =
		nodes.length > 2 &&
		nodes.reduce(
			(a: number, item) => (item?.members?.length ? (item?.members?.length > 0 ? a + 1 : a) : a),
			0
		) === 0;

	if (useRadialLayout) {
		innerSimulation.force('charge', d3.forceManyBody().strength(-3000));
		innerSimulation.force(
			'radial',
			radialClampForce(() => {
				const res =
					nodes.reduce((a: number, node) => a + Math.sqrt(node.width ** 2 + node.height ** 2), 0) /
					(Math.PI * 2);
				const radius = res + 2 * drawSettings.minimumNodeSize; // Offset for small circles (2 nodes)
				return radius;
			})
		);
	} else {
		innerSimulation.force('x', d3.forceX());
		innerSimulation.force('y', d3.forceY());
		innerSimulation.force('tree', downForce());
	}
	allSimulation.push(innerSimulation);

	// add elements
	const parentElement = canvas.select(`#${toHTMLToken(parentNode.id)}`).append('g');
	// add node container elements
	const membersContainerElement = addNodeContainerElements(parentElement, nodes, allSimulation);

	// handle show node labels
	let memberLabelElements: d3.Selection<SVGTextElement, GraphDataNode, SVGGElement, unknown>;
	if (drawSettings.showNodeLabels) {
		memberLabelElements = addNodeLabelElements(membersContainerElement);
	}

	const memberElements = addNodeElements(membersContainerElement, drawSettings, level);

	// filter only if has member
	const collapseButtonElements = addCollapseNodeButtonElements(
		membersContainerElement,
		drawSettings,
		onCollapse
	);

	const liftButtonElements = addLiftEdgeButtonElements(
		membersContainerElement,
		drawSettings,
		onLift
	);

	const innerLinks = makeSimulationLinks(allLinks, nodes, allNodes, parentNode);
	
		innerSimulation
			.force(
				'link',
				d3
					.forceLink(innerLinks)
					.id((node) => {
						return (node as GraphDataNode).id;
					})
					.strength(0)
			);
	
	const linkContainer = addLinkContainerElements(canvas, innerLinks, drawSettings);
	const linkElements = addLinkElements(linkContainer);

	// add on tick handler
	innerSimulation.on('tick', () => {
		linkTicked(innerLinks, linkElements, undefined),
		innerTicked(
			drawSettings,
			membersContainerElement,
			memberElements,
			memberLabelElements,
			collapseButtonElements,
			liftButtonElements
		);
	});
	
	// recursive inner simulation.
	for (let i = 0; i < nodes.length; i++) {
		if (nodes[i].members) {
			createInnerSimulation(
				level + 1,
				nodes[i].members ?? [],
				allLinks,
				allNodes,
				canvas,
				allSimulation,
				nodes[i],
				drawSettings,
				onCollapse,
				onLift
			);
		}
	}
}

export function draw(
	svgElement: SVGElement,
	graphData: GraphData,
	config: ConfigInterface,
	drawSettings: DrawSettingsInterface,
	onCollapse: (datum: GraphDataNode) => void,
	onLift: (datum: GraphDataNode) => void
) {
	const simulations: d3.Simulation<GraphDataNode, undefined>[] = [];

	const svg = d3
		.select(svgElement)
		.attr('width', SVGSIZE + SVGMARGIN * 2)
		.attr('height', SVGSIZE + SVGMARGIN * 2);

	setupGradient(svg);

	const simulation = d3.forceSimulation(graphData.nodes);
	simulation.force('x', d3.forceX(SVGSIZE / 2));
	simulation.force('y', d3.forceY(SVGSIZE / 2));
	simulation.force('collide', rectangleCollideForce());
	simulation.on('tick', () => {
		masterSimulationTicked(
			graphData,
			containerElements,
			nodeElements,
			drawSettings,
			nodeLabelsElements,
			collapseButtonElements,
			liftButtonElements
		);
	});

	simulations.push(simulation);

	const canvas = svg.append('g').attr('id', 'node-canvas');

	// NODE
	// add node container and add ability to drag node
	const containerElements = addNodeContainerElements(canvas, graphData.nodes, simulations);

	// handle show node labels
	let nodeLabelsElements: d3.Selection<SVGTextElement, GraphDataNode, SVGGElement, unknown>;
	if (drawSettings.showNodeLabels) {
		nodeLabelsElements = addNodeLabelElements(containerElements);
	}

	// add node element
	const nodeElements = addNodeElements(containerElements, drawSettings, 0);

	// add node collapse button
	const collapseButtonElements = addCollapseNodeButtonElements(
		containerElements,
		drawSettings,
		onCollapse
	);

	// add node lift button
	const liftButtonElements = addLiftEdgeButtonElements(containerElements, drawSettings, onLift);

	// LINK
	const links = makeSimulationLinks(graphData.links, graphData.nodes, graphData.flattenNodes, undefined);

	// add link container elements
	const linkContainer = addLinkContainerElements(canvas, links, drawSettings);

	// add link elements
	const linkElements = addLinkElements(linkContainer);

	// handle show edge labels
	let linkLabelElements: d3.Selection<SVGTextElement, GraphDataEdgeD3, SVGGElement, unknown>;
	if (drawSettings.showEdgeLabels) {
		linkLabelElements = addLinkLabelElements(linkContainer);
	}

	// Link helper functions
	function findNode (n: GraphDataNode): GraphDataNode {
		return graphData.nodes.includes(n) ? n : findNode(n.parent!);
	}
	function findNodeId(s: string): string {
		const node = graphData.nodes.find(n => n.id === s);
		return node ? node.id : findNodeId(
			graphData.flattenNodes.find(n => n.id === s)!.parent!.id
		);
	}
	simulation
		.force(
			'link',
			d3
				.forceLink(links)
				.id((node) => {
					return findNode(node as GraphDataNode).id;
				})
				.strength(0)
		)
		.on('tick', () => {
			linkTicked(links, linkElements, linkLabelElements);
			masterSimulationTicked(
				graphData,
				containerElements,
				nodeElements,
				drawSettings,
				nodeLabelsElements,
				collapseButtonElements,
				liftButtonElements
			);
		});

	// create inner simulation.
	for (let i = 0; i < graphData.nodes.length; i++) {
		createInnerSimulation(
			1,
			graphData.nodes[i].members ?? [], // handle when members is undefined (has no member)
			graphData.links,
			graphData.flattenNodes,
			canvas,
			simulations,
			graphData.nodes[i],
			drawSettings,
			onCollapse,
			onLift
		);
	}

	// Add zoom handler
	svg.call(
		d3.zoom<SVGElement, unknown>().on('zoom', ({ transform }) => {
			canvas.attr('transform', transform);
			drawSettings.transformation = transform;
		})
	);

	//Reload last transformation, if available
	if (drawSettings.transformation) {
		canvas.attr(
			'transform',
			`translate(${drawSettings.transformation.x}, ${drawSettings.transformation.y}) scale(${drawSettings.transformation.k})`
		);
	}

	return {
		simulations,
		svgElement
	};
}

export default draw;
