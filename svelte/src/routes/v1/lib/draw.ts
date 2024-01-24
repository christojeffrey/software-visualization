import * as d3 from 'd3';

import { dragEndedGroup, dragStartedGroup, draggedGroup, tick } from '.';
import { SVGSIZE, SVGMARGIN, LINK_COLOR_MAP } from './constants';
import type { ConfigType, GraphDataType, GraphElementsType } from './types';
import { linkStrokeValue } from './style-injector';
import { dragEndedNode, dragStartedNode, draggedNode } from '.';

export function draw(config: ConfigType, svgElement: any, graphData: GraphDataType, doRedraw: any) {
	const svg = d3
		.select(svgElement)
		.attr('width', SVGSIZE + SVGMARGIN * 2)
		.attr('height', SVGSIZE + SVGMARGIN * 2);

	const graphElements: GraphElementsType = {
		nodes: null,
		nodeLabels: null,
		links: null,
		linkLabels: null,
		groups: null,
		groupButtons: null
	};

	let simulation = d3.forceSimulation(graphData.nodes);
	simulation.force(
		'link',
		d3
			.forceLink(graphData.links)
			.id((d: any) => {
				// console.log(d);
				return d.id;
			})
			.strength(0.1)
	);
	simulation.force('charge', d3.forceManyBody().strength(-300));
	simulation.force('x', d3.forceX((SVGSIZE + SVGMARGIN * 2) / 2));
	simulation.force('y', d3.forceY((SVGSIZE + SVGMARGIN * 2) / 2));

	if (config.isGrouped) {
		graphElements.groups = svg
			.selectAll('rect.group-container')
			.data(graphData.groups)
			.enter()
			.append('rect')
			.attr('x', 5)
			.attr('y', 5)
			.attr('width', 100)
			.attr('height', 100)
			.attr('fill-opacity', config.isGrouped ? 0.7 : 0)
			.attr('class', 'group-container')
			.style('fill', (d: any) => d.color);

		// bind members to group
		for (let i = 0; i < graphData.groups.length; i++) {
			const members: any[] = [];
			graphData.groups[i].leaves.forEach((id: any) => {
				// find the node in the nodeData array
				const node = graphData.nodes.find((node: any) => node.id === id);
				members.push(node);
			});
			graphData.groups[i].members = members;
		}
		// bind group button to group
		const buttons: any[] = [];
		for (let i = 0; i < graphData.groups.length; i++) {
			buttons.push({ x: 0, y: 0, id: graphData.groups[i].id });
		}
		graphData.groupButtons = buttons;

		graphElements.groupButtons = svg
			.selectAll('circle.group-button')
			.data(graphData.groupButtons)
			.enter()
			.append('circle')
			.attr('r', 10)
			.attr('class', 'group-button')
			.style('fill', 'black')
			.on('click', (_event: any, data: any) => {
				// console.log('click');
				// console.log(data);
				config.collapsedGroups.push(data.id);
				doRedraw();
			});

		for (let i = 0; i < graphData.groups.length; i++) {
			graphData.groups[i].button = graphData.groupButtons[i];
		}

		// add fake link between node in same group
		graphData.groupLinks = [];
		for (let i = 0; i < graphData.groups.length; i++) {
			for (let j = 0; j < graphData.groups[i].leaves.length; j++) {
				for (let k = j + 1; k < graphData.groups[i].leaves.length; k++) {
					graphData.groupLinks.push({
						source: graphData.groups[i].leaves[j],
						target: graphData.groups[i].leaves[k]
					});
				}
			}
		}
		// turn on force
		simulation = simulation.force(
			'groupLink',
			d3
				.forceLink(graphData.groupLinks)
				.id((d: any) => d.id)
				.strength(0.01)
		);
		// change oppacity of group svg
		const t = d3.transition().duration(100).ease(d3.easeLinear);
		graphElements.groups.transition(t).attr('fill-opacity', 0.7);
		graphElements.groups.call(
			d3
				.drag<any, any>()
				.on('start', (e) => dragStartedGroup(e, simulation))
				.on('drag', (e) => draggedGroup(e, simulation))
				.on('end', (e) => dragEndedGroup(e, simulation, config))
		);
	}

	graphElements.nodes = svg
		.selectAll('circle.node')
		.data(graphData.nodes)
		.enter()
		.append('circle')
		.attr('r', (d: any) => d.size ?? 5)
		.style('fill', (d: any) => (d.isCollapsedGroup ? 'black' : 'red'))
		.attr('class', 'node')
		.on('click', (_event: any, data: any) => {
			console.log('click');
			console.log(data);
			if (data.isCollapsedGroup) {
				// uncollapse
				config.collapsedGroups = config.collapsedGroups.filter((id: string) => id !== data.id);
				doRedraw();
			}
		});

	graphElements.links = svg
		.selectAll('line.link')
		.data(graphData.links)
		.enter()
		.append('line')
		.style('stroke', (d: any) => linkStrokeValue(d, LINK_COLOR_MAP))
		.attr('class', 'link');

	if (config.isForceSimulationEnabled) {
		simulation.alpha(0.7).restart();
	} else {
		simulation.alpha(0).restart();
	}
	// add text
	if (config.showNodeLabels) {
		graphElements.nodeLabels = svg
			.selectAll('text.node-label')
			.data(graphData.nodes)
			.enter()
			.append('text')
			.text((d: any) => d.id)
			.attr('x', 6)
			.attr('y', 3)
			.attr('class', 'node-label');
	}
	if (config.showLinkLabels) {
		graphElements.linkLabels = svg
			.selectAll('text.link-label')
			.data(graphData.links)
			.enter()
			.append('text')
			.text((d: any) => d.source.id + '->' + d.target.id)
			.attr('class', 'link-label');
	}

	simulation.on('tick', () => {
		tick(config, graphData, graphElements);
	});

	// add canvas interactivity
	graphElements.nodes.call(
		d3
			.drag<any, any>()
			.on('start', function (this: any, e) {
				// To combine element drag and pan
				d3.select(this).raise();
				dragStartedNode(e, simulation);
			})
			.on('drag', (e) => draggedNode(e, simulation))
			.on('end', (e) => dragEndedNode(e, simulation, config))
	);

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
				const elements = Object.keys(graphElements);
				elements.forEach((e: string) =>
					graphElements[e as keyof GraphElementsType]?.attr('transform', transform)
				);
			})
	);

	return {
		simulation,
		svgElement
	};
}
