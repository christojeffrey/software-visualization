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

function assignLinkReference(links: any, flattenNodes: any) {
	links.forEach((link: any) => {
		const sourceIndex = flattenNodes.findIndex((node: any) => node.id === link.source);
		const targetIndex = flattenNodes.findIndex((node: any) => node.id === link.target);
		flattenNodes[sourceIndex].outgoingLinks
			? flattenNodes[sourceIndex].outgoingLinks.push(link)
			: (flattenNodes[sourceIndex].outgoingLinks = [link]);
		flattenNodes[targetIndex].incomingLinks
			? flattenNodes[targetIndex].incomingLinks.push(link)
			: (flattenNodes[targetIndex].incomingLinks = [link]);
	});
}

export function createGraphData(convertedData: any) {
	// do deep copy
	const nodes: any = JSON.parse(JSON.stringify(convertedData.nodes));
	const links: any = JSON.parse(JSON.stringify(convertedData.links));
	const flattenNodes: any = flattenNode(nodes);

	assignParentReference(nodes);

	assignLinkReference(links, flattenNodes);

	const graphData: any = {
		nodes,
		links,
		flattenNodes,
	};
	return graphData;
}
