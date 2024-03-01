import type { ConfigInterface, GraphData, GraphDataEdge, GraphDataNode } from '../../types';
import { doCollapseNodes } from './collapse-nodes';
import { liftDependencies } from './lift-edges';

export function filter(config: ConfigInterface, graphData: GraphData) {
	// reset all
	resetNodeMemberToOriginal(graphData.flattenNodes);
	resetLinksSourceAndTargetToOriginal(graphData.links);

	// handle collapsed vertices
	doCollapseNodes(config);
	// we want to collapse first. if we lift first, then collapse, links that are redirected to the father might be redirected back to him. scenario: lift to the grandparent, collapse the father.

	// handle dependency lifting
	liftDependencies(config);
}

function doCombineEdgesWeight(config: ConfigInterface, graphData: GraphData) {}

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
