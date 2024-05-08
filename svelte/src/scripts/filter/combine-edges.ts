import type {GraphData, GraphDataEdge, GraphDataNode} from '$types';

export function doCombineEdgesWeight(graphData: GraphData, filteredNodesName: Set<string>) {
	const linkDict: Map<string, GraphDataEdge> = new Map();

	graphData.links.forEach(edge => {
		edge.routing = [];
		// Only combine edges that are filtered
		if (
			filteredNodesName.size === 0 ||
			(filteredNodesName.has((edge.source as GraphDataNode).id) &&
			filteredNodesName.has((edge.target as GraphDataNode).id))
		) {
			const key: string = `${(edge.source as GraphDataNode).id}-${
				(edge.target as GraphDataNode).id
			}-${edge.type}`;
			if (linkDict.has(key)) {
				linkDict.get(key)!.weight += edge.weight;
			} else {
				// Put into dict and assign original weight
				linkDict.set(key, edge);
				edge.originalWeight = edge.weight;
			}
		}
	});

	// Push all linkDict into graphData renderedLinks
	graphData.renderedLinks = [];
	linkDict.forEach(value => {
		graphData.renderedLinks.push(value);
	});
}
