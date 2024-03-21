import type { Force } from 'd3';
import type { GraphDataNode, GraphDataEdge } from '$types';

export function downForce(): Force<GraphDataNode, undefined> {
	let nodes: GraphDataNode[];
	const nodeMap: Map<string, Set<GraphDataEdge>> = new Map();

	function force(alpha: number) {
		nodes.forEach((node) => {
			const set = nodeMap.get(node.id);
			set?.forEach((link) => {
				link.source.incomingLinks?.forEach((l) => set.add(l));
				link.source?.members?.forEach((m) => m.incomingLinks?.forEach((l) => set.add(l)));
			});
		});

		const sorted = [...nodeMap.entries()].sort(([_a, a], [_b, b]) => {
			return a.size < b.size ? -1 : 1;
		});
		nodes.forEach((node) => {
			const set = nodeMap.get(node.id);
			const index = sorted.findIndex(([id, _]) => {
				return node.id === id;
			});
			const weight = (index ?? 0) * 30;
			node.vy! += weight * alpha;
		});
	}

	force.initialize = function (_nodes: GraphDataNode[]) {
		nodes = _nodes;
		nodes.forEach((node) => {
			const set = new Set(node.incomingLinks);
			nodeMap.set(node.id, set);
			node?.members?.forEach((node) => {
				node.incomingLinks?.forEach((link) => set.add(link));
			});
		});
	};

	return force;
}
