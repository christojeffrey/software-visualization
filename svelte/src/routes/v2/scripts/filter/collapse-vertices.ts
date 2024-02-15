import type { ConfigInterface, GraphData, GraphDataEdge, GraphDataNode } from '../../types';
import { combineWeights, flattenNode } from '../helper';

export function onVertexCollapseClick(
	clickedVertex: GraphDataNode,
	config: ConfigInterface,
	onFinish: () => void
) {
	// push if not exist
	if (!config.collapsedVertices.includes(clickedVertex)) {
		config.collapsedVertices.push(clickedVertex);
	} else {
		doUncollapseVertices(clickedVertex);

		config.collapsedVertices = config.collapsedVertices.filter(
			(vertex) => vertex.id !== clickedVertex.id
		);
	}
	onFinish();
}
export function doUncollapseVertices(clickedVertex: GraphDataNode) {
	// return the original members
	clickedVertex.members = clickedVertex.originalMembers;
	delete clickedVertex.originalMembers;

	// return to original link for it's children
	const flatChildren = flattenNode(clickedVertex.members ?? []);
	flatChildren.forEach((child) => {
		child.incomingLinks?.forEach((link) => {
			if (link.originalTarget) {
				link.target = link.originalTarget;
				delete link.originalTarget;
			}
		});
		child.outgoingLinks?.forEach((link) => {
			if (link.originalSource) {
				link.source = link.originalSource;
				delete link.originalSource;
			}
		});
	});
}
export function doCollapseVertices(config: ConfigInterface, graphData: GraphData) {
	config.collapsedVertices.forEach((collapsedVertex) => {
		// find collapsed vertex in the nodes
		const collapsedVertexIndex = graphData.flattenNodes.findIndex(
			(node) => node.id === collapsedVertex.id
		);
		// flatten the children
		const flatChildrenId = flattenNode(
			graphData.flattenNodes[collapsedVertexIndex].members ?? []
		).map((node) => node.id);

		// A. add new attribute, which is 'originalMembers'
		graphData.flattenNodes[collapsedVertexIndex].originalMembers =
			graphData.flattenNodes[collapsedVertexIndex].members;
		delete graphData.flattenNodes[collapsedVertexIndex].members;

		const duplicateLinks: Map<string, GraphDataEdge[]> = new Map<string, GraphDataEdge[]>();
		// B. redirect link. save the original link as 'originalSource' and 'originalTarget'. Combine the weights
		graphData.links.forEach((link: GraphDataEdge) => {
			// Check if link original source or target is parent
			if (
				link.source === graphData.flattenNodes[collapsedVertexIndex] ||
				link.target === graphData.flattenNodes[collapsedVertexIndex]
			) {
				const key = `${link.source.id}-${link.target.id}`;
				duplicateLinks.set(key, [...(duplicateLinks.get(key) ?? []), link]);
			}
			// redirect to parent
			// check if source is in flatChildrenId
			if (flatChildrenId.includes(link.source.id)) {
				link.originalSource = link.source;
				link.source = graphData.flattenNodes[collapsedVertexIndex];
				const key = `${link.source.id}-${link.target.id}`;
				duplicateLinks.set(key, [...(duplicateLinks.get(key) ?? []), link]);
			}
			// check if target is in flatChildrenId
			if (flatChildrenId.includes(link.target.id)) {
				link.originalTarget = link.target;
				link.target = graphData.flattenNodes[collapsedVertexIndex];
				const key = `${link.source.id}-${link.target.id}`;
				duplicateLinks.set(key, [...(duplicateLinks.get(key) ?? []), link]);
			}
		});

		// Combine weight
		combineWeights(duplicateLinks);
	});
}
