import type {GraphDataNode} from '$types';

// Will filter node recursively
export default function filterNodeAndPopulateFilteredID(
	nodes: GraphDataNode[],
	filteredNodeNames: Set<string>,
): [GraphDataNode[], Set<string>] {
	if (nodes.length < 1 || filteredNodeNames.size === 0) return [nodes, filteredNodeNames];
	const filteredNodes: GraphDataNode[] = [];
	const filteredNodeNamesCopy = new Set(filteredNodeNames);
	for (let i = 0; i < nodes.length; i++) {
		if (filteredNodeNamesCopy.has(nodes[i].id)) {
			filteredNodes.push(nodes[i]);
			// push its id and its children's id to filteredNodeNamesCopy
			filteredNodeNamesCopy.add(nodes[i].id);
			populateFilterId(nodes[i].members, filteredNodeNamesCopy);
		} else {
			// Find if any of its children is in filteredNodeNames
			const [filteredMembers, filteredNodeNamesResult] = filterNodeAndPopulateFilteredID(nodes[i].members, filteredNodeNames);
			if (filteredMembers.length > 0) {
				// If any of its children is in filteredNodeNames, push it to filteredNodes
				filteredNodes.push(nodes[i]);
				filteredNodes[filteredNodes.length - 1].members = filteredMembers;
				// push its id and filteredNodeNamesResult to filteredNodeNamesCopy
				filteredNodeNamesCopy.add(nodes[i].id);
				filteredNodeNamesResult.forEach(id => filteredNodeNamesCopy.add(id));
			}
		}
	}

	return [filteredNodes, filteredNodeNamesCopy];
}

function populateFilterId(nodes: GraphDataNode[], filteredNodeNames: Set<string>): void {
	if (nodes.length < 1) return;
	nodes.forEach(node => {
		filteredNodeNames.add(node.id);
        populateFilterId(node.members, filteredNodeNames);
	});
}
