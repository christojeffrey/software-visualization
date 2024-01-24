function assignParentReference(nodes: any) {
	// console.log(nodes);
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

export function filter(config: any, graphData: any) {
	console.log('filter');
	console.log(config);
	console.log(graphData);

	// 1. handle collapsed vertices
	config.collapsedVertices.forEach((collapsedVertex: any) => {
		// find collapsed vertex in the nodes
		const collapsedVertexIndex = graphData.flattenNodes.findIndex(
			(node: any) => node.id === collapsedVertex.id
		);
		// flatten the children
		const flatChildrenId = flattenNode(graphData.flattenNodes[collapsedVertexIndex].members).map(
			(node: any) => node.id
		);

		// A. direct all the links to the parent
		console.log(flatChildrenId);
		graphData.links.forEach((link: any) => {
			if (flatChildrenId.includes(link.source.id)) {
				link.source = collapsedVertex;
			}
			if (flatChildrenId.includes(link.target.id)) {
				link.target = collapsedVertex;
			}
		});
		// B. remove the members

		delete graphData.flattenNodes[collapsedVertexIndex].members;

		graphData.flattenNodes.splice(
			collapsedVertexIndex - flatChildrenId.length,
			flatChildrenId.length
		);
	});
}
