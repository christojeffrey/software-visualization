import * as d3 from 'd3';
import { innerTicked, linkTicked, masterSimulationTicked } from './tick';
import { dragEndedNode, dragStartedNode, draggedNode } from './drag-handler';
import { setupGradient } from './gradient-setup';
import type {
	ConfigInterface,
	DrawSettingsInterface,
	GraphData,
	GraphDataEdge,
	GraphDataNode
} from '../../types';
import { radialClampForce, rectangleCollideForce } from './custom-d3-forces';

const SVGSIZE = 800;
const SVGMARGIN = 50;

function toHTMLToken(string: string) {
	return string.replace(/[^A-Za-z0-9]/g, '--');
}

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
				const radius = res + 2 * drawSettings.minimumVertexSize; // Offset for small circles (2 nodes)
				return radius;
			})
		);
	} else {
		innerSimulation.force('charge', d3.forceManyBody().strength(-300));
		innerSimulation.force('x', d3.forceX());
		innerSimulation.force('y', d3.forceY());
	}

	allSimulation.push(innerSimulation);

	const parentElement = canvas.select(`#${toHTMLToken(parentNode.id)}`).append('g');

	const membersContainerElement = parentElement
		.selectAll('g')
		.data(nodes)
		.enter()
		.append('g')
		.attr('class', 'node')
		.attr('id', (d) => toHTMLToken(d.id));

	// handle show node labels
	let memberLabelElements: d3.Selection<SVGTextElement, GraphDataNode, SVGGElement, unknown>;
	if (drawSettings.showNodeLabels) {
		memberLabelElements = membersContainerElement
			.append('text')
			.attr('class', 'node-label')
			.attr('text-anchor', 'middle')
			.attr('dominant-baseline', 'middle')
			.attr('fill', 'black')
			.attr('font-size', '10px')
			.text((d) => d.id);
	}
	membersContainerElement.call(
		d3
			.drag<SVGGElement, GraphDataNode>()
			.on('start', (d) => {
				dragStartedNode(d, allSimulation);
			})
			.on('drag', (d) => {
				draggedNode(d, allSimulation);
			})
			.on('end', (d) => {
				dragEndedNode(d, allSimulation);
			})
	);
	const memberElements = membersContainerElement
		.append('rect')
		.attr('x', 0)
		.attr('y', 0)
		.attr('width', drawSettings.minimumVertexSize)
		.attr('height', drawSettings.minimumVertexSize)
		.style('fill', drawSettings.nodeColors[level] ?? drawSettings.nodeDefaultColor)
		.attr('fill-opacity', '0.2')
		.attr('rx', drawSettings.nodeCornerRadius);

	// filter only if has member
	const collapseButtonElements = membersContainerElement
		.filter((d) => {
			return (d.members?.length ?? 0) > 0 || (d.originalMembers?.length ?? 0) > 0;
		})
		.append('circle')
		.attr('r', drawSettings.buttonRadius)
		.attr('cx', 0)
		.attr('cy', 0)
		.attr('fill', 'red')
		.attr('fill-opacity', '0.1')
		.on('click', (_e, i) => {
			onCollapse(i);
		});

	const liftButtonElements = membersContainerElement
		.filter((d) => {
			return (d.members?.length ?? 0) > 0 || (d.originalMembers?.length ?? 0) > 0;
		})
		.append('circle')
		.attr('r', drawSettings.buttonRadius)
		.attr('cx', drawSettings.buttonRadius)
		.attr('cy', 0)
		.attr('fill', 'blue')
		.attr('fill-opacity', '0.1')
		.on('click', (_e, i) => {
			onLift(i);
		});
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
			containerElement,
			nodeElements,
			drawSettings,
			nodeLabelsElements,
			collapseButtonElements,
			liftButtonElements
		);
	});

	simulations.push(simulation);

	const canvas = svg.append('g');

	// NODE
	const containerElement = canvas
		.append('g')
		.attr('id', 'node-canvas')
		.selectAll('g')
		.data(graphData.nodes)
		.enter()
		.append('g')
		.attr('class', 'nodes')
		.attr('id', (d) => toHTMLToken(d.id));

	// handle show node labels
	let nodeLabelsElements: d3.Selection<SVGTextElement, GraphDataNode, SVGGElement, unknown>;
	if (drawSettings.showNodeLabels) {
		nodeLabelsElements = containerElement
			.append('text')
			.attr('class', 'node-label')
			.attr('text-anchor', 'middle')
			.attr('dominant-baseline', 'middle')
			.attr('fill', 'black')
			.attr('font-size', '10px')
			.text((d) => d.id);
	}

	containerElement.call(
		d3
			.drag<SVGGElement, GraphDataNode>()
			.on('start', function (this: SVGGElement, e) {
				// To combine element drag and pan
				d3.select(this).raise();
				dragStartedNode(e, simulations);
			})
			.on('drag', (e) => draggedNode(e, simulations))
			.on('end', (e) => dragEndedNode(e, simulations))
	);

	const nodeElements = containerElement
		.append('rect')
		.attr('x', 0)
		.attr('y', 0)
		.attr('width', drawSettings.minimumVertexSize)
		.attr('height', drawSettings.minimumVertexSize)
		.attr('fill', drawSettings.nodeColors[0] ?? drawSettings.nodeDefaultColor)
		.attr('fill-opacity', '0.1')
		.attr('rx', drawSettings.nodeCornerRadius);

	const collapseButtonElements = containerElement
		.filter((d) => {
			return (d.members?.length ?? 0) > 0 || (d.originalMembers?.length ?? 0) > 0;
		})
		.append('circle')
		.attr('r', drawSettings.buttonRadius)
		.attr('cx', 0)
		.attr('cy', 0)
		.attr('fill', 'red')
		.attr('fill-opacity', '0.1')
		.on('click', (_e, i) => {
			onCollapse(i);
		});

	const liftButtonElements = containerElement
		.filter((d) => {
			return (d.members?.length ?? 0) > 0 || (d.originalMembers?.length ?? 0) > 0;
		})
		.append('circle')
		.attr('r', drawSettings.buttonRadius)
		.attr('cx', drawSettings.buttonRadius)
		.attr('cy', 0)
		.attr('fill', ({ id }) => {
			if (config.dependencyLifting.find(({ node }) => node.id === id)) {
				return 'aqua';
			}
			return 'blue';
		})
		.attr('fill-opacity', '0.1')
		.on('click', (_e, i) => {
			onLift(i);
		});

	// LINK
	const linkContainer = canvas
		.append('g')
		.attr('id', 'link-canvas')
		.selectAll('g')
		.data(graphData.links.filter((link) => drawSettings.shownEdgesType.get(link.type)))
		.enter()
		.append('g')
		.attr('class', 'links')
		.attr('id', (d) => d.id);

	const linkElements = linkContainer.append('path').attr('class', 'link');

	// handle show edge labels
	let linkLabelElements: d3.Selection<SVGTextElement, GraphDataEdge, SVGGElement, unknown>;
	if (drawSettings.showEdgeLabels) {
		linkLabelElements = linkContainer
			.append('text')
			.attr('class', 'link-label')
			.attr('text-anchor', 'middle')
			.attr('dominant-baseline', 'middle')
			.attr('fill', 'black')
			.attr('font-size', '10px')
			.text((d) => d.id);
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
