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
	// canvas has id 'canvas'
	const canvasElement = document.getElementById('canvas')!;
	const canvas = d3.select(canvasElement);

	container.call(
		d3
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			.drag<any, any>()
			.on('drag', e => {
				// Typing
				const source = e.sourceEvent as MouseEvent;
				const node = e.subject as GraphDataNode;

				// Calculate node movement, keeping the transformation (specifically the scaling) in mind.
				const xt = node.x! + source.movementX * (1 / (drawSettings.transformation?.k ?? 1));
				const yt = node.y! + source.movementY * (1 / (drawSettings.transformation?.k ?? 1));
				if (drawSettings.isPanning) {
					// propagate the event to the zoom handler
					const newX = (drawSettings.transformation?.x ?? 0) + source.movementX;
					const newY = (drawSettings.transformation?.y ?? 0) + source.movementY;
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const newTransform: any = {
						k: drawSettings.transformation?.k || 1,
						x: newX,
						y: newY,
					};

					canvas.attr(
						'transform',
						'translate(' +
							newTransform.x +
							',' +
							newTransform.y +
							') scale(' +
							newTransform.k +
							')',
					);

					drawSettings.transformation = newTransform;

					return;
				}
				// For now, we are not going to resize or move the parent node
				// Hence, the coordinates should be clamped to a range
				if (node.parent) {
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
				updateNodePosition(node, svgElement);

				renderLinks(links, nodesDictionary, linkCanvas, drawSettings);
			}),
	);

	nodes.forEach(node => {
		const element = document.getElementById(`group-${toHTMLToken(node.id)}`)!;
		addDragAndDrop(links, node.members, nodesDictionary, element, linkCanvas, drawSettings);
	});
}
