import type { EdgeType, GraphDataEdge, SimpleNode } from '$types';

// debugging purpose
export function debuggingConsole(...args: unknown[]) {
	if (import.meta.env.VITE_DEBUGGING_MODE === 'true') {
		console.log(...args);
	}
}

export function flattenNode<AnyNode extends SimpleNode>(nodes: AnyNode[]): AnyNode[] {
	// Recursively flatten the nodes (lift the children to the top level array),
	// reserse the order so that the parent is always at the end.
	const result: SimpleNode[] = [];
	nodes.forEach((node) => {
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
	links.forEach((link) => {
		if (!availableEdgeType.includes(link.type)) availableEdgeType.push(link.type);
	});
	return availableEdgeType;
}

// Currently, this function combine the weights with undeleted duplicated links in mind
export function combineWeights(duplicateLinks: Map<string, GraphDataEdge[]>) {
	for (const [_, edges] of duplicateLinks) {
		let totalWeight = 0;
		edges.forEach((edge) => {
			if (!edge.originalWeight) edge.originalWeight = edge.weight;
			totalWeight += edge.originalWeight;
		});
		// Reassign the weight
		edges.forEach((edge) => {
			edge.weight = totalWeight;
		});
	}
}

export function toHTMLToken(string: string) {
	return string.replace(/[^A-Za-z0-9]/g, '--');
}

/**
 * Throws an error if the given number is NaN, or any non-number value
 */
export function notNaN(n: number): number {
	if (Number.isNaN(n) || typeof n !== 'number') {
		throw new Error(`Unexpected value: ${n}`);
	}
	return n;
}

/** 
 * Clamps num to a range [min, max] (inclusive bounds)
 * Returns an error if the bounds are nto valid
 */
export function clamp(num: number, min: number, max: number) {
	if (min > max) throw new Error(`Invalid clamping: ${min} > ${max}`)
	return notNaN(Math.min(Math.max(num, min), max));
}