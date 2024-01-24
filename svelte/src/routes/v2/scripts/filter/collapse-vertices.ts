import { flattenNode } from '../helper';

export function onVertexCollapseClick(clickedVertex: any, config: any, onFinish: () => void) {
	console.log('on collapse button clicked');

	// push if not exist
	if (!config.collapsedVertices.includes(clickedVertex)) {
		console.log('push');
		config.collapsedVertices.push(clickedVertex);
	} else {
		console.log('remove');
		doUncollapseVertices(clickedVertex);

		config.collapsedVertices = config.collapsedVertices.filter(
			(vertex: any) => vertex.id !== clickedVertex.id
		);
	}
	onFinish();
}
export function doUncollapseVertices(clickedVertex: any) {
	// return the original members
	clickedVertex.members = clickedVertex.originalMembers;
	delete clickedVertex.originalMembers;

	// return to original link for it's children
	const flatChildren = flattenNode(clickedVertex.members);
	flatChildren.forEach((child: any) => {
		child.incomingLinks?.forEach((link: any) => {
			if (link.originalTarget) {
				link.target = link.originalTarget;
				delete link.originalTarget;
			}
		});
		child.outgoingLinks?.forEach((link: any) => {
			if (link.originalSource) {
				link.source = link.originalSource;
				delete link.originalSource;
			}
		});
	});
}
export function doCollapseVertices(config: any, graphData: any) {
	config.collapsedVertices.forEach((collapsedVertex: any) => {
		// find collapsed vertex in the nodes
		const collapsedVertexIndex = graphData.flattenNodes.findIndex(
			(node: any) => node.id === collapsedVertex.id
		);
		// flatten the children
		const flatChildrenId = flattenNode(graphData.flattenNodes[collapsedVertexIndex].members).map(
			(node: any) => node.id
		);

		// A. add new attribute, which is 'originalMembers'
		graphData.flattenNodes[collapsedVertexIndex].originalMembers =
			graphData.flattenNodes[collapsedVertexIndex].members;
		delete graphData.flattenNodes[collapsedVertexIndex].members;

		// B. redirect link. save the original link as 'originalSource' and 'originalTarget'
		graphData.links.forEach((link: any) => {
			// redirect to parent
			// check if source is in flatChildrenId
			if (flatChildrenId.includes(link.source.id)) {
				link.originalSource = link.source;
				link.source = graphData.flattenNodes[collapsedVertexIndex];
			}
			// check if target is in flatChildrenId
			if (flatChildrenId.includes(link.target.id)) {
				link.originalTarget = link.target;
				link.target = graphData.flattenNodes[collapsedVertexIndex];
			}
		});
	});
}