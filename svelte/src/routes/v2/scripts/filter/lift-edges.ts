import type {
	ConvertedData,
	ConvertedNode,
	ConvertedEdge,
	NodesDictionaryType,
	GraphData,
	ConfigInterface,
	GraphDataEdge
} from '../../types';

export interface FilteredNode extends ConvertedNode {
	parent?: FilteredNode;
}

// Find length of common prefix of 2 string arrays
function commonPrefix(a: string[], b: string[]) {
	let i = 0;
	while (i < a.length && i < b.length && a[i] === b[i]) {
		i++;
	}
	return i;
}

// Get the node-ids of all ancestors
function getAncestors(node: FilteredNode): string[] {
	if (node?.parent) return [...getAncestors(node.parent), node.id];
	else return [node.id];
}

export function liftDependencies(config: ConfigInterface, graphData: GraphData) {
	const nodesDictionary: NodesDictionaryType = {};
	const links = graphData.links;
	graphData.flattenNodes.forEach((node: ConvertedNode) => {
		nodesDictionary[node.id] = node;
	});

	// Execute dependency lifting
	const liftedLinks = links.map((link: GraphDataEdge): GraphDataEdge => {
		// Get array of ids of anscestors of source and target vertices
		console.log(nodesDictionary);
		const sourceAncestors = getAncestors(nodesDictionary[link.source.id]);
		const targetAncestors = getAncestors(nodesDictionary[link.target.id]);

		// Calculate how many ansestors source and target have in common
		const prefix = commonPrefix(sourceAncestors, targetAncestors);

		// Calculate how deep the link should go (how many levels should remain unlifted)
		// Infinity denotes lifting dependencies is not done.
		const liftDistance = [...sourceAncestors, ...targetAncestors].reduce<number>(
			(acculimator, nodeId) => {
				const constraint = config.dependencyLifting.find((c) => c.nodeId === nodeId);
				return Math.min(acculimator, constraint?.depth ?? Infinity);
			},
			Infinity as number
		);

		return {
			...link,
			source: sourceAncestors[prefix + liftDistance]
				? nodesDictionary[sourceAncestors[prefix + liftDistance]]
				: link.source,
			target: targetAncestors[prefix + liftDistance]
				? nodesDictionary[targetAncestors[prefix + liftDistance]]
				: link.target
		};
	});
	console.log('liftedLinks');
	console.log(liftedLinks);
	return liftedLinks;
	// Filter out duplicates
	return liftedLinks.filter(({ id: id1, ...link1 }, index) => {
		return (
			liftedLinks.findIndex(({ id: id2, ...link2 }) => {
				return JSON.stringify(link1) === JSON.stringify(link2);
			}) === index
		);
	});
}
