const PADDING = 10;
export function innerTicked(membersContainerElement: any, memberElements: any) {
	membersContainerElement.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
	memberElements.attr('width', (d: any) => d.width).attr('height', (d: any) => d.height);
	memberElements.attr('x', (d: any) => d.cx).attr('y', (d: any) => d.cy);
}
export function linkTicked(linkElements: any, linkLabelElements: any) {
	// calculate all the link labels location.
	const allResult: any = {};
	linkElements
		.attr('x1', (d: any) => {
			// callculate once here change to global coordinates.
			// calculate new source
			const newLocation = {
				x1: d.source.x,
				y1: d.source.y,
				x2: d.target.x,
				y2: d.target.y
			};

			let source = d.source;
			while (source.parent) {
				newLocation.x1 += source.parent.x;
				newLocation.y1 += source.parent.y;
				source = source.parent;
			}
			// calculate new target
			let target = d.target;
			while (target.parent) {
				newLocation.x2 += target.parent.x;
				newLocation.y2 += target.parent.y;
				target = target.parent;
			}

			allResult[d.id] = newLocation;

			return allResult[d.id].x1;
		})
		.attr('y1', (d: any) => {
			return allResult[d.id].y1;
		})
		.attr('x2', (d: any) => {
			return allResult[d.id].x2;
		})
		.attr('y2', (d: any) => {
			return allResult[d.id].y2;
		})
		.attr('stroke', function (this: any, d: any) {
			if (this.x2.baseVal.value > this.x1.baseVal.value) return `url(#${d.type}Gradient)`;
			return `url(#${d.type}GradientReversed)`;
		});
}
export function masterSimulationTicked(
	graphData: any,
	containerElement: any,
	nodeElements: any,
	drawSettings: any
) {
	// calculate nodes width and height, x and y. only do this calculation once, on master simulation
	for (let i = 0; i < graphData.flattenNodes.length; i++) {
		const hasShownMembers =
			graphData.flattenNodes[i].members &&
			graphData.flattenNodes[i].members.filter((member: any) => !member.hidden).length > 0;
		if (hasShownMembers) {
			const members = graphData.flattenNodes[i].members.filter((member: any) => !member.hidden);
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

	containerElement.attr('transform', (d: any) => {
		return `translate(${d.x},${d.y})`;
	});
	nodeElements.attr('width', (d: any) => d.width).attr('height', (d: any) => d.height);

	nodeElements.attr('x', (d: any) => d.cx).attr('y', (d: any) => d.cy);
}
