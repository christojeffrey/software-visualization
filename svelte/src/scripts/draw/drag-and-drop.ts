import * as d3 from 'd3';
import {clamp, notNaN, toHTMLToken} from '$helper';
import type {
	DrawSettingsInterface,
	GraphDataEdge,
	GraphDataNode,
	SimpleNodesDictionaryType,
} from '$types';
import {renderLinks} from './link-render';
import {updateNodePosition} from './nodes-render';

export function addDragAndDrop(
	links: GraphDataEdge[],
	nodes: GraphDataNode[],
	nodesDictionary: SimpleNodesDictionaryType,
	svgElement: Element,
	linkCanvas: d3.Selection<SVGGElement, unknown, null, undefined>,
	drawSettings: DrawSettingsInterface,
) {
	if (nodes.length === 0) return;

	const container = d3.select(svgElement).selectAll(':scope > g.nodes');

	container.call(
		d3
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			.drag<any, any>()
			.on('drag', (e,d) => {
				// Typing
				const source = e.sourceEvent as MouseEvent;
				const node = e.subject as GraphDataNode;

				// Calculate node movement, keeping the transformation (specifically the scaling) in mind.
				const deltaX = source.movementX * (1 / ((drawSettings.transformation?.k ?? 1) * (d.level + 1)));
				const deltaY = source.movementY * (1 / ((drawSettings.transformation?.k ?? 1) * (d.level + 1)));
				const xt = node.x! + deltaX;
				const yt = node.y! + deltaY;

				// For now, we are not going to resize or move the parent node
				// Hence, the coordinates should be clamped to a range
				if (node.parent) {
					// Increase parent size and move it if it's starting to move outside the boundary
					node.parent.x! = notNaN(node.parent.x! + deltaX);
					node.parent.y! = notNaN(node.parent.y! + deltaY);
					node.x = clamp(
						xt,
						-0.5 * node.parent.width! + 0.5 * node.width!,
						+0.5 * node.parent.width! - 0.5 * node.width!,
					);
					node.y = clamp(
						yt,
						-0.5 * node.parent.height! + 0.5 * node.height!,
						+0.5 * node.parent.height! - 0.5 * node.height!,
					);
				} else {
					node.x = notNaN(xt);
					node.y = notNaN(yt);
				}
				// Rerender nodes
				updateNodePosition(node, deltaX, deltaY);

				renderLinks(links, nodesDictionary, linkCanvas, drawSettings);
			}),
	);

	nodes.forEach(node => {
		const element = document.getElementById(`group-${toHTMLToken(node.id)}`)!;
		addDragAndDrop(links, node.members, nodesDictionary, element, linkCanvas, drawSettings);
	});
}
