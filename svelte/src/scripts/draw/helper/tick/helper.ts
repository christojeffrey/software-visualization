import type { DrawSettingsInterface, GraphData, GraphDataEdge, GraphDataNode } from '$types';

export function updateLocationNode(
	containerElement: d3.Selection<SVGGElement, GraphDataNode, SVGGElement, unknown>,
	nodeElements: d3.Selection<SVGRectElement, GraphDataNode, SVGGElement, unknown>
) {
	containerElement.attr('transform', (d) => `translate(${d.x},${d.y})`);
	nodeElements.attr('width', (d) => d.width).attr('height', (d) => d.height);
}

export function updateLocationNodeButtonsAndLabels(
	drawSettings: DrawSettingsInterface,
	collapseButtonElements: d3.Selection<SVGCircleElement, GraphDataNode, SVGGElement, unknown>,
	liftButtonElements: d3.Selection<SVGCircleElement, GraphDataNode, SVGGElement, unknown>,
	nodeLabelsElements: d3.Selection<SVGTextElement, GraphDataNode, SVGGElement, unknown>
) {
	if (nodeLabelsElements) {
		// put it in the top middle
		nodeLabelsElements.attr('x', (d) => d.width / 2).attr('y', (d) => drawSettings.textSize);
	}

	const buttonPadding = drawSettings.nodePadding / 2;

	// collapse button on the left
	if (collapseButtonElements) {
		collapseButtonElements
			.attr('cx', (d) => d.width - 3 * drawSettings.buttonRadius - 2 * buttonPadding) // I think cx here stands for circle x
			.attr('cy', (_d) => drawSettings.buttonRadius + buttonPadding);
	}

	// lift button on the right
	if (liftButtonElements) {
		liftButtonElements
			.attr('cx', (d) => d.width - 1 * drawSettings.buttonRadius - buttonPadding)
			.attr('cy', (_d) => drawSettings.buttonRadius + buttonPadding);
	}
}

export function upcateMembersPosistion(
	nodes: GraphDataNode[] | undefined,
	shifterX: number,
	shifterY: number
) {
	if (nodes && nodes.length > 0) {
		for (let i = 0; i < nodes.length; i++) {
			nodes[i].x = nodes[i].x + shifterX;
			nodes[i].y = nodes[i].y + shifterY;
		}
	}
}
export function calculateMembersBarier(members: GraphDataNode[]) {
	// members location is relative to the parent.
	let minX = members[0].x;
	let maxX = members[0].x + members[0].width;
	let minY = members[0].y;
	let maxY = members[0].y + members[0].height;

	for (let j = 0; j < members.length; j++) {
		if (members[j].x < minX) {
			minX = members[j].x;
		}
		if (members[j].x + members[j].width > maxX) {
			maxX = members[j].x + members[j].width;
		}
		if (members[j].y < minY) {
			minY = members[j].y;
		}
		if (members[j].y + members[j].height > maxY) {
			maxY = members[j].y + members[j].height;
		}
	}

	return { minX, maxX, minY, maxY };
}
export function calculateWidthHeighXandYBasedOnChildrenRecursive(
	topMostNodes: GraphDataNode[],
	drawSettings: DrawSettingsInterface
) {
	const padding = drawSettings.nodePadding + 2 * drawSettings.buttonRadius;

	for (let i = 0; i < topMostNodes.length; i++) {
		const hasMembers = (topMostNodes[i].members ?? []).length > 0;
		if (hasMembers) {
			const members = topMostNodes[i].members ?? [];

			// calculate children position based on its children. its recursive.
			calculateWidthHeighXandYBasedOnChildrenRecursive(members, drawSettings);
			const { minX, maxX, minY, maxY } = calculateMembersBarier(members);
			topMostNodes[i].width = maxX - minX + 2 * padding;
			topMostNodes[i].height = maxY - minY + 2 * padding;

			// move the left wall of the node to be exactly on the minimum node member
			const shifterX = minX - padding;
			const shifterY = minY - padding;
			topMostNodes[i].x += shifterX;
			topMostNodes[i].y += shifterY;

			// update childrens position based on the new parent position
			upcateMembersPosistion(members, -shifterX, -shifterY);
		} else {
			topMostNodes[i].width = drawSettings.minimumNodeSize;
			topMostNodes[i].height = drawSettings.minimumNodeSize;
		}
	}
}
