import type { ConfigInterface, GraphData, SimpleNodesDictionaryType } from '../../types';
import { doCollapseNodes } from './collapse-nodes';
import { liftDependencies } from './lift-edges';

export function filter(config: ConfigInterface, graphData: GraphData) {
	// reset all
	// TODO: add the reasoning for this inside the doc.
	resetNodeMemberToOriginal(graphData.flattenNodes);
	resetLinksSourceAndTargetToOriginal(graphData.links);
	// order doesn't matter here. TODO: add reasoning inside doc
	// handle dependency lifting
	let nodesDictionary: SimpleNodesDictionaryType;
	[graphData.links, nodesDictionary] = liftDependencies(config, graphData);

	// Initialize data
	graphData.nodesDict = {};
	graphData.flattenNodes.forEach(node => {
		node.incomingLinksLifted = [];
		node.outgoingLinksLifted = [];
		graphData.nodesDict[node.id] = node;
	});

	graphData.links.forEach(link => {
		link.liftedSource?.outgoingLinksLifted?.push(link);
		link.liftedTarget?.incomingLinksLifted.push(link);
	});

	// handle collapsed vertices
	doCollapseNodes(config);
}

function doCombineEdgesWeight(config: ConfigInterface, graphData: GraphData) {
	// TODO: impement this, and move it to another file
}

function resetNodeMemberToOriginal(nodes: GraphDataNode[]) {
	nodes.forEach((node) => {
		node.members = node.originalMembers;
		node.incomingLinks = node.originalIncomingLinks;
		node.outgoingLinks = node.originalOutgoingLinks;
	});
}
function resetLinksSourceAndTargetToOriginal(edges: GraphDataEdge[]) {
	edges.forEach((edge) => {
		if (edge.originalSource) {
			edge.source = edge.originalSource;
		}
		if (edge.originalTarget) {
			edge.target = edge.originalTarget;
		}
	});
}
