import type { ConfigType, GraphDataType, GraphElementsType } from './types';

export const tick = (
	config: ConfigType,
	graphData: GraphDataType,
	graphElements: GraphElementsType
) => {
	graphElements.links
		.attr('x1', (d: any) => d.source.x)
		.attr('y1', (d: any) => d.source.y)
		.attr('x2', (d: any) => d.target.x)
		.attr('y2', (d: any) => d.target.y);

	graphElements.nodes.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);

	if (config.showNodeLabels) {
		graphElements.nodeLabels.attr('x', (d: any) => d.x).attr('y', (d: any) => d.y);
	}

	if (config.showLinkLabels) {
		graphElements.linkLabels
			.attr('x', (d: any) => d.source.x + (d.target.x - d.source.x) / 2)
			.attr('y', (d: any) => d.source.y + (d.target.y - d.source.y) / 2);
	}

	if (config.isGrouped) {
		// update group positions
		for (let i = 0; i < graphData.groups.length; i++) {
			const members: any[] = [];

			graphData.groups[i].leaves.forEach((id: any) => {
				// find the node in the nodeData array
				const node = graphData.nodes.find((node: any) => node.id === id);
				members.push(node);
			});

			graphData.groups[i].x = Math.min(...members.map((member: any) => member.x)) - 10;
			graphData.groups[i].y = Math.min(...members.map((member: any) => member.y)) - 10;
			graphData.groups[i].width =
				Math.max(...members.map((member: any) => member.x)) - graphData.groups[i].x + 10;
			graphData.groups[i].height =
				Math.max(...members.map((member: any) => member.y)) - graphData.groups[i].y + 10;
		}
		graphElements.groups.attr('x', (d: any) => d.x);
		graphElements.groups.attr('y', (d: any) => d.y);
		graphElements.groups.attr('width', (d: any) => d.width);
		graphElements.groups.attr('height', (d: any) => d.height);
	}
};
