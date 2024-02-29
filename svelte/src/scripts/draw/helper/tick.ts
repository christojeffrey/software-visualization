import type { DrawSettingsInterface, GraphData, GraphDataEdgeD3, GraphDataNode } from '$types';

export function innerTicked(
	nodes: GraphDataNode[],
	drawSettings: DrawSettingsInterface,
	membersContainerElement: d3.Selection<SVGGElement, GraphDataNode, SVGGElement, unknown>,
	memberElements: d3.Selection<SVGRectElement, GraphDataNode, SVGGElement, unknown>,
	nodeLabelsElements: d3.Selection<SVGTextElement, GraphDataNode, SVGGElement, unknown>,
	collapseButtonElements: d3.Selection<SVGCircleElement, GraphDataNode, SVGGElement, unknown>,
	liftButtonElements: d3.Selection<SVGCircleElement, GraphDataNode, SVGGElement, unknown>
) {
	const PADDING = drawSettings.nodePadding + 2 * drawSettings.buttonRadius;

	// calculate nodes width and height, x and y. only do this calculation once, on master simulation
	updateNodePosition(nodes, PADDING, drawSettings.minimumNodeSize);


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
	edges: GraphDataEdgeD3[],
	linkElements: d3.Selection<SVGPathElement, GraphDataEdgeD3, SVGGElement, unknown>,
	linkLabelElements?: d3.Selection<SVGTextElement, GraphDataEdgeD3, SVGGElement, unknown>
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
		// calculate once here change to global coordinates.
		// calculate new source
		const newLocation = {
			x1: d.realSource.x || 0,
			y1: d.realSource.y || 0,
			x2: d.realTarget.x || 0,
			y2: d.realTarget.y || 0,
		};

		let source = d.realSource;
		while (source.parent) {
			newLocation.x1 += source.parent.x ?? 0;
			newLocation.y1 += source.parent.y ?? 0;
			source = source.parent;
		}
		// calculate new target
		let target = d.realTarget;
		while (target.parent) {
			newLocation.x2 += target.parent.x ?? 0;
			newLocation.y2 += target.parent.y ?? 0;
			target = target.parent;
		}

		allResult[d.id] = newLocation;
	});

	linkElements.attr('d', function (this: SVGPathElement, d: GraphDataEdgeD3) {
		// Apply gradient here since it is most efficient as it doesn't require recomputation
		// TODO: Add stroke width based on weight (don't forget to recalculate on lift)
		// Currently, lifting and collapse handle link differently, I think we need to pass the convertedData as a reference
		if (allResult[d.id].x2 > allResult[d.id].x1) this.style.stroke = `url(#${d.type}Gradient)`;
		else this.style.stroke = `url(#${d.type}GradientReversed)`;
		this.style.strokeWidth = Math.round(Math.log(d.weight * 10)).toString();
		return `M${allResult[d.id].x1 || 0},${allResult[d.id].y1 || 0} L${allResult[d.id].x2 || 0},${allResult[d.id].y2 || 0}`;
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
	updateNodePosition(graphData.nodes, PADDING, drawSettings.minimumNodeSize);

	containerElement.attr('transform', (d) => {
		return `translate(${d.x || 0},${d.y || 0})`;
	});
	nodeElements.attr('width', (d) => d.width || 0).attr('height', (d) => d.height || 0);

	nodeElements.attr('x', (d) => d.cx || 0).attr('y', (d) => d.cy ||0);

	if (nodeLabelsElements) {
		// put it in the top middle
		nodeLabelsElements
			.attr('x', (d) => (d.cx || 0) + (d.width || 0) / 2)
			.attr('y', (d) => (d.cy || 0) + drawSettings.nodePadding);
	}

	if (collapseButtonElements) {
		collapseButtonElements
			.attr('cx', (d) => (d.cx || 0) + (d.width || 0) - 4 * drawSettings.buttonRadius)
			.attr('cy', (d) => (d.cy || 0) + drawSettings.nodePadding + drawSettings.buttonRadius);
	}
	if (liftButtonElements) {
		liftButtonElements
			.attr('cx', (d) => (d.cx || 0) + (d.width || 0) - 1.5 * drawSettings.buttonRadius)
			.attr('cy', (d) => (d.cy || 0) + (drawSettings.nodePadding || 0) + drawSettings.buttonRadius);
	}
}

function updateNodePosition(nodes: GraphDataNode[], PADDING: number, minimumNodeSize: number) {
	for (let i = 0; i < nodes.length; i++) {
		const hasMembers = (nodes[i].members ?? []).length > 0;
		if (hasMembers) {
			const members = nodes[i].members ?? [];
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

			if (Number.isNaN(maxX) || Number.isNaN(maxY) || Number.isNaN(minX) || Number.isNaN(minY) || Number.isNaN(minimumNodeSize)) {
				console.error('Unexpected NaN');
			}
			nodes[i].width = maxX - minX + PADDING * 2;
			nodes[i].height = maxY - minY + PADDING * 2;
			// stands for calculated x and y.
			nodes[i].cx = minX - PADDING;
			nodes[i].cy = minY - PADDING;
		} else {
			nodes[i].width = minimumNodeSize;
			nodes[i].height = minimumNodeSize;
			//   stands for calculated x and y.
			nodes[i].cx = 0;
			nodes[i].cy = 0;
		}
	}
}
