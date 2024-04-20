import type {ConfigInterface} from '$types';
import {redirectAllEdgeToDestinationNode} from './lift-edges';

export function doCollapseNodes(config: ConfigInterface) {
	config.collapsedNodes.forEach(collapsedNode => {
		// redirect link
		const redirectDestination = collapsedNode;

		redirectDestination.members?.forEach(member => {
			redirectAllEdgeToDestinationNode(redirectDestination, member);
		});

		// remove the members
		collapsedNode.members = [];
	});
}
