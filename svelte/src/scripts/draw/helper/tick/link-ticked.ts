import type { GraphDataEdge } from '$types';

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
