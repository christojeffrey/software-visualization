import * as d3 from 'd3';
import { toHTMLToken } from '$helper';
import type {
	ConfigInterface,
	DrawSettingsInterface,
	GraphData,
	GraphDataEdge,
	GraphDataNode
} from '$types';

import { radialClampForce, rectangleCollideForce } from './helper/custom-d3-forces';
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

function createInnerSimulation(
	level: number,
	nodes: GraphDataNode[],
	canvas: d3.Selection<SVGGElement, unknown, null, undefined>,
	allSimulation: d3.Simulation<GraphDataNode, undefined>[],
	parentNode: GraphDataNode,
	drawSettings: DrawSettingsInterface,
	onCollapse: (datum: GraphDataNode) => void,
	onLift: (datum: GraphDataNode) => void
) {
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
		innerSimulation.force('charge', d3.forceManyBody().strength(-300));
		innerSimulation.force('x', d3.forceX());
		innerSimulation.force('y', d3.forceY());
	}
	// add on tick handler
	innerSimulation.on('tick', () => {
		innerTicked(
			drawSettings,
			membersContainerElement,
			memberElements,
			memberLabelElements,
			collapseButtonElements,
			liftButtonElements
		);
	});
	allSimulation.push(innerSimulation);

	// add elements
	const parentElement = canvas.select(`#${toHTMLToken(parentNode.id)}`).append('g');
	// add node container elements
	const membersContainerElement = addNodeContainerElements(parentElement, nodes, allSimulation);

	// handle show node labels
	let memberLabelElements: d3.Selection<SVGTextElement, GraphDataNode, SVGGElement, unknown>;
	if (drawSettings.showNodeLabels) {
		memberLabelElements = addNodeLabelElements(membersContainerElement, drawSettings);
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

	// recursive inner simulation.
	for (let i = 0; i < nodes.length; i++) {
		if (nodes[i].members) {
			createInnerSimulation(
				level + 1,
				nodes[i].members ?? [],
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
	// create simulation
	const simulations: d3.Simulation<GraphDataNode, undefined>[] = [];

	const svg = d3
		.select(svgElement)
		.attr('width', SVGSIZE + SVGMARGIN * 2)
		.attr('height', SVGSIZE + SVGMARGIN * 2);

	setupGradient(svg);

	const simulation = d3.forceSimulation(graphData.nodes);
	simulation.force('charge', d3.forceManyBody().strength(-3000));
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
		nodeLabelsElements = addNodeLabelElements(containerElements, drawSettings);
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
	// add link container elements
	const linkContainer = addLinkContainerElements(canvas, graphData.links, drawSettings);

	// add link elements
	const linkElements = addLinkElements(linkContainer);

	// handle show edge labels
	let linkLabelElements: d3.Selection<SVGTextElement, GraphDataEdge, SVGGElement, unknown>;
	if (drawSettings.showEdgeLabels) {
		linkLabelElements = addLinkLabelElements(linkContainer);
	}

	const linkSimulation = d3
		.forceSimulation(graphData.flattenNodes)
		.force(
			'link',
			d3
				.forceLink(graphData.links)
				.id((node) => {
					return (node as GraphDataNode).id;
				})
				.strength(0)
		)
		.on('tick', () => {
			linkTicked(graphData.links, linkElements, linkLabelElements);
		});

	simulations.push(linkSimulation);
	// create inner simulation.
	for (let i = 0; i < graphData.nodes.length; i++) {
		createInnerSimulation(
			1,
			graphData.nodes[i].members ?? [], // handle when members is undefined (has no member)
			canvas,
			simulations,
			graphData.nodes[i],
			drawSettings,
			onCollapse,
			onLift
		);
	}

	// disable alpha
	if (drawSettings.disableAnimation) {
		simulations.forEach((s) => {
			s.alpha(0.00001); // check slowAlpha for more detail.
		});
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
