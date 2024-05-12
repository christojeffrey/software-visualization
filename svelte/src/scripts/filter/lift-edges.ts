import type {ConfigInterface, GraphData, GraphDataNode} from '$types';

function commonPrefix(a: GraphDataNode[], b: GraphDataNode[]) {
	let i = 0;
	while (i < a.length && i < b.length && a[i] === b[i]) {
		i++;
	}
	return i;
}

function getAncestors(node: GraphDataNode): GraphDataNode[] {
	// return list of ancestors, including node itself. starting from the 'oldest' ancestor
	if (node?.parent) return [...getAncestors(node.parent), node];
	else return [node];
}

export function liftDependencies(config: ConfigInterface, graphData: GraphData) {
	graphData.links.forEach(link => {
		// return to original link first before calculation
		const linkSource = typeof link.source == 'string' ? link.source : link.source.id;
		const linkTarget = typeof link.target == 'string' ? link.target : link.target.id;

		// Get array of ids of ancestors of source and target vertices
		const sourceAncestors = getAncestors(graphData.nodesDict[linkSource]);
		const targetAncestors = getAncestors(graphData.nodesDict[linkTarget]);

		// Calculate how many ancestors source and target have in common
		const prefix = commonPrefix(sourceAncestors, targetAncestors);

		// Calculate how deep the link should go (how many levels should remain unlifted)
		// Infinity denotes lifting dependencies is not done.
		const liftDistance = [...sourceAncestors, ...targetAncestors].reduce<number>(
			(accumulator, node) => {
				const constraint = config.dependencyLifting.find(c => {
					return c.node === node;
				});
				return Math.min(accumulator, constraint?.sensitivity ?? Infinity);
			},
			Infinity as number,
		);
		const newSource = sourceAncestors[prefix + liftDistance] ?? link.source;
		const newTarget = targetAncestors[prefix + liftDistance] ?? link.target;

		link.source = newSource;
		link.target = newTarget;
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

		nodeToBeRedirected.members?.forEach(member => {
			redirectAllEdgeToDestinationNode(redirectDestination, member, sensitivity);
		});
	}
}
