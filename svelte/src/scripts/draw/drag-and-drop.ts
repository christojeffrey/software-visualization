import * as d3 from 'd3';
import {clamp, notNaN, toHTMLToken} from '$helper';
import type {
	DrawSettingsInterface,
	GraphData,
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
	graphData: GraphData,
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
				// if (node.parent) {
				// 	node.x = clamp(
				// 		xt,
				// 		-0.5 * node.parent.width! + 0.5 * node.width!,
				// 		+0.5 * node.parent.width! - 0.5 * node.width!,
				// 	);
				// 	node.y = clamp(
				// 		yt,
				// 		-0.5 * node.parent.height! + 0.5 * node.height!,
				// 		+0.5 * node.parent.height! - 0.5 * node.height!,
				// 	);
				// } else {
				node.x = notNaN(xt);
				node.y = notNaN(yt);

				calculateWidthHeighXandYBasedOnChildrenRecursive(graphData.nodes, drawSettings);

				// update all nodes
				graphData.flattenNodes.forEach(n => {
					updateNodePosition(n, svgElement);

					// console.log(n.id);
				});

				// Rerender nodes
				// updateNodePosition(node, svgElement);

				renderLinks(links, nodesDictionary, linkCanvas, drawSettings);
			}),
	);

	nodes.forEach(node => {
		const element = document.getElementById(`group-${toHTMLToken(node.id)}`)!;
		addDragAndDrop(
			links,
			node.members,
			nodesDictionary,
			element,
			linkCanvas,
			drawSettings,
			graphData,
		);
	});
}

export function upcateMembersPosistion(
	nodes: GraphDataNode[] | undefined,
	shifterX: number,
	shifterY: number,
) {
	if (nodes && nodes.length > 0) {
		for (let i = 0; i < nodes.length; i++) {
			nodes[i].x = (nodes[i].x ?? 0) + shifterX;
			nodes[i].y = (nodes[i].y ?? 0) + shifterY;
		}
	}
}
export function calculateMembersBarier(members: GraphDataNode[]) {
	// members location is relative to the parent.
	let minX = members[0].x ?? 0;
	let maxX = (members[0].x ?? 0) + (members[0].width ?? 0);
	let minY = members[0].y ?? 0;
	let maxY = (members[0].y ?? 0) + (members[0].height ?? 0);

	for (let j = 0; j < members.length; j++) {
		const memberJX = members[j].x ?? 0;
		const memberJY = members[j].y ?? 0;
		const memberJWidth = members[j].width ?? 0;
		const memberJHeight = members[j].height ?? 0;
		if (memberJX < minX) {
			minX = memberJX;
		}
		if (memberJX + memberJWidth > maxX) {
			maxX = memberJX + memberJWidth;
		}
		if (memberJY < minY) {
			minY = memberJY;
		}
		if (memberJY + memberJHeight > maxY) {
			maxY = memberJY + memberJHeight;
		}
	}

	return {minX, maxX, minY, maxY};
}
export function calculateWidthHeighXandYBasedOnChildrenRecursive(
	topMostNodes: GraphDataNode[],
	drawSettings: DrawSettingsInterface,
) {
	const padding = drawSettings.nodePadding + 2 * drawSettings.buttonRadius;

	for (let i = 0; i < topMostNodes.length; i++) {
		const hasMembers = (topMostNodes[i].members ?? []).length > 0;
		if (hasMembers) {
			const members = topMostNodes[i].members ?? [];

			// calculate children position based on its children. its recursive.
			calculateWidthHeighXandYBasedOnChildrenRecursive(members, drawSettings);
			const {minX, maxX, minY, maxY} = calculateMembersBarier(members);
			topMostNodes[i].width = maxX - minX + 2 * padding;
			topMostNodes[i].height = maxY - minY + 2 * padding;

			// move the left wall of the node to be exactly on the minimum node member
			const shifterX = minX - padding + (topMostNodes[i].width ?? 0) / 4;
			const shifterY = minY - padding + (topMostNodes[i].height ?? 0) / 4;
			topMostNodes[i].x = (topMostNodes[i].x ?? 0) + shifterX;
			topMostNodes[i].y = (topMostNodes[i].y ?? 0) + shifterY;
			// update childrens position based on the new parent position
			upcateMembersPosistion(members, -shifterX, -shifterY);
		} else {
			topMostNodes[i].width = drawSettings.minimumNodeSize;
			topMostNodes[i].height = drawSettings.minimumNodeSize;
		}
	}
}
