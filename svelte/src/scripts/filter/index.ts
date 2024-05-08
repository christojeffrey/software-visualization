import type {ConfigInterface, GraphData, GraphDataEdge, GraphDataNode} from '../../types';

import {doCollapseNodes} from './collapse-nodes';
import {doCombineEdgesWeight} from './combine-edges';
import filterNodeAndPopulateFilteredID from './filter-node';
import {liftDependencies} from './lift-edges';

export function filter(config: ConfigInterface, graphData: GraphData) {
	// reset all
	// TODO: add the reasoning for this inside the doc.
	resetNodeMemberToOriginal(graphData.flattenNodes);
	resetLinksSourceAndTargetToOriginal(graphData.links);

	// Filter the nodes
	const [filteredNodes, filteredNodeNames] = filterNodeAndPopulateFilteredID(graphData.nodes, config.filteredNodes);
	graphData.renderedNodes = filteredNodes
	
	// order doesn't matter here. TODO: add reasoning inside doc - because we do it cleanly, the attribute is totally changed.
	// handle dependency lifting
	liftDependencies(config);
	// handle collapsed vertices
	doCollapseNodes(config);

	// filter duplicated links and combine it if it's in filtered lists
	doCombineEdgesWeight(graphData, filteredNodeNames);
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
		if (edge.originalWeight) {
			edge.weight = edge.originalWeight;
		}
	});
}
