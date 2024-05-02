import {edgesAreDrawn, getCommonAncestors, nodesAreDrawn} from '$helper/graphdata-helpers';
import type {
	DrawSettingsInterface,
	EdgePortMap,
	EdgeRoutingOrigin,
	EdgeRoutingPoint,
	GraphDataEdge,
	GraphDataNode,
} from '$types';

export function addEdgePorts(
	edges: GraphDataEdge[],
	nodes: GraphDataNode[],
	drawSettings: DrawSettingsInterface,
) {
	if (!(nodesAreDrawn(nodes) && edgesAreDrawn(edges, nodes))) {
		throw new Error('Invalid state');
	}

	const minPortWidth = 40;
	const portHeight = 3;

	const portMap: EdgePortMap = {};

	nodes.forEach(n => {
		const port = {
			// Remember we use center coordinates
			x: 0,
			y: -0.5 * n.height - 0.5 * portHeight,
			width: minPortWidth,
			height: portHeight,
			parent: n,
		};
		portMap[n.id] = port;
	});

	edges.forEach(edge => {
		const {slice1, slice2} = getCommonAncestors(edge.source, edge.target);
		[...slice1, ...slice2.reverse()].forEach(node => {
			const point: EdgeRoutingPoint = {
				x: 0,
				y: -0.5 * portHeight,
				origin: portMap[node.id]!,
			};
			edge.routing.push(point);
		});
	});

	return portMap;
}
