import type {EdgeType, GraphDataEdge, SimpleNode} from '$types';

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

// Currently, this function combine the weights with undeleted duplicated links in mind
export function combineWeights(duplicateLinks: Map<string, GraphDataEdge[]>) {
	for (const [_, edges] of duplicateLinks) {
		let totalWeight = 0;
		edges.forEach(edge => {
			if (!edge.originalWeight) edge.originalWeight = edge.weight;
			totalWeight += edge.originalWeight;
		});
		// Reassign the weight
		edges.forEach(edge => {
			edge.weight = totalWeight;
		});
	}
}

/**
 * Makes a string HTML-safe, meaning its characters don't clash with jquery-selectors.
 * Intended to use for node-id's
 */
export function toHTMLToken(string: string) {
	return string.replace(/[^A-Za-z0-9]/g, '--');
}

/**
 * Throws an error if the given number is NaN, Infinity or any non-number value
 */
export function notNaN(n?: number): number {
	if (!Number.isFinite(n)) {
		throw new Error(`Unexpected value: ${n}`);
	}
	return n!;
}

/**
 * Clamps num to a range [min, max] (inclusive bounds).
 * Returns an error if the bounds are invalid
 */
export function clamp(num: number, min: number, max: number) {
	if (min > max) throw new Error(`Invalid clamping: ${min} > ${max}`);
	return notNaN(Math.min(Math.max(num, min), max));
}

/** Computes the euclidean distance between 2 points */
export function distance(p1: {x: number; y: number}, p2: {x: number; y: number}) {
	return notNaN(Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)));
}

/**
 * Returns the geometric mean of 2 points, where the first point is weighed by value alpha (defaults to 0.5; so an unweighted geometric mean)
 */
export function geometricMean(p1: {x: number; y: number}, p2: {x: number; y: number}, alpha = 0.5) {
	return {
		x: alpha * p1.x + (1 - alpha) * p2.x,
		y: alpha * p1.y + (1 - alpha) * p2.y,
	};
}
