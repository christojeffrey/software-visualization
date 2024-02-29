import type { DrawSettingsInterface, GraphData, GraphDataEdge, GraphDataNode } from '$types';

export function innerTicked(
	drawSettings: DrawSettingsInterface,
	membersContainerElement: d3.Selection<SVGGElement, GraphDataNode, SVGGElement, unknown>,
	memberElements: d3.Selection<SVGRectElement, GraphDataNode, SVGGElement, unknown>,
	nodeLabelsElements: d3.Selection<SVGTextElement, GraphDataNode, SVGGElement, unknown>,
	collapseButtonElements: d3.Selection<SVGCircleElement, GraphDataNode, SVGGElement, unknown>,
	liftButtonElements: d3.Selection<SVGCircleElement, GraphDataNode, SVGGElement, unknown>
) {
	membersContainerElement.attr('transform', (d) => `translate(${d.x},${d.y})`);
	memberElements.attr('width', (d) => d.width).attr('height', (d) => d.height);
	if (nodeLabelsElements) {
		// put it in the top middle
		nodeLabelsElements.attr('x', (d) => d.width / 2).attr('y', (d) => 5);
	}
	if (collapseButtonElements) {
		collapseButtonElements
			.attr('cx', (d) => d.width - 4 * drawSettings.buttonRadius)
			.attr('cy', (d) => drawSettings.nodePadding + drawSettings.buttonRadius);
	}
	if (liftButtonElements) {
		liftButtonElements
			.attr('cx', (d) => d.width - 1.5 * drawSettings.buttonRadius)
			.attr('cy', (d) => drawSettings.nodePadding + drawSettings.buttonRadius);
	}
}
export function linkTicked(
	edges: GraphDataEdge[],
	linkElements: d3.Selection<SVGPathElement, GraphDataEdge, SVGGElement, unknown>,
	linkLabelElements: d3.Selection<SVGTextElement, GraphDataEdge, SVGGElement, unknown>
) {
	// calculate all the link labels location.
	const allResult: {
		[id: string]: {
			x1: number;
			y1: number;
			x2: number;
			y2: number;
		};
	} = {};
	edges.forEach((d) => {
		// callculate once here change to global coordinates.
		// calculate new source
		const newLocation = {
			x1: d.source.x ?? 0,
			y1: d.source.y ?? 0,
			x2: d.target.x ?? 0,
			y2: d.target.y ?? 0
		};

		let source = d.source;
		while (source.parent) {
			newLocation.x1 += source.parent.x ?? 0;
			newLocation.y1 += source.parent.y ?? 0;
			source = source.parent;
		}
		// calculate new target
		let target = d.target;
		while (target.parent) {
			newLocation.x2 += target.parent.x ?? 0;
			newLocation.y2 += target.parent.y ?? 0;
			target = target.parent;
		}

		allResult[d.id] = newLocation;
	});

	linkElements.attr('d', function (this: SVGPathElement, d: GraphDataEdge) {
		// Apply gradient here since it is most efficient as it doesn't require recomputation
		// TODO: Add stroke width based on weight (don't forget to recalculate on lift)
		// Currently, lifting and collapse handle link differently, I think we need to pass the convertedData as a reference
		if (allResult[d.id].x2 > allResult[d.id].x1) this.style.stroke = `url(#${d.type}Gradient)`;
		else this.style.stroke = `url(#${d.type}GradientReversed)`;
		this.style.strokeWidth = Math.round(Math.log(d.weight * 10)).toString();
		return `M${
			allResult[d.id].x1
		},${allResult[d.id].y1} L${allResult[d.id].x2},${allResult[d.id].y2}`;
	});

	if (linkLabelElements) {
		linkLabelElements
			.attr('x', (d) => {
				const x1 = allResult[d.id].x1;
				const x2 = allResult[d.id].x2;
				return (x1 + x2) / 2;
			})
			.attr('y', (d) => {
				const y1 = allResult[d.id].y1;
				const y2 = allResult[d.id].y2;
				return (y1 + y2) / 2;
			});
	}
}
export function masterSimulationTicked(
	graphData: GraphData,
	containerElement: d3.Selection<SVGGElement, GraphDataNode, SVGGElement, unknown>,
	nodeElements: d3.Selection<SVGRectElement, GraphDataNode, SVGGElement, unknown>,
	drawSettings: DrawSettingsInterface,
	nodeLabelsElements: d3.Selection<SVGTextElement, GraphDataNode, SVGGElement, unknown>,
	collapseButtonElements: d3.Selection<SVGCircleElement, GraphDataNode, SVGGElement, unknown>,
	liftButtonElements: d3.Selection<SVGCircleElement, GraphDataNode, SVGGElement, unknown>
) {
	// add delay to the simulation

	const padding = drawSettings.nodePadding + 2 * drawSettings.buttonRadius;

	// calculate nodes width and height, x and y (which is cx and cy) - based on the location of the its members.
	// only do this calculation once, on master simulation
	calculateWidthHeighXandYBasedOnChildrenRecursive(graphData.nodes, padding, drawSettings);

	containerElement.attr('transform', (d) => {
		return `translate(${d.x},${d.y})`;
	});
	nodeElements.attr('width', (d) => d.width).attr('height', (d) => d.height);

	if (nodeLabelsElements) {
		// put it in the top middle
		nodeLabelsElements.attr('x', (d) => d.width / 2).attr('y', (d) => drawSettings.nodePadding);
	}

	if (collapseButtonElements) {
		collapseButtonElements
			.attr('cx', (d) => d.width - 4 * drawSettings.buttonRadius) // I think cx here stands for circle x
			.attr('cy', (d) => drawSettings.nodePadding + drawSettings.buttonRadius);
	}
	if (liftButtonElements) {
		liftButtonElements
			.attr('cx', (d) => d.width - 1.5 * drawSettings.buttonRadius)
			.attr('cy', (d) => drawSettings.nodePadding + drawSettings.buttonRadius);
	}
}

function upcateMembersPosistion(
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

function calculateWidthHeighXandYBasedOnChildrenRecursive(
	topMostNodes: GraphDataNode[],
	padding: number,
	drawSettings: DrawSettingsInterface
) {
	for (let i = 0; i < topMostNodes.length; i++) {
		const hasMembers = (topMostNodes[i].members ?? []).length > 0;
		if (hasMembers) {
			const members = topMostNodes[i].members ?? [];

			// calculate children position based on its children. its recursive.
			calculateWidthHeighXandYBasedOnChildrenRecursive(members, padding, drawSettings);
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

			topMostNodes[i].width = maxX - minX + padding * 2;
			topMostNodes[i].height = maxY - minY + padding * 2;

			topMostNodes[i].x += minX;
			topMostNodes[i].y += minY;

			// update childrens position based on the new parent position
			upcateMembersPosistion(members, -minX, -minY);
		} else {
			topMostNodes[i].width = drawSettings.minimumNodeSize;
			topMostNodes[i].height = drawSettings.minimumNodeSize;
		}
	}
}
