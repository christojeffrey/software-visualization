import {notNaN} from '$helper';
import type {
	EdgeRoutingOrigin,
	GraphDataEdge,
	GraphDataEdgeDrawn,
	GraphDataNode,
	GraphDataNodeDrawn,
} from '$types';
// I've rewritten these functions so often now, let's just keep them here from now on.

export function getAncestors(n: GraphDataNode): GraphDataNode[] {
	if (n.parent) {
		return [...getAncestors(n.parent), n];
	}
	return [n];
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

/**
 * Helper type for function getAbsCoordinates
 */
interface thingWithCoordinatesAndParent {
	x: number;
	y: number;
	parent?: thingWithCoordinatesAndParent;
}

/** Returns the absolute x and y coordinates of a GraphDataNode or an EdgeRoutingOrigin*/
export function getAbsCoordinates(node?: thingWithCoordinatesAndParent): {
	x: number;
	y: number;
} {
	if (node) {
		const {x, y} = getAbsCoordinates(node.parent);
		return {
			x: notNaN(node.x! + x),
			y: notNaN(node.y! + y),
		};
	} else {
		return {x: 0, y: 0};
	}
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

export function getNode(
	node: GraphDataNode | string,
	dict: {[id: string]: GraphDataNode},
): GraphDataNode {
	return typeof node === 'string' ? dict[node] : node;
}
