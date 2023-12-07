export const tick = (
	linkElements: any,
	nodeElements: any,
	groupElements: any,
	nodeLabelElements: any,
	groupData: any,
	nodeData: any
) => {
	linkElements
		.attr('x1', (d: any) => d.source.x)
		.attr('y1', (d: any) => d.source.y)
		.attr('x2', (d: any) => d.target.x)
		.attr('y2', (d: any) => d.target.y);

	nodeElements.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);
	nodeLabelElements.attr('x', (d: any) => d.x).attr('y', (d: any) => d.y);

	// update group positions
	for (let i = 0; i < groupData.length; i++) {
		const members: any[] = [];

		groupData[i].leaves.forEach((id: any) => {
			// find the node in the nodeData array
			const node = nodeData.find((node: any) => node.id === id);
			members.push(node);
		});

		groupData[i].x = Math.min(...members.map((member: any) => member.x)) - 10;
		groupData[i].y = Math.min(...members.map((member: any) => member.y)) - 10;
		groupData[i].width = Math.max(...members.map((member: any) => member.x)) - groupData[i].x + 10;
		groupData[i].height = Math.max(...members.map((member: any) => member.y)) - groupData[i].y + 10;
	}
	groupElements.attr('x', (d: any) => d.x);
	groupElements.attr('y', (d: any) => d.y);
	groupElements.attr('width', (d: any) => d.width);
	groupElements.attr('height', (d: any) => d.height);
};
