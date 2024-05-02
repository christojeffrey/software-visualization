import {edgesAreDrawn, getCommonAncestors, nodesAreDrawn} from '$helper/graphdata-helpers';
import type {
	DrawSettingsInterface,
	EdgePort,
	EdgePortMap,
	EdgeRoutingOrigin,
	EdgeRoutingPoint,
	GraphDataEdge,
	GraphDataNode,
} from '$types';

type portMap = {[id: string]: EdgePort};

export function addEdgePorts(
	edges: GraphDataEdge[],
	nodes: GraphDataNode[],
	drawSettings: DrawSettingsInterface,
) {
	if (!(nodesAreDrawn(nodes) && edgesAreDrawn(edges, nodes))) {
		throw new Error('Invalid state');
	}

	const minPortWidth = 40;
	const portHeight = 0.5 * drawSettings.nodePadding;

	const incomingMap: portMap = {};
	const outgoingMap: portMap = {};

	nodes.forEach(n => {
		// Remember we use center coordinates
		const incoming = {
			x: 0,
			y: -0.5 * n.height - 0.5 * portHeight,
			width: minPortWidth,
			height: portHeight,
			parent: n,
		};
		const outgoing = {
			x: 0,
			y: 0.5 * n.height + 0.5 * portHeight,
			width: minPortWidth,
			height: portHeight,
			parent: n,
		};
		incomingMap[n.id] = incoming;
		outgoingMap[n.id] = outgoing;
	});

	edges.forEach(edge => {
		const {slice1, slice2} = getCommonAncestors(edge.source, edge.target);
		slice1.forEach(node => {
			const point: EdgeRoutingPoint = {
				x: 0,
				y: -0.5 * portHeight,
				origin: incomingMap[node.id]!,
			};
			edge.routing.push(point);
		});
		slice2.reverse().forEach(node => {
			const point: EdgeRoutingPoint = {
				x: 0,
				y: 0.5 * portHeight,
				origin: outgoingMap[node.id],
			};
		});
	});

	// Merge dictionaries for rendering:
	const portMap: EdgePortMap = {}; // = Object.assign({}, ...nodes.map(({id}) => ({[id]: []})));
	[...Object.entries(incomingMap), ...Object.entries(outgoingMap)].forEach(([key, value]) => {
		portMap[key] ??= [];
		portMap[key].push(value);
	});

	//return incomingMap;
	return portMap;
}
