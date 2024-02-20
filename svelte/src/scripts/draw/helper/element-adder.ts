import * as d3 from 'd3';

import type { DrawSettingsInterface, GraphDataEdge, GraphDataNode } from '$types';
import { toHTMLToken } from '$helper';
import { dragEndedNode, dragStartedNode, draggedNode } from './drag-handler';

export function addNodeContainerElements(
	parent: d3.Selection<SVGGElement, unknown, null, undefined>,
	graphDataNodes: GraphDataNode[],
	allSimulation: d3.Simulation<GraphDataNode, undefined>[]
) {
	// add node container and drag handler
	const temp = parent
		.selectAll('g')
		.data(graphDataNodes)
		.enter()
		.append('g')
		.attr('class', 'nodes')
		.attr('id', (d) => toHTMLToken(d.id));
	temp.call(
		d3
			.drag<SVGGElement, GraphDataNode>()
			.on('start', function (this: SVGGElement, e) {
				// To combine element drag and pan
				d3.select(this).raise();
				dragStartedNode(e, allSimulation);
			})
			.on('drag', (d) => {
				draggedNode(d, allSimulation);
			})
			.on('end', (d) => {
				dragEndedNode(d, allSimulation);
			})
	);
	return temp;
}

export function addNodeLabelElements(
	nodeContainer: d3.Selection<SVGGElement, GraphDataNode, SVGGElement, unknown>
) {
	return nodeContainer
		.append('text')
		.attr('class', 'node-label')
		.attr('text-anchor', 'middle')
		.attr('dominant-baseline', 'middle')
		.attr('fill', 'black')
		.attr('font-size', '10px')
		.text((d) => d.id);
}

export function addNodeElements(
	nodeContainerElements: d3.Selection<SVGGElement, GraphDataNode, SVGGElement, unknown>,
	drawSettings: DrawSettingsInterface,
	level: number
) {
	return nodeContainerElements
		.append('rect')
		.attr('x', 0)
		.attr('y', 0)
		.attr('width', drawSettings.minimumNodeSize)
		.attr('height', drawSettings.minimumNodeSize)
		.attr('fill', drawSettings.nodeColors[level] ?? drawSettings.nodeDefaultColor)
		.attr('fill-opacity', '0.1')
		.attr('rx', drawSettings.nodeCornerRadius);
}

export function addCollapseNodeButtonElements(
	nodeContainerElements: d3.Selection<SVGGElement, GraphDataNode, SVGGElement, unknown>,
	drawSettings: DrawSettingsInterface,
	onCollapse: (i: GraphDataNode) => void
) {
	return nodeContainerElements
		.filter((d) => {
			return (d.members?.length ?? 0) > 0 || (d.originalMembers?.length ?? 0) > 0;
		}) // filter only if has member
		.append('circle')
		.attr('r', drawSettings.buttonRadius)
		.attr('cx', 0)
		.attr('cy', 0)
		.attr('fill', 'red')
		.attr('fill-opacity', '0.1')
		.on('click', (_e, i) => {
			onCollapse(i);
		});
}

export function addLiftEdgeButtonElements(
	nodeContainerElements: d3.Selection<SVGGElement, GraphDataNode, SVGGElement, unknown>,
	drawSettings: DrawSettingsInterface,
	onLift: (i: GraphDataNode) => void
) {
	return nodeContainerElements
		.filter((d) => {
			return (d.members?.length ?? 0) > 0 || (d.originalMembers?.length ?? 0) > 0;
		}) // filter only if has member
		.append('circle')
		.attr('r', drawSettings.buttonRadius)
		.attr('cx', drawSettings.buttonRadius)
		.attr('cy', 0)
		.attr('fill', 'blue')
		.attr('fill-opacity', '0.1')
		.on('click', (_e, i) => {
			onLift(i);
		});
}

export function addLinkContainerElements(
	canvas: d3.Selection<SVGGElement, unknown, null, undefined>,
	graphDataLinks: GraphDataEdge[],
	drawSettings: DrawSettingsInterface
) {
	return canvas
		.append('g')
		.attr('id', 'link-canvas')
		.selectAll('g')
		.data(graphDataLinks.filter((link) => drawSettings.shownEdgesType.get(link.type)))
		.enter()
		.append('g')
		.attr('class', 'links')
		.attr('id', (d) => d.id);
}

export function addLinkElements(
	linkContainerElements: d3.Selection<SVGGElement, GraphDataEdge, SVGGElement, unknown>
) {
	return linkContainerElements.append('path').attr('class', 'link');
}

export function addLinkLabelElements(
	linkContainerElements: d3.Selection<SVGGElement, GraphDataEdge, SVGGElement, unknown>
) {
	return linkContainerElements
		.append('text')
		.attr('class', 'link-label')
		.attr('text-anchor', 'middle')
		.attr('dominant-baseline', 'middle')
		.attr('fill', 'black')
		.attr('font-size', '10px')
		.text((d) => d.id);
}
