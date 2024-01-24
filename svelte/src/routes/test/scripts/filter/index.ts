import type { ConvertedData, ConvertedNode, ConvertedEdge, NodesDictionaryType } from "../converter";

export interface ConfigInterface {
	dependencyLifting: {
		nodeId: string,
		depth: number,
	}[],
}

interface FilteredNode extends ConvertedNode{
	parent?: FilteredNode,
}

interface FilteredData extends ConvertedData{
	nodes: FilteredNode[],
}

function assignParentReference(nodes: any) {
	nodes.forEach((node: any, _index: any, _arr: any) => {
		if (node.members) {
			node.members.forEach((_: any, index: any, arr: any) => {
				arr[index].parent = node;
			});
			assignParentReference(node.members);
		}
	});
}

function flattenNode(nodes: any) {
	//   reserse the order so that the parent is always at the end.
	const result: any[] = [];
	nodes.forEach((node: any) => {
		// order matter.
		if (node.members) {
			result.push(...flattenNode(node.members));
		}
		result.push(node);
	});
	return result;
}

// Find length of common prefix of 2 string arrays
function commonPrefix(a: string[], b: string[]) {
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) {i++}
    return i;
}

// Get the node-ids of all ancestors
function getAncestors(node: FilteredNode): string[] {
	if (node.parent) return [...getAncestors(node.parent), node.id]; else return [node.id];
}

function liftDependencies(config: ConfigInterface, links: ConvertedEdge[], nodesDictionary: NodesDictionaryType) {
	// Execute dependency lifting
	const liftedLinks = links.map((link: ConvertedEdge): ConvertedEdge => {
		// Get array of ids of anscestors of source and target vertices
		const sourceAncestors = getAncestors(nodesDictionary[link.source]);
		const targetAncestors = getAncestors(nodesDictionary[link.target]);

		// Calculate how many ansestors source and target have in common
		const prefix = commonPrefix(sourceAncestors, targetAncestors);

		// Calculate how deep the link should go (how many levels should remain unlifted)
		// Infinity denotes lifting dependencies is not done.
		const liftDistance = [...sourceAncestors, ...targetAncestors].reduce<number>((acculimator, nodeId) => {
			const constraint = config.dependencyLifting.find(c => c.nodeId === nodeId);
            return Math.min(acculimator, constraint?.depth ?? Infinity);
        }, Infinity as number);

		return {
			...link,
			source: sourceAncestors[prefix + liftDistance] ?? link.source,
			target: targetAncestors[prefix + liftDistance] ?? link.target,
		}
	})
	// Filter out duplicates
	return liftedLinks.filter(({id: id1, ...link1}, index) => {
		return liftedLinks.findIndex(({id: id2, ...link2}) => {
			return JSON.stringify(link1) === JSON.stringify(link2);
		}) === index;
	});
}

export function filter(config: ConfigInterface, {nodes, links, nodesDictionary}: FilteredData) {
	const flattenNodes = flattenNode(nodes);
	assignParentReference(nodes);

	const liftedLinks = liftDependencies(config, links, nodesDictionary);

	const graphData = {
		nodes,
		links: liftedLinks,
		flattenNodes,
	};
	return graphData;
}
