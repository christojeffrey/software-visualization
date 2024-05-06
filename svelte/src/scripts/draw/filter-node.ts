import type {GraphDataNode} from '$types';

// Will filter node recursively
export default function filterNodeAndPopulateFilteredID(
	nodes: GraphDataNode[],
	filteredNodeNames: string[],
): GraphDataNode[] {
	if (nodes.length < 1) return [];
	const filteredNodes = nodes.filter(node => {
		if (filteredNodeNames.includes(node.id)) {
			node.members.forEach(member => {
				filteredNodeNames.push(member.id);
				populateFilterId(member.members, filteredNodeNames);
			});
			return false;
		}
		return true;
	});

	for (let i = 0; i < filteredNodes.length; i++) {
		filteredNodes[i].members = filteredNodes[i].originalMembers;
		const filteredMembers = filterNodeAndPopulateFilteredID(
			filteredNodes[i].members,
			filteredNodeNames,
		);
		filteredNodes[i].members = filteredMembers;
	}
	return filteredNodes;
}

function populateFilterId(nodes: GraphDataNode[], filteredNodeNames: string[]): void {
	nodes.forEach(node => {
		filteredNodeNames.push(node.id);
        populateFilterId(node.members, filteredNodeNames);
	});
}
