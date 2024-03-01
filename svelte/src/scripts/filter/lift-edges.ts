import type { ConvertedNode, ConfigInterface, GraphDataNode } from '$types';

export interface FilteredNode extends ConvertedNode {
	parent?: FilteredNode;
}
export function onDependencyLiftClick(
	clickedNode: GraphDataNode,
	config: ConfigInterface,
	onFinish: () => void
) {
	// push if not exist
	if (!config.dependencyLifting.find((nodeConfig) => nodeConfig.node.id === clickedNode.id)) {
		config.dependencyLifting.push({ node: clickedNode, sensitivity: config.dependencyTolerance });
	} else {
		// remove if exist
		config.dependencyLifting = config.dependencyLifting.filter(
			(nodeConfig) => nodeConfig.node.id !== clickedNode.id
		);
	}
	onFinish();
}

export function liftDependencies(config: ConfigInterface) {
	config.dependencyLifting.forEach((nodeConfig) => {
		const { node: redirectLocationNode, sensitivity } = nodeConfig;

		redirectLocationNode.members?.forEach((member) => {
			redirectAllEdgeToDestinationNode(redirectLocationNode, member, sensitivity);
		});
	});
}

export function redirectAllEdgeToDestinationNode(
	redirectDestination: GraphDataNode,
	nodeToBeRedirected: GraphDataNode,
	sensitivity: number = 0
) {
	// will redirect every edge and every children to the destination node. starting from nodeToBeRedirected.
	// will redirect of the difference in level is more than sensitivity

	if (nodeToBeRedirected.level - redirectDestination.level > sensitivity) {
		// do redirect
		nodeToBeRedirected.outgoingLinks.forEach((link) => {
			link.originalSource = link.source;
			link.source = redirectDestination;
		});
		nodeToBeRedirected.incomingLinks.forEach((link) => {
			link.originalTarget = link.target;
			link.target = redirectDestination;
		});

		redirectDestination.outgoingLinks.push(...(nodeToBeRedirected.outgoingLinks ?? []));
		redirectDestination.incomingLinks.push(...(nodeToBeRedirected.incomingLinks ?? []));
	}

	nodeToBeRedirected.members.forEach((member) => {
		redirectAllEdgeToDestinationNode(redirectDestination, member, sensitivity);
	});
}
