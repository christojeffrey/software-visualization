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
	//return string.replace(/[^A-Za-z0-9]/g, '--');
	let result = '';
	for (let i = 0; i < string.length; i++) {
		const code = string.charCodeAt(i);
		if (
			!(code > 47 && code < 58) && // numeric (0-9)
			!(code == 45) && // -
			!(code > 64 && code < 91) && // upper alpha (A-Z)
			!(code > 96 && code < 123) // lower alpha (a-z)
		) {
			result += `_${code}_`;
		} else {
			result += string.charAt(i);
		}
	}
	return result;
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

/** Returns 0 if not a valid number (e.g. finite and not NaN), and the given number otherwise*/
export function safeNumber(n?: number, defaultValue: number = 0): number {
	return n && Number.isFinite(n) ? n : notNaN(defaultValue);
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

/**
 * Retrieve a fixed number of elements from an array, evenly distributed but
 * always including the first and last elements.
 */
export function distributedCopy<T>(items: T[], n: number) {
	const elements = [items[0]];
	const totalItems = items.length - 2;
	const interval = Math.floor(totalItems / (n - 2));
	for (let i = 1; i < n - 1; i++) {
		elements.push(items[i * interval]);
	}
	elements.push(items[items.length - 1]);
	return elements;
}
