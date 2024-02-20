import type {
	ConvertedNode,
	SimpleNodesDictionaryType,
	ConfigInterface,
	GraphDataEdge,
	GraphData,
	GraphDataNode
} from '$types';
import { combineWeights } from '$helper';

export interface FilteredNode extends ConvertedNode {
	parent?: FilteredNode;
}
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

export function onDependencyLiftClick(
	clickedNode: GraphDataNode,
	config: ConfigInterface,
	onFinish: () => void
) {
	// push if not exist
	if (!config.dependencyLifting.find((nodeConfig) => nodeConfig.node.id === clickedNode.id)) {
		config.dependencyLifting.push({ node: clickedNode, depth: config.dependencyTolerance });
	} else {
		// remove if exist
		config.dependencyLifting = config.dependencyLifting.filter(
			(nodeConfig) => nodeConfig.node.id !== clickedNode.id
		);
	}
	onFinish();
}

export function liftDependencies(config: ConfigInterface, graphData: GraphData) {
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

		// Get array of ids of anscestors of source and target vertices
		const sourceAncestors = getAncestors(nodesDictionary[link.source.id]);
		const targetAncestors = getAncestors(nodesDictionary[link.target.id]);

		// Calculate how many ansestors source and target have in common
		const prefix = commonPrefix(sourceAncestors, targetAncestors);

		// Calculate how deep the link should go (how many levels should remain unlifted)
		// Infinity denotes lifting dependencies is not done.
		const liftDistance = [...sourceAncestors, ...targetAncestors].reduce<number>(
			(acculimator, node) => {
				const constraint = config.dependencyLifting.find((c) => {
					return c.node === node;
				});
				return Math.min(acculimator, constraint?.depth ?? Infinity);
			},
			Infinity as number
		);
		const newSource = sourceAncestors[prefix + liftDistance] ?? link.source;
		const newTarget = targetAncestors[prefix + liftDistance] ?? link.target;
		// Preparing data for combining weight
		const key = `${newSource.id}-${newTarget.id}`;
		duplicateLinks.set(key, [...(duplicateLinks.get(key) ?? []), link]);

		link.originalSource = link.source;
		link.originalTarget = link.target;
		link.source = newSource;
		link.target = newTarget;
	});
	console.log(duplicateLinks);
	// Combine weight
	combineWeights(duplicateLinks);

	return links;
}
