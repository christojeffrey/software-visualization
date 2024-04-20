import type {ConfigInterface, GraphDataNode} from '$types';

export function liftDependencies(config: ConfigInterface) {
	config.dependencyLifting.forEach(nodeConfig => {
		const {node: redirectLocationNode, sensitivity} = nodeConfig;

		redirectLocationNode.members?.forEach(member => {
			redirectAllEdgeToDestinationNode(redirectLocationNode, member, sensitivity);
		});
	});
}

export function redirectAllEdgeToDestinationNode(
	redirectDestination: GraphDataNode,
	nodeToBeRedirected: GraphDataNode,
	sensitivity: number = 0,
) {
	// will redirect every edge and every children to the destination node. starting from nodeToBeRedirected.
	// will redirect of the difference in level is more than sensitivity

	if (nodeToBeRedirected.level - redirectDestination.level > sensitivity) {
		// do redirect
		nodeToBeRedirected.outgoingLinks.forEach(link => {
			link.source = redirectDestination;
		});
		nodeToBeRedirected.incomingLinks.forEach(link => {
			link.target = redirectDestination;
		});

		redirectDestination.outgoingLinks.push(...nodeToBeRedirected.outgoingLinks);
		redirectDestination.incomingLinks.push(...nodeToBeRedirected.incomingLinks);
		nodeToBeRedirected.outgoingLinks = [];
		nodeToBeRedirected.incomingLinks = [];
	}
}
