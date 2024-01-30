import * as d3 from 'd3';
import { innerTicked, linkTicked, masterSimulationTicked } from './tick';
import { dragEndedNode, dragStartedNode, draggedNode } from './drag-handler';
import { setupGradient } from './gradient-setup';
import type { ConfigInterface, DrawSettingsInterface } from '../../types';

const SVGSIZE = 800;
const SVGMARGIN = 50;

function toHTMLToken(string: string) {
	return string.replace(/[^A-Za-z0-9]/g, '--');
}

function createInnerSimulation(
	nodes: any,
	canvas: d3.Selection<SVGGElement, unknown, null, undefined>,
	allSimulation: d3.Simulation<d3.SimulationNodeDatum, undefined>[],
	parentNode: any,
	config: ConfigInterface,
	drawSettings: DrawSettingsInterface,
	onCollapse: (datum: any) => void,
	onLift: (datum: any) => void,
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

	const parentElement = canvas.select(`#${toHTMLToken(parentNode.id)}`).append('g');

	const membersContainerElement = parentElement
		.selectAll('g')
		.data(nodes)
		.enter()
		.append('g')
		.attr('class', 'node')
		.attr('id', (d: any) => toHTMLToken(d.id));

	membersContainerElement.call(
		 // @ts-ignore
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
		.style('fill', 'green')
		.attr('fill-opacity', '0.2');

	const collapseButton = membersContainerElement
		.append('circle')
		.attr('r', (d: any) => (d?.members?.length > 1 ? drawSettings.minimumVertexSize / 2 : 0))
		.attr('cx', 0)
		.attr('cy', 0)
		.attr('fill', 'red')
		.attr('fill-opacity', '0.1')
		.on('click', (_e, i) => {
			onCollapse(i);
		});

	const liftButton = membersContainerElement
		.append('circle')
		.attr('r', (d: any) => (d?.members?.length > 1 ? drawSettings.minimumVertexSize / 2 : 0))
		.attr('cx', drawSettings.minimumVertexSize)
		.attr('cy', 0)
		.attr('fill', ({id}: any) => {
			if(config.dependencyLifting.find(({node}) => node.id === id)) {
				return 'aqua';
			}
			return 'blue';
		})
		.attr('fill-opacity', '0.1')
		.on('click', (_e, i) => {
			onLift(i);
		});

	innerSimulation.on('tick', () => {
		innerTicked(membersContainerElement, memberElements);
	});

	// recursive inner simulation.
	for (let i = 0; i < nodes.length; i++) {
		if (nodes[i].members) {
			createInnerSimulation(nodes[i].members, canvas, allSimulation, nodes[i], config, drawSettings, onLift, onCollapse);
		}
	}
}

export function draw(
	svgElement: SVGElement,
	graphData: any,
	config: ConfigInterface,
	drawSettings: DrawSettingsInterface,
	onCollapse: (datum: any) => void,
	onLift: (datum: any) => void,
) {
	const simulations: d3.Simulation<d3.SimulationNodeDatum, undefined>[] = [];

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
		masterSimulationTicked(graphData, containerElement, nodeElements, drawSettings);
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
		.attr('id', (d: any) => toHTMLToken(d.id));


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
		.attr('fill', 'red')
		.attr('fill-opacity', '0.1');

	const collapseButton = containerElement
		.append('circle')
		.attr('r', drawSettings.minimumVertexSize / 2)
		.attr('cx', 0)
		.attr('cy', 0)
		.attr('fill', 'red')
		.attr('fill-opacity', '0.1')
		.on('click', (_e, i) => {
			onCollapse(i);
		});

	const liftButton = containerElement
		.append('circle')
		.attr('r', drawSettings.minimumVertexSize / 2)
		.attr('cx', drawSettings.minimumVertexSize)
		.attr('cy', 0)
		.attr('fill', ({id}: any) => {
			if(config.dependencyLifting.find(({node}) => node.id === id)) {
				return 'aqua';
			}
			return 'blue';
		})
		.attr('fill-opacity', '0.1')
		.on('click', (_e, i) => {
			onLift(i);
		});

	// link
	const linkElements = canvas
		.selectAll('line.link')
		.data(graphData.links.filter((link: any) => drawSettings.shownEdgesType.get(link.type)))
		.enter()
		.append('line')
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
			createInnerSimulation(
				graphData.nodes[i].members,
				canvas,
				simulations,
				graphData.nodes[i],
				config,
				drawSettings,
				onLift,
				onCollapse,
			);
		}
	}

	// Add zoom handler
	svg.call(
		// @ts-ignore
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

	//Reload last transformation, if avaidable
	if (drawSettings.transformation) {
		// (The type of this method is incorrect, annoyingly)
		canvas.attr('transform', drawSettings.transformation as any)
	}

	simulations.forEach((sim) => {
		console.log({sim, nodes: sim.nodes()})
	})


	return {
		simulations,
		svgElement,
	};
}
