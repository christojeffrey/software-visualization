import type { DrawSettingsInterface, GraphData, GraphDataEdge, GraphDataNode } from '../../types';

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
	memberElements.attr('x', (d) => d.cx).attr('y', (d) => d.cy);
	if (nodeLabelsElements) {
		// put it in the top middle
		nodeLabelsElements.attr('x', (d) => d.cx + d.width / 2).attr('y', (d) => d.cy + 5);
	}
	if (collapseButtonElements) {
		collapseButtonElements
			.attr('cx', (d) => d.cx + d.width - 4 * drawSettings.buttonRadius)
			.attr('cy', (d) => d.cy + drawSettings.nodePadding + drawSettings.buttonRadius);
	}
	if (liftButtonElements) {
		liftButtonElements
			.attr('cx', (d) => d.cx + d.width - 1.5 * drawSettings.buttonRadius)
			.attr('cy', (d) => d.cy + drawSettings.nodePadding + drawSettings.buttonRadius);
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
	const PADDING = drawSettings.nodePadding + 2 * drawSettings.buttonRadius;

	// calculate nodes width and height, x and y. only do this calculation once, on master simulation
	for (let i = 0; i < graphData.flattenNodes.length; i++) {
		const hasMembers = (graphData.flattenNodes[i].members ?? []).length > 0;
		if (hasMembers) {
			const members = graphData.flattenNodes[i].members ?? [];
			// members location is relative to the parent.
			let minX = members[0].x + members[0].cx;
			let maxX = members[0].x + members[0].cx + members[0].width;
			let minY = members[0].y + members[0].cy;
			let maxY = members[0].y + members[0].cy + members[0].height;

			for (let j = 0; j < members.length; j++) {
				if (members[j].x + members[j].cx < minX) {
					minX = members[j].x;
				}
				if (members[j].x + members[j].cx + members[j].width > maxX) {
					maxX = members[j].x + members[j].cx + members[j].width;
				}
				if (members[j].y + members[j].cy < minY) {
					minY = members[j].y + members[j].cy;
				}
				if (members[j].y + members[j].cy + members[j].height > maxY) {
					maxY = members[j].y + members[j].cy + members[j].height;
				}
			}

			graphData.flattenNodes[i].width = maxX - minX + PADDING * 2;
			graphData.flattenNodes[i].height = maxY - minY + PADDING * 2;
			// stands for calculated x and y.
			graphData.flattenNodes[i].cx = minX - PADDING;
			graphData.flattenNodes[i].cy = minY - PADDING;
		} else {
			graphData.flattenNodes[i].width = drawSettings.minimumVertexSize;
			graphData.flattenNodes[i].height = drawSettings.minimumVertexSize;
			//   stands for calculated x and y.
			graphData.flattenNodes[i].cx = 0;
			graphData.flattenNodes[i].cy = 0;
		}
	}

	containerElement.attr('transform', (d) => {
		return `translate(${d.x},${d.y})`;
	});
	nodeElements.attr('width', (d) => d.width).attr('height', (d) => d.height);

	nodeElements.attr('x', (d) => d.cx).attr('y', (d) => d.cy);

	if (nodeLabelsElements) {
		// put it in the top middle
		nodeLabelsElements
			.attr('x', (d) => d.cx + d.width / 2)
			.attr('y', (d) => d.cy + drawSettings.nodePadding);
	}

	if (collapseButtonElements) {
		collapseButtonElements
			.attr('cx', (d) => d.cx + d.width - 4 * drawSettings.buttonRadius)
			.attr('cy', (d) => d.cy + drawSettings.nodePadding + drawSettings.buttonRadius);
	}
	if (liftButtonElements) {
		liftButtonElements
			.attr('cx', (d) => d.cx + d.width - 1.5 * drawSettings.buttonRadius)
			.attr('cy', (d) => d.cy + drawSettings.nodePadding + drawSettings.buttonRadius);
	}
}
