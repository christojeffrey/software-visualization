import type {
	ConvertedNode,
	NodesDictionaryType,
	ConfigInterface,
	GraphDataEdge,
	GraphData,
	GraphDataNode
} from '../../types';

export interface FilteredNode extends ConvertedNode {
	parent?: FilteredNode;
}
// HELPER FUNCTIONS
// Find length of common prefix of 2 string arrays
function commonPrefix(a: GraphDataNode[], b: GraphDataNode[]) {
	let i = 0;
	while (i < a.length && i < b.length && a[i] === b[i]) {
		i++;
	}
	return i;
}

// Get the node-ids of all ancestors
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
	if (!config.dependencyLifting.find((nodeConfig: any) => nodeConfig.node.id === clickedNode.id)) {
		config.dependencyLifting.push({ node: clickedNode, depth: config.dependencyTolerance });
	} else {
		// remove if exist
		config.dependencyLifting = config.dependencyLifting.filter(
			(nodeConfig) => nodeConfig.node.id !== clickedNode.id
		);
		console.log(config);
	}
	onFinish();
}

export function liftDependencies(config: ConfigInterface, graphData: GraphData) {
	const links = graphData.links;

	// create dictionary of nodes for easy access
	const nodesDictionary: NodesDictionaryType = {};
	graphData.flattenNodes.forEach((node: ConvertedNode) => {
		nodesDictionary[node.id] = node;
	});

	// return all to original

	// Execute dependency lifting
	const liftedLinks = links.map((link: GraphDataEdge): GraphDataEdge => {
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

		return {
			...link,
			originalSource: link.source,
			originalTarget: link.target,
			source: sourceAncestors[prefix + liftDistance] ?? link.source,
			target: targetAncestors[prefix + liftDistance] ?? link.target
		};
	});
	// Filter out duplicates: same source, target, and type
	return liftedLinks.filter(
		(link, index, self) =>
			self.findIndex(
				(l) => l.source === link.source && l.target === link.target && l.type === link.type
			) === index
	);
}
