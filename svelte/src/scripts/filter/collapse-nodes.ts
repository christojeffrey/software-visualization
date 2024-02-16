import type { ConfigInterface, GraphData, GraphDataEdge, GraphDataNode } from '$types';
import { combineWeights, flattenNode } from '$helper';

export function onNodeCollapseClick(
	clickedNode: GraphDataNode,
	config: ConfigInterface,
	onFinish: () => void
) {
	// push if not exist
	if (!config.collapsedNodes.includes(clickedNode)) {
		config.collapsedNodes.push(clickedNode);
	} else {
		doUncollapseNodes(clickedNode);

		config.collapsedNodes = config.collapsedNodes.filter((node) => node.id !== clickedNode.id);
	}
	onFinish();
}
export function doUncollapseNodes(clickedNode: GraphDataNode) {
	// return the original members
	clickedNode.members = clickedNode.originalMembers;
	delete clickedNode.originalMembers;

	// return to original link for it's children
	const flatChildren = flattenNode(clickedNode.members ?? []);
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
export function doCollapseNodes(config: ConfigInterface, graphData: GraphData) {
	config.collapsedNodes.forEach((collapsedNode) => {
		// find collapsed node in the nodes
		const collapsedNodeIndex = graphData.flattenNodes.findIndex(
			(node) => node.id === collapsedNode.id
		);
		// flatten the children
		const flatChildrenId = flattenNode(
			graphData.flattenNodes[collapsedNodeIndex].members ?? []
		).map((node) => node.id);

		// A. add new attribute, which is 'originalMembers'
		graphData.flattenNodes[collapsedNodeIndex].originalMembers =
			graphData.flattenNodes[collapsedNodeIndex].members;
		delete graphData.flattenNodes[collapsedNodeIndex].members;

		const duplicateLinks: Map<string, GraphDataEdge[]> = new Map<string, GraphDataEdge[]>();
		// B. redirect link. save the original link as 'originalSource' and 'originalTarget'. Combine the weights
		graphData.links.forEach((link: GraphDataEdge) => {
			// Check if link original source or target is parent
			if (
				link.source === graphData.flattenNodes[collapsedNodeIndex] ||
				link.target === graphData.flattenNodes[collapsedNodeIndex]
			) {
				const key = `${link.source.id}-${link.target.id}`;
				duplicateLinks.set(key, [...(duplicateLinks.get(key) ?? []), link]);
			}
			// redirect to parent
			// check if source is in flatChildrenId
			if (flatChildrenId.includes(link.source.id)) {
				link.originalSource = link.source;
				link.source = graphData.flattenNodes[collapsedNodeIndex];
				const key = `${link.source.id}-${link.target.id}`;
				duplicateLinks.set(key, [...(duplicateLinks.get(key) ?? []), link]);
			}
			// check if target is in flatChildrenId
			if (flatChildrenId.includes(link.target.id)) {
				link.originalTarget = link.target;
				link.target = graphData.flattenNodes[collapsedNodeIndex];
				const key = `${link.source.id}-${link.target.id}`;
				duplicateLinks.set(key, [...(duplicateLinks.get(key) ?? []), link]);
			}
		});

		// Combine weight
		combineWeights(duplicateLinks);
	});
}
