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

export function filter(_config: any, convertedData: any) {
	console.log('filter');
	const nodes: any = convertedData.nodes;
	const links: any = convertedData.links.filter((link: any) => _config.shownEdgesType.get(link.type) === true);
	const flattenNodes: any = flattenNode(nodes);

	assignParentReference(nodes);

	const graphData: any = {
		nodes,
		links,
		flattenNodes
	};
	return graphData;
}
