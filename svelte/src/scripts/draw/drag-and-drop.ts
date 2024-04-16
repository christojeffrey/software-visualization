import * as d3 from 'd3';
import { clamp, notNaN, toHTMLToken } from '$helper';
import type {
	DrawSettingsInterface, GraphDataEdge,
	GraphDataNode,
	SimpleNodesDictionaryType
} from '$types';
import { renderLinks } from './link-render';
import { updateNodePosition } from './nodes-render';

export function addDragAndDrop(
	nodes: GraphDataNode[],
	nodesDictionary: SimpleNodesDictionaryType,
	svgElement: Element,
	linkCanvas: d3.Selection<SVGGElement, unknown, null, undefined>,
	drawSettings: DrawSettingsInterface
) {
	if (nodes.length === 0) return;

	const container = d3.select(svgElement)
		.selectAll(':scope > g.nodes');

	container.call(
		d3
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			.drag<any, any>()
			.on('drag', (e) => {
				// Typing
				const source = e.sourceEvent as MouseEvent;
				const node = e.subject as GraphDataNode;

				// Calculate node movement, keeping the transformation (specifically the scaling) in mind.
				const dx = source.movementX * (1 / (drawSettings.transformation?.k ?? 1));
				const dy = source.movementY * (1 / (drawSettings.transformation?.k ?? 1))
				const newX = node.x! + dx;
				const newY = node.y! + dy
				
				if (node.parent) {
					if (newX > -0.5 * node.parent.width! + 0.5 * node.width!) {
						if (newX < 0.5 * node.parent.width! - 0.5 * node.width!) {
							node.x = newX;
							updateNodePosition(node, svgElement);
						} else {
							//node.x = newX;
							node.parent.width! += 2*dx;
							node.parent.x! += 2*dx;
							updateNodePosition(node.parent, svgElement.parentElement!);
							node.parent.members.forEach(n => {
								n.x! -= dx;
								updateNodePosition(n, svgElement.parentElement!);
							})
						}
					}

					node.y = clamp(
						newY,
						-0.5 * node.parent.height! + 0.5 * node.height!,
						+0.5 * node.parent.height! - 0.5 * node.height!
					);
				} else {
					node.x = notNaN(newX);
					node.y = notNaN(newY);
					updateNodePosition(node, svgElement);
				}

				// Rerender nodes
				//updateNodePosition(node, svgElement);

				// Need to find all relevant links to rerender them.
				// TODO it might be faster to just rerender every link globally.
				const links = new Set<GraphDataEdge>();
				const rec = (nodes: GraphDataNode[]) => {
					nodes.forEach(n => {
						[...n.incomingLinks, ...n.outgoingLinks].forEach(l => links.add(l));
						rec(n.members);
					});
				};
				rec(nodes);

				renderLinks([...links], nodesDictionary, linkCanvas, drawSettings);
			})
	);

	nodes.forEach(node => {
		const element = document.getElementById(`group-${toHTMLToken(node.id)}`)!;
		addDragAndDrop(node.members, nodesDictionary, element, linkCanvas, drawSettings);
	});
}
