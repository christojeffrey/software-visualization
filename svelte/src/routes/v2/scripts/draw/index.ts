import * as d3 from 'd3';
import { innerTicked, linkTicked, masterSimulationTicked } from './tick';
import { dragEndedNode, dragStartedNode, draggedNode } from './drag-handler';
import { setupGradient } from './gradient-setup';
import type { ConfigInterface, DrawSettingsInterface } from '../../types';

const SVGSIZE = 800;
const SVGMARGIN = 50;

function createInnerSimulation(
	level: number,
	nodes: any,
	canvas: any,
	allSimulation: any,
	parentNode: any,
	drawSettings: DrawSettingsInterface
) {
	// use this instead of forEach so that it is passed by reference.

	// bind for easy reference.
	for (let i = 0; i < nodes.length; i++) {
		nodes[i].parent = parentNode;
	}

	const innerSimulation = d3.forceSimulation(nodes);
	innerSimulation.force('charge', d3.forceManyBody().strength(-300));
	innerSimulation.force('x', d3.forceX());
	innerSimulation.force('y', d3.forceY());

	allSimulation.push(innerSimulation);

	const parentElement = canvas.select(`#${parentNode.id}`).append('g');

	const membersContainerElement = parentElement
		.selectAll('g')
		.data(nodes)
		.enter()
		.append('g')
		.attr('class', 'node')
		.attr('id', (d: any) => d.id);

	// handle show node labels
	let memberLabelElements: any;
	if (drawSettings.showNodeLabels) {
		memberLabelElements = membersContainerElement
			.append('text')
			.attr('class', 'node-label')
			.attr('text-anchor', 'middle')
			.attr('dominant-baseline', 'middle')
			.attr('fill', 'black')
			.attr('font-size', '10px')
			.text((d: any) => d.id);
	}
	membersContainerElement.call(
		d3
			.drag()
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

	innerSimulation.on('tick', () => {
		innerTicked(membersContainerElement, memberElements, memberLabelElements);
	});

	// recursive inner simulation.
	for (let i = 0; i < nodes.length; i++) {
		if (nodes[i].members) {
			createInnerSimulation(
				level + 1,
				nodes[i].members,
				canvas,
				allSimulation,
				nodes[i],
				drawSettings
			);
		}
	}
}

export function draw(
	svgElement: any,
	graphData: any,
	config: ConfigInterface,
	drawSettings: DrawSettingsInterface,
	onCollapse: any,
	onLift: any
) {
	const simulations: any = [];

	const svg = d3
		.select(svgElement)
		.attr('width', SVGSIZE + SVGMARGIN * 2)
		.attr('height', SVGSIZE + SVGMARGIN * 2);

	setupGradient(svg);

	const simulation = d3.forceSimulation(graphData.nodes);
	simulation.force('charge', d3.forceManyBody().strength(-3000));
	simulation.force('x', d3.forceX(SVGSIZE / 2));
	simulation.force('y', d3.forceY(SVGSIZE / 2));
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
		.attr('id', (d: any) => d.id);

	// handle show node labels
	let nodeLabelsElements: any;
	if (drawSettings.showNodeLabels) {
		nodeLabelsElements = containerElement
			.append('text')
			.attr('class', 'node-label')
			.attr('text-anchor', 'middle')
			.attr('dominant-baseline', 'middle')
			.attr('fill', 'black')
			.attr('font-size', '10px')
			.text((d: any) => d.id);
	}

	containerElement.call(
		d3
			.drag<any, any>()
			.on('start', function (this: any, e) {
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
		.append('circle')
		.attr('r', drawSettings.buttonRadius)
		.attr('cx', drawSettings.buttonRadius)
		.attr('cy', 0)
		.attr('fill', ({ id }: any) => {
			if (config.dependencyLifting.find(({ nodeId }) => nodeId === id)) {
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
		.data(graphData.links.filter((link: any) => drawSettings.shownEdgesType.get(link.type)))
		.enter()
		.append('g')
		.attr('class', 'links')
		.attr('id', (d: any) => d.id);

	const linkElements = linkContainer.append('line').attr('class', 'link');

	// handle show edge labels
	let linkLabelElements: any;
	if (drawSettings.showEdgeLabels) {
		linkLabelElements = linkContainer
			.append('text')
			.attr('class', 'link-label')
			.attr('text-anchor', 'middle')
			.attr('dominant-baseline', 'middle')
			.attr('fill', 'black')
			.attr('font-size', '10px')
			.text((d: any) => d.id);
	}

	const linkSimulation = d3
		.forceSimulation(graphData.flattenNodes)
		.force(
			'link',
			d3
				.forceLink(graphData.links)
				.id((d: any) => {
					return d.id;
				})
				.strength(0)
		)
		.on('tick', () => {
			linkTicked(linkElements, linkLabelElements);
		});
	simulations.push(linkSimulation);

	// create inner simulation.
	for (let i = 0; i < graphData.nodes.length; i++) {
		if (graphData.nodes[i].members) {
			createInnerSimulation(
				1,
				graphData.nodes[i].members,
				canvas,
				simulations,
				graphData.nodes[i],
				drawSettings
			);
		}
	}

	// Add zoom handler
	svg.call(
		d3
			.zoom()
			.extent([
				[0, 0],
				[SVGSIZE + SVGMARGIN * 2, SVGSIZE + SVGMARGIN * 2]
			])
			.scaleExtent([1, 8])
			.on('zoom', ({ transform }) => {
				canvas.attr('transform', transform);
				drawSettings.transformation = transform;
			})
	);

	//Reload last transformation, if available
	if (drawSettings.transformation) {
		// (The type of this method is incorrect, annoyingly)
		canvas.attr('transform', drawSettings.transformation as any);
	}

	return {
		simulations,
		svgElement
	};
}
