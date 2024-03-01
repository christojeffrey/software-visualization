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
	// return to the original members
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
		// flatten the children
		const flatChildrenId = flattenNode(collapsedNode.members ?? []).map((node) => node.id);

		// A. add new attribute, which is 'originalMembers'
		collapsedNode.originalMembers = collapsedNode.members;
		delete collapsedNode.members;

		const duplicateLinks: Map<string, GraphDataEdge[]> = new Map<string, GraphDataEdge[]>();
		// B. redirect link. save the original link as 'originalSource' and 'originalTarget'. Combine the weights
		graphData.links.forEach((link: GraphDataEdge) => {
			// Check if link original source or target is parent
			if (link.source === collapsedNode || link.target === collapsedNode) {
				const key = `${link.source.id}-${link.target.id}`;
				duplicateLinks.set(key, [...(duplicateLinks.get(key) ?? []), link]);
			}
			// redirect to parent
			// check if source is in flatChildrenId
			if (flatChildrenId.includes(link.source.id)) {
				// backup original source
				link.originalSource = link.source;
				link.source = collapsedNode;
				const key = `${link.source.id}-${link.target.id}`;
				duplicateLinks.set(key, [...(duplicateLinks.get(key) ?? []), link]);
			}
			// check if target is in flatChildrenId
			if (flatChildrenId.includes(link.target.id)) {
				// backup original source
				link.originalTarget = link.target;
				link.target = collapsedNode;
				const key = `${link.source.id}-${link.target.id}`;
				duplicateLinks.set(key, [...(duplicateLinks.get(key) ?? []), link]);
			}
		});

		// Combine weight
		combineWeights(duplicateLinks);
	});
}
