import type { ConfigInterface, GraphData, GraphDataEdge, GraphDataNode } from '$types';
import { combineWeights, flattenNode } from '$helper';
import { redirectAllEdgeToDestinationNode } from './lift-edges';

export function onNodeCollapseClick(
	clickedNode: GraphDataNode,
	config: ConfigInterface,
	onFinish: () => void
) {
	// push if not exist
	if (!config.collapsedNodes.includes(clickedNode)) {
		config.collapsedNodes.push(clickedNode);
		// doCollapseNodes(clickedNode);
	} else {
		// doUncollapseNodes(clickedNode);

		config.collapsedNodes = config.collapsedNodes.filter((node) => node !== clickedNode);
	}
	onFinish();
}
export function doUncollapseNodes(clickedNode: GraphDataNode) {
	// return to the original members
	clickedNode.members = clickedNode.originalMembers;

	// return to original link for it's children
	const flatChildren = flattenNode(clickedNode.members ?? []);
	flatChildren.forEach((child) => {
		child.incomingLinks?.forEach((link) => {
			if (link.originalTarget) {
				link.target = link.originalTarget;
				delete link.originalTarget;
			}
		});
		child.outgoingLinks?.forEach((link) => {
			if (link.originalSource) {
				link.source = link.originalSource;
				delete link.originalSource;
			}
		});
	});
}
export function doCollapseNodes(config: ConfigInterface) {
	config.collapsedNodes.forEach((collapsedNode) => {
		// flatten the children

		// B. redirect link. save the original link as 'originalSource' and 'originalTarget'. Combine the weights
		const redirectDestination = collapsedNode;
		redirectAllEdgeToDestinationNode(redirectDestination, collapsedNode);

		// A. remove the members
		collapsedNode.members = [];

		// Combine weight
		// combineWeights(duplicateLinks);
	});
}
