import { debuggingConsole } from '$helper';
import type {
	ConvertedNode,
	NodesDictionaryType,
	PreGraphData,
	ConfigInterface,
	PreGraphDataEdge
} from '../../types';

export interface FilteredNode extends ConvertedNode {
	parent?: FilteredNode;
}
// HELPER FUNCTIONS
// Find length of common prefix of 2 string arrays
function commonPrefix(a: string[], b: string[]) {
	let i = 0;
	while (i < a.length && i < b.length && a[i] === b[i]) {
		i++;
	}
	return i;
}

// Get the node-ids of all ancestors
function getAncestors(node: any): any[] {
	// return list of ancestors, including node itself. starting from the 'oldest' ancestor
	if (node?.parent) return [...getAncestors(node.parent), node];
	else return [node];
}

export function onDependencyLiftClick(clickedEdge: any, config: any, onFinish: () => void) {
	// push if not exist
	if (!config.dependencyLifting.find((edge: any) => edge.id === clickedEdge.id)) {
		config.dependencyLifting.push({ node: clickedEdge, depth: config.dependencyTolerance });
	} else {
		// remove if exist
		config.dependencyLifting = config.dependencyLifting.filter(
			(edge: any) => edge.id !== clickedEdge.id
		);
	}
	onFinish();
}

export function liftDependencies(config: ConfigInterface, graphData: any) {
	const links = graphData.links;

	// create dictionary of nodes for easy access
	const nodesDictionary: NodesDictionaryType = {};
	graphData.flattenNodes.forEach((node: ConvertedNode) => {
		nodesDictionary[node.id] = node;
	});

	// Execute dependency lifting
	const liftedLinks = links.map((link: any): PreGraphDataEdge => {
		debuggingConsole('link', link);
		// Get array of ids of anscestors of source and target vertices
		const sourceAncestors = getAncestors(nodesDictionary[link.source.id]);
		const targetAncestors = getAncestors(nodesDictionary[link.target.id]);

		debuggingConsole('sourceAncestors', sourceAncestors);
		debuggingConsole('targetAncestors', targetAncestors);

		// Calculate how many ansestors source and target have in common
		const prefix = commonPrefix(sourceAncestors, targetAncestors);

		debuggingConsole('prefix', prefix);

		// Calculate how deep the link should go (how many levels should remain unlifted)
		// Infinity denotes lifting dependencies is not done.
		const liftDistance = [...sourceAncestors, ...targetAncestors].reduce<number>(
			(acculimator, node) => {
				debuggingConsole('node', node);
				const constraint = config.dependencyLifting.find((c) => {
					console.log('c', c);
					return c.node === node;
				});
				console.log('constraint', constraint);
				return Math.min(acculimator, constraint?.depth ?? Infinity);
			},
			Infinity as number
		);

		debuggingConsole('liftDistance', liftDistance);

		return {
			...link,
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
