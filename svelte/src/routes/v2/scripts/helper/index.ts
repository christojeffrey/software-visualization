import type { EdgeType, GraphDataEdge } from '../../types';

export function flattenNode(nodes: any) {
	//   reserse the order so that the parent is always at the end.
	const result: any[] = [];
	nodes.forEach((node: any) => {
		// order matter.
		if (node.members) {
			result.push(...flattenNode(node.members));
		}
		result.push(node);
	});
	return result;
}

export function extractAvailableEdgeType(links: GraphDataEdge[]) {
	const availableEdgeType: EdgeType[] = [];
	links.forEach((link) => {
		if (!availableEdgeType.includes(link.type)) availableEdgeType.push(link.type);
	});
	return availableEdgeType;
}

