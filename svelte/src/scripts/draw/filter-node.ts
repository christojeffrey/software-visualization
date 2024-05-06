import type {GraphDataNode} from '$types';

// Will filter node recursively
export default function filterNodeAndPopulateFilteredID(
	nodes: GraphDataNode[],
	filteredNodeNames: string[],
): GraphDataNode[] {
	if (nodes.length < 1) return [];
	filteredNodeNames;
	const filteredNodes = nodes.filter(node => {
		if (filteredNodeNames.includes(node.id)) {
			node.members.forEach(member => {
				filteredNodeNames.push(member.id);
			});
			return false;
		}
		return true;
	});

	for (let i = 0; i < filteredNodes.length; i++) {
		const filteredMembers = filterNodeAndPopulateFilteredID(
			filteredNodes[i].members,
			filteredNodeNames,
		);
		filteredNodes[i].members = filteredMembers;
	}
	return filteredNodes;
}
