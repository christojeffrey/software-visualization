import { combineWeights } from '$helper';
import type { ConfigInterface, GraphData, GraphDataEdge, GraphDataNode, SimpleNodesDictionaryType } from '$types';

// export function liftDependencies(config: ConfigInterface) {
// 	config.dependencyLifting.forEach((nodeConfig) => {
// 		const { node: redirectLocationNode, sensitivity } = nodeConfig;

// 		redirectLocationNode.members?.forEach((member) => {
// 			redirectAllEdgeToDestinationNode(redirectLocationNode, member, sensitivity);
// 		});
// 	});
// }

// HELPER FUNCTIONS
// Find length of common prefix of 2 arrays
function commonPrefix(a: GraphDataNode[], b: GraphDataNode[]) {
	let i = 0;
	while (i < a.length && i < b.length && a[i] === b[i]) {
		i++;
	}
	return i;
}

// Get the node of all ancestors
function getAncestors(node: GraphDataNode): GraphDataNode[] {
	// return list of ancestors, including node itself. starting from the 'oldest' ancestor
	if (node?.parent) return [...getAncestors(node.parent), node];
	else return [node];
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
			link.source = redirectDestination;
		});
		nodeToBeRedirected.incomingLinks.forEach((link) => {
			link.target = redirectDestination;
		});

		redirectDestination.outgoingLinks.push(...nodeToBeRedirected.outgoingLinks);
		redirectDestination.incomingLinks.push(...nodeToBeRedirected.incomingLinks);
		nodeToBeRedirected.outgoingLinks = [];
		nodeToBeRedirected.incomingLinks = [];
	}
	onFinish();
}

export function liftDependencies(config: ConfigInterface, graphData: GraphData): [GraphDataEdge[], SimpleNodesDictionaryType] {
	const links = graphData.links;

	// create dictionary of nodes for easy access
	const nodesDictionary: SimpleNodesDictionaryType = {};
	graphData.flattenNodes.forEach((node) => {
		nodesDictionary[node.id] = node;
	});

	// Combining weight
	const duplicateLinks = new Map<string, GraphDataEdge[]>();

	// Execute dependency lifting
	links.forEach((link: GraphDataEdge) => {
		// return to original link first before calculation
		link.source = link.originalSource ?? link.source;
		link.target = link.originalTarget ?? link.target;
		const linkSource = typeof link.source == 'string' ? link.source : link.source.id;
		const linkTarget = typeof link.target == 'string' ? link.target : link.target.id;

		// Get array of ids of ancestors of source and target vertices
		const sourceAncestors = getAncestors(nodesDictionary[linkSource]);
		const targetAncestors = getAncestors(nodesDictionary[linkTarget]);

		// Calculate how many ancestors source and target have in common
		const prefix = commonPrefix(sourceAncestors, targetAncestors);

		// Calculate how deep the link should go (how many levels should remain unlifted)
		// Infinity denotes lifting dependencies is not done.
		const liftDistance = [...sourceAncestors, ...targetAncestors].reduce<number>(
			(accumulator, node) => {
				const constraint = config.dependencyLifting.find((c) => {
					return c.node === node;
				});
				return Math.min(accumulator, constraint?.depth ?? Infinity);
			},
			Infinity as number
		);
		const newSource = sourceAncestors[prefix + liftDistance] ?? link.source;
		const newTarget = targetAncestors[prefix + liftDistance] ?? link.target;
		const zeroSource = sourceAncestors[prefix]!;
		const zeroTarget = targetAncestors[prefix]!;
		// Preparing data for combining weight
		const key = `${newSource.id}-${newTarget.id}`;
		duplicateLinks.set(key, [...(duplicateLinks.get(key) ?? []), link]);

		link.originalSource = nodesDictionary[linkSource];
		link.originalTarget = nodesDictionary[linkTarget];
		link.source = newSource;
		link.target = newTarget;
		link.liftedSource = zeroSource;
		link.liftedTarget = zeroTarget;
	});
	// Combine weight
	combineWeights(duplicateLinks);

	return [links, nodesDictionary];
}
