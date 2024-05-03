import {
	edgesAreDrawn,
	getAbsCoordinates,
	getCommonAncestors,
	nodesAreDrawn,
	type GraphDataEdgeDrawn,
} from '$helper/graphdata-helpers';
import type {
	DrawSettingsInterface,
	EdgePort,
	EdgePortMap,
	EdgeRoutingOrigin,
	EdgeRoutingPoint,
	GraphDataEdge,
	GraphDataNode,
} from '$types';

type portMap = {[id: string]: EdgePort & {edges: GraphDataEdgeDrawn[]}};

export function addEdgePorts(
	edges: GraphDataEdge[],
	nodes: GraphDataNode[],
	drawSettings: DrawSettingsInterface,
) {
	if (!(nodesAreDrawn(nodes) && edgesAreDrawn(edges, nodes))) {
		throw new Error('Invalid state');
	}

	const portWidth = 20;
	const portHeight = 0.25 * drawSettings.nodePadding;

	const incomingMap: portMap = {};
	const outgoingMap: portMap = {};

	nodes.forEach(n => {
		// Remember we use center coordinates
		const incoming = {
			x: 0,
			y: -0.5 * n.height - 0.5 * portHeight,
			width: portWidth,
			height: portHeight,
			parent: n,
			edges: [],
		};
		const outgoing = {
			x: 0,
			y: 0.5 * n.height + 0.5 * portHeight,
			width: portWidth,
			height: portHeight,
			parent: n,
			edges: [],
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
				origin: outgoingMap[node.id]!,
			};
			edge.routing.push(point);
			outgoingMap[node.id].edges.push(edge);
		});

		slice2.reverse().forEach(node => {
			const point: EdgeRoutingPoint = {
				x: 0,
				y: 0.5 * portHeight,
				origin: incomingMap[node.id],
			};
			edge.routing.push(point);
			incomingMap[node.id].edges.push(edge);
		});
	});

	// Sort the edges and vary coordinates based on sort
	Object.values(incomingMap)
		.flat()
		.forEach(port => {
			port.edges
				.sort((e1, e2) => {
					return getAbsCoordinates(e1.source).x - getAbsCoordinates(e2.source).x;
				})
				.forEach((edge, i) => {
					const routingPoint = edge.routing.find(r => r.origin === port)!;
					routingPoint.x = -0.5 * port.width + (port.width / (port.edges.length - 1)) * i;
				});
		});
	Object.values(outgoingMap)
		.flat()
		.forEach(port => {
			port.edges
				.sort((e1, e2) => {
					return getAbsCoordinates(e1.target).x - getAbsCoordinates(e2.target).x;
				})
				.forEach((edge, i) => {
					const routingPoint = edge.routing.find(r => r.origin === port)!;
					routingPoint.x = -0.5 * port.width + (port.width / (port.edges.length - 1)) * i;
				});
		});

	// Merge dictionaries for rendering:
	const portMap: EdgePortMap = {};
	[...Object.entries(incomingMap), ...Object.entries(outgoingMap)].forEach(([key, value]) => {
		portMap[key] ??= [];
		if (value.edges.length > 0) {
			portMap[key].push(value);
		}
	});

	//return incomingMap;
	return portMap;
}
