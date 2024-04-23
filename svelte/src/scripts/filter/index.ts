import type {ConfigInterface, GraphData, GraphDataEdge, GraphDataNode} from '../../types';

import {doCollapseNodes} from './collapse-nodes';
import {liftDependencies} from './lift-edges';

export function filter(config: ConfigInterface, graphData: GraphData) {
	// reset all
	// TODO: add the reasoning for this inside the doc.
	resetNodeMemberToOriginal(graphData.flattenNodes);
	resetLinksSourceAndTargetToOriginal(graphData.links);
	// order doesn't matter here. TODO: add reasoning inside doc - because we do it cleanly, the attribute is totally changed.

	// handle dependency lifting
	liftDependencies(config);
	// handle collapsed vertices
	doCollapseNodes(config);
}

function doCombineEdgesWeight(config: ConfigInterface, graphData: GraphData) {
	// TODO: impement this, and move it to another file
}

function resetNodeMemberToOriginal(nodes: GraphDataNode[]) {
	nodes.forEach(node => {
		node.members = node.originalMembers;
		node.incomingLinks = node.originalIncomingLinks;
		node.outgoingLinks = node.originalOutgoingLinks;
	});
}
function resetLinksSourceAndTargetToOriginal(edges: GraphDataEdge[]) {
	edges.forEach(edge => {
		if (edge.originalSource) {
			edge.source = edge.originalSource;
		}
		if (edge.originalTarget) {
			edge.target = edge.originalTarget;
		}
	});
}
