import type { ConfigInterface } from '$types';
import { redirectAllEdgeToDestinationNode } from './lift-edges';

export function doCollapseNodes(config: ConfigInterface) {
	config.collapsedNodes.forEach((collapsedNode) => {
		// B. redirect link
		const redirectDestination = collapsedNode;
		redirectAllEdgeToDestinationNode(redirectDestination, collapsedNode);

		// A. remove the members
		collapsedNode.members = [];

		// Combine weight
	});
}
