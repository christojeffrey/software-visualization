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
		// find x, y, width, height of each group based on its members
		for (let i = 0; i < graphData.groups.length; i++) {
			const members = graphData.groups[i].members;
			graphData.groups[i].x = Math.min(...members.map((member: any) => member.x)) - 10;
			graphData.groups[i].y = Math.min(...members.map((member: any) => member.y)) - 10;
			graphData.groups[i].width =
				Math.max(...members.map((member: any) => member.x)) - graphData.groups[i].x + 10;
			graphData.groups[i].height =
				Math.max(...members.map((member: any) => member.y)) - graphData.groups[i].y + 10;

			// button
			graphData.groups[i].button.x = graphData.groups[i].x + 10;
			graphData.groups[i].button.y = graphData.groups[i].y + 10;
		}

		// update group container positions
		graphElements.groups.attr('x', (d: any) => {
			return d.fx ? d.fx : d.x;
		});
		graphElements.groups.attr('y', (d: any) => {
			return d.fy ? d.fy : d.y;
		});
		graphElements.groups.attr('width', (d: any) => d.width);
		graphElements.groups.attr('height', (d: any) => d.height);
		
		// update button positions
		graphElements.groupButtons.attr('cx', (d: any) => {
			return d.x;
		});
		graphElements.groupButtons.attr('cy', (d: any) => {
			return d.y;
		});

		// console.log(graphData.groups);
	}
};
