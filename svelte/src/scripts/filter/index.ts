import {getCommonAncestors, getNode} from '$helper/graphdata-helpers';
import type {ConfigInterface, GraphData, GraphDataEdge, GraphDataNode} from '../../types';

import {doCollapseNodes} from './collapse-nodes';
import { doCombineEdgesWeight } from './combine-edges';
import {liftDependencies} from './lift-edges';

export function filter(config: ConfigInterface, graphData: GraphData) {
	resetNodeMemberToOriginal(graphData.flattenNodes);
	resetLinksSourceAndTargetToOriginal(graphData.links);
	// order doesn't matter here. TODO: add reasoning inside doc - because we do it cleanly, the attribute is totally changed.

	// handle dependency lifting
	liftDependencies(config, graphData);

	// alternatively, just hide edges crossing levels
	if (config.hideHierarchicalEdges !== undefined) {
		filterHierarchicalEdges(graphData, config.hideHierarchicalEdges);
	} else {
		graphData.links.forEach(l => (l.hidden = undefined));
	}

	// handle collapsed vertices
	doCollapseNodes(config);

	// filter duplicated links and combine it
	doCombineEdgesWeight(graphData);
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
			edge.weight = edge.originalWeight
		}
	});
}

function filterHierarchicalEdges({links, nodesDict}: GraphData, sensitivity: number) {
	links.forEach(l => {
		const {slice1, slice2} = getCommonAncestors(
			getNode(l.source, nodesDict),
			getNode(l.target, nodesDict),
		);

		if (slice1.length > sensitivity + 1 || slice2.length > sensitivity + 1) {
			l.hidden = true;
		} else {
			l.hidden = false;
		}
	});
}
