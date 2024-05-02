import type {GraphDataEdge, GraphDataNode} from '$types';
// I've rewritten these functions so often now

export function getAncestors(n: GraphDataNode): GraphDataNode[] {
	if (n.parent) {
		return [...getAncestors(n.parent), n.parent];
	}
	return [];
}

export function getCommonAncestors(node1: GraphDataNode, node2: GraphDataNode) {
	const chain1 = getAncestors(node1);
	const chain2 = getAncestors(node2);

	let i;
	for (i = 0; i < chain1.length && i < chain2.length; i++) {
		if (chain1[i] !== chain2[i]) {
			break;
		}
	}

	return {prefix: chain1.slice(0, i), slice1: chain1.slice(i), slice2: chain2.slice(i)};
}

interface GraphDataNodeDrawn extends GraphDataNode {
	members: GraphDataNodeDrawn[];
	parent?: GraphDataNodeDrawn;

	x: number;
	y: number;
	width: number;
	height: number;
}

export function nodesAreDrawn(nodes: GraphDataNode[]): nodes is GraphDataNodeDrawn[] {
	for (const n of nodes) {
		if (
			!Number.isFinite(n.x) ||
			!Number.isFinite(n.y) ||
			!Number.isFinite(n.width) ||
			!Number.isFinite(n.height)
		) {
			console.error({n});
			return false;
		}
		if (n.parent && !nodes.includes(n.parent)) {
			throw new Error('Unrelated node found');
		}
		for (const m of nodes) {
			if (!nodes.includes(m)) {
				throw new Error('Unrelated node found');
			}
		}
	}
	return true;
}

interface GraphDataEdgeDrawn extends GraphDataEdge {
	source: GraphDataNodeDrawn;
	target: GraphDataNodeDrawn;
}

/** Only use when you are certain the edges are drawn (after nodes are drawn) */
export function edgesAreDrawn(
	edges: GraphDataEdge[],
	nodes: GraphDataNodeDrawn[],
): edges is GraphDataEdgeDrawn[] {
	edges.forEach(e => {
		if (
			!(
				// I need three pragma's for this one if statement :')
				// prettier-ignore
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-ignore
				nodes.includes(e.source) &&	nodes.includes(e.target) &&	nodes.includes(e.liftedSource) && nodes.includes(e.liftedTarget)
			)
		) {
			return false;
		}
	});
	return true;
}
