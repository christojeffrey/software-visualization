import * as d3 from 'd3';
import { innerTicked, linkTicked, masterSimulationTicked } from './tick';
import { dragEndedNode, dragStartedNode, draggedNode } from './drag-handler';

const SVGSIZE = 800;
const SVGMARGIN = 50;
// const MINIMUMNODESIZE = 10;

function createInnerSimulation(nodes: any, canvas: any, allSimulation: any, parentNode: any) {
	// use this instead of forEach so that it is passed by reference.

	// bind for easy reference.
	for (let i = 0; i < nodes.length; i++) {
		nodes[i].parent = parentNode;
	}

	const innerSimulation = d3.forceSimulation(nodes);
	innerSimulation.force('charge', d3.forceManyBody().strength(-30));
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
		.attr('width', 5)
		.attr('height', 5)
		.style('fill', 'green')
		.attr('fill-opacity', '0.2');

	innerSimulation.on('tick', () => {
		innerTicked(membersContainerElement, memberElements);
	});

	// recursive inner simulation.
	for (let i = 0; i < nodes.length; i++) {
		if (nodes[i].members) {
			createInnerSimulation(nodes[i].members, canvas, allSimulation, nodes[i]);
		}
	}
}

export function draw(svgElement: any, graphData: any, _drawSettings: any) {
	console.log('draw');
	const simulations: any = [];

	const svg = d3
		.select(svgElement)
		.attr('width', SVGSIZE + SVGMARGIN * 2)
		.attr('height', SVGSIZE + SVGMARGIN * 2);

	const simulation = d3.forceSimulation(graphData.nodes);
	simulation.force('charge', d3.forceManyBody().strength(-300));
	simulation.force('center', d3.forceCenter(SVGSIZE / 2, SVGSIZE / 2));
	simulation.on('tick', () => {
		masterSimulationTicked(graphData, containerElement, nodeElements);
	});

	simulations.push(simulation);

	const canvas = svg.append('g');

	const containerElement = canvas
		.append('g')
		.selectAll('g')
		.data(graphData.nodes)
		.enter()
		.append('g')
		.attr('class', 'nodes')
		.attr('id', (d: any) => d.id);

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
		.attr('width', 10)
		.attr('height', 10)
		.attr('fill', 'red')
		.attr('fill-opacity', '0.1');

	// link
	const linkElements = canvas
		.selectAll('line.link')
		.data(graphData.links)
		.enter()
		.append('line')
		.style('stroke', 'blue')
		.attr('class', 'link');
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
			linkTicked(linkElements);
		});
	simulations.push(linkSimulation);
	// create inner simulation.
	for (let i = 0; i < graphData.nodes.length; i++) {
		if (graphData.nodes[i].members) {
			createInnerSimulation(graphData.nodes[i].members, canvas, simulations, graphData.nodes[i]);
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
			})
	);
	return {
		simulations,
		svgElement
	};
}
