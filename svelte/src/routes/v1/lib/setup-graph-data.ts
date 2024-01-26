import type { ConfigType, GraphDataType } from './types';

export function setupGraphData(config: ConfigType, convertedData: any) {
	const graphData: GraphDataType = {
		nodes: [],
		links: [],
		groups: [],
		groupLinks: [],
		groupButtons: []
	};
	graphData.nodes = convertedData.nodes;
	graphData.links = convertedData.links;
	graphData.groups = convertedData.groups;
	graphData.groupLinks = [];
	graphData.groupButtons = [];
	collapsedGroupHandler(config.collapsedGroups, graphData);
	return graphData;
}

export function collapsedGroupHandler(collapsedGroups: any, graphData: any) {
	// remove nodes data and group data.

	let filteredNodes = graphData.nodes;
	// preformat to make the newly inputed links and the previous one the same
	let filteredLinks = graphData.links.map((link: any) => {
		return {
			source: link.source,
			target: link.target
		};
	});

	// remove the children from the group to minimize computation
	let allChildrenFromCollapsedGroups: any[] = [];
	collapsedGroups.forEach((collapsedGroupId: string) => {
		const collapsedGroup = graphData.groups.find((group: any) => group.id === collapsedGroupId);
		if (collapsedGroup.children) {
			allChildrenFromCollapsedGroups = allChildrenFromCollapsedGroups.concat(
				collapsedGroup.children
			);
		}
	});
	// remove children from graphData
	graphData.groups = graphData.groups.filter(
		(group: any) => !allChildrenFromCollapsedGroups.includes(group.id)
	);

	collapsedGroups.forEach((collapsedGroupId: string) => {
		// skip if the group is not rendered
		if (allChildrenFromCollapsedGroups.includes(collapsedGroupId)) {
			return;
		}

		const newNodes: any[] = [];
		const newLinks: any[] = [];
		const collapsedGroup = graphData.groups.find((group: any) => group.id === collapsedGroupId);

		// average the position of the nodes
		let averageX = 0;
		let averageY = 0;
		let count = 0;
		collapsedGroup.leaves.forEach((id: string) => {
			const node = filteredNodes.find((node: any) => node.id === id);
			if (node) {
				averageX += node.x;
				averageY += node.y;
				count++;
			}
		});
		averageX /= count;
		averageY /= count;
		newNodes.push({
			id: collapsedGroupId,
			x: averageX,
			y: averageY,
			isCollapsedGroup: true,
			size: collapsedGroup.leaves.length + 5
		});
		const collapsedGroupLinks = filteredLinks.filter(
			(link: any) =>
				collapsedGroup.leaves.includes(link.source) !== collapsedGroup.leaves.includes(link.target)
		);
		collapsedGroupLinks.forEach((link: any) => {
			if (collapsedGroup.leaves.includes(link.source)) {
				newLinks.push({
					source: collapsedGroupId,
					target: link.target
				});
			} else {
				newLinks.push({
					source: link.source,
					target: collapsedGroupId
				});
			}
		});

		filteredNodes = filteredNodes.filter((node: any) => !collapsedGroup.leaves.includes(node.id));
		filteredNodes = filteredNodes.concat(newNodes);

		filteredLinks = filteredLinks.filter(
			(link: any) =>
				!collapsedGroup.leaves.includes(link.source) && !collapsedGroup.leaves.includes(link.target)
		);
		filteredLinks = filteredLinks.concat(newLinks);

		// HANDLE NESTED
		// update parents leaves if it has one
		if (collapsedGroup.parent) {
			const parent = graphData.groups.find((group: any) => group.id === collapsedGroup.parent);
			parent.leaves = parent.leaves.filter((id: string) => !collapsedGroup.leaves.includes(id));
			parent.leaves.push(collapsedGroupId);
		}
		// don't render children's group
		// if (collapsedGroup.children) {
		// 	collapsedGroup.children.forEach((id: string) => {
		// 		let child = graphData.groups.find((group: any) => group.id === id);
		// 		child.isRendered = false;
		// 	});
		// }
	});
	// update graphData
	graphData.nodes = filteredNodes;
	graphData.links = filteredLinks;
	graphData.groups = graphData.groups.filter((group: any) => !collapsedGroups.includes(group.id));

	// TODO: handle nested group
}
