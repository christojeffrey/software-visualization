import type {EdgeType, GraphDataEdge, SimpleNode} from '$types';

export function flattenNode<AnyNode extends SimpleNode>(nodes: AnyNode[]): AnyNode[] {
	// Recursively flatten the nodes (lift the children to the top level array),
	// reserse the order so that the parent is always at the end.
	const result: SimpleNode[] = [];
	nodes.forEach(node => {
		// order matter.
		if (node.members) {
			result.push(...flattenNode(node.members));
		}
		result.push(node);
	});
	return result as AnyNode[];
}

export function extractAvailableEdgeType(links: GraphDataEdge[]) {
	const availableEdgeType: EdgeType[] = [];
	links.forEach(link => {
		if (!availableEdgeType.includes(link.type)) availableEdgeType.push(link.type);
	});
	return availableEdgeType;
}

export function toHTMLToken(string: string) {
	return string.replace(/[^A-Za-z0-9]/g, '--');
}
