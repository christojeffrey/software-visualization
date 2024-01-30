const PADDING = 10;

export function innerTicked(membersContainerElement: any, memberElements: any) {
	membersContainerElement.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
	memberElements.attr('width', (d: any) => d.width).attr('height', (d: any) => d.height);
	memberElements.attr('x', (d: any) => d.cx).attr('y', (d: any) => d.cy);
}
export function linkTicked(linkElements: any) {
	linkElements.attr('d', function (this: SVGPathElement, d: any) {
		let cx1 = d.source.x,
			cy1 = d.source.y,
			cx2 = d.target.x,
			cy2 = d.target.y;

		let pointerSource = d.source.parent,
			pointerTarget = d.target.parent;
		while (pointerSource || pointerTarget) {
			cx1 += pointerSource?.x;
			cy1 += pointerSource?.y;
			cx2 += pointerTarget?.x;
			cy2 += pointerTarget?.y;
			pointerSource = pointerSource?.parent;
			pointerTarget = pointerTarget?.parent;
		}

		// Apply gradient here since it is most efficient as it doesn't require recomputation
		//
		if (cx2 > cx1) this.style.stroke = `url(#${d.type}Gradient)`;
		else this.style.stroke = `url(#${d.type}GradientReversed)`;

		return `M${cx1},${cy1} L${cx2},${cy2}`;
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
