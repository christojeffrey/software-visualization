import type { GraphData, GraphDataEdge, GraphDataNode } from "$types"

export function doCombineEdgesWeight(graphData: GraphData) {
	const linkDict: Map<string, GraphDataEdge> = new Map()

	graphData.links.forEach(edge => {
		const key: string = `${(edge.source as GraphDataNode).id}-${(edge.target as GraphDataNode).id}`
		if (linkDict.has(key)) {
			linkDict.get(key)!.weight += edge.weight
		} else {
			// Put into dict and assign original weight
			linkDict.set(key, edge)
			edge.originalWeight = edge.weight
		}
	})

	// Push all linkDict into graphData renderedLinks
	graphData.renderedLinks = []
	linkDict.forEach((value) => {
		graphData.renderedLinks.push(value)
	})
}