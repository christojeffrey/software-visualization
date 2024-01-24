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

export function filter(config: any, convertedData: any) {
	// graphData that is spitted out of this function is always totally brand new
	// 1. setup
	// do deep copy
	const nodes: any = JSON.parse(JSON.stringify(convertedData.nodes));
	const links: any = JSON.parse(JSON.stringify(convertedData.links));
	console.log(nodes);
	console.log(links);
	const flattenNodes: any = flattenNode(nodes);

	assignParentReference(nodes);
	console.log(config);
	// 2. handle collapsed vertices
	config.collapsedVertices.forEach((collapsedVertexId: any) => {
		// find collapsed vertex in the nodes
		const collapsedVertexIndex = flattenNodes.findIndex(
			(node: any) => node.id === collapsedVertexId
		);
		// flatten the children
		const flatChildrenId = flattenNode(flattenNodes[collapsedVertexIndex].members).map(
			(node: any) => node.id
		);

		// A. direct all the links to the parent
		console.log(flatChildrenId);
		links.forEach((link: any) => {
			if (flatChildrenId.includes(link.source)) {
				link.source = collapsedVertexId;
			}
			if (flatChildrenId.includes(link.target)) {
				link.target = collapsedVertexId;
			}
		});
		// B. remove the members

		delete flattenNodes[collapsedVertexIndex].members;

		flattenNodes.splice(collapsedVertexIndex - flatChildrenId.length, flatChildrenId.length);
	});

	const graphData: any = {
		nodes,
		links,
		flattenNodes
	};
	console.log(graphData);
	return graphData;
}
