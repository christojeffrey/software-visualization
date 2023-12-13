export const rawToGraphDataConverter = (rawData: any) => {
	const nodes = rawData.elements.nodes.map((node: any) => {
		return {
			id: node.data.id
		};
	});

	const links = rawData.elements.edges.map((link: any) => {
		return {
			source: link.data.source,
			target: link.data.target
		};
	});

	return {
		nodes,
		links,
		groups: []
	};
};
