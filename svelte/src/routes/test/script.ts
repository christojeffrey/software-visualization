export function cleanCanvas(svgElement, simulations) {
	console.log('clean canvas');
}

export function converter(rawData) {
	console.log('converter');
	// hardcode for now

	return {
		nodes: [
			{ id: 'node1', level: 1 },
			{ id: 'node2', level: 1 },
			{
				id: 'node3',
				level: 1,
				members: [
					{
						id: 'member1',
						level: 2,
						members: [
							{
								id: 'anak1',
								level: 3
							},
							{
								id: 'anak2',
								level: 3
							}
						]
					},
					{
						id: 'member2',
						level: 2
					},
					{
						id: 'member3',
						level: 2
					}
				]
			}
		],
		links: [
			{ source: 'node1', target: 'node2' },
			{ source: 'node2', target: 'node3' },
			{ source: 'member2', target: 'member1' },
			{ source: 'member2', target: 'node1' }
		]
	};
}

// filter and helper

function assignParentReference(nodes) {
	// console.log(nodes);
	nodes.forEach((node, index, arr) => {
		if (node.members) {
			node.members.forEach((member, index, arr) => {
				arr[index].parent = node;
			});
			assignParentReference(node.members);
		}
	});
}

export function filter(config: any, convertedData: any) {
	console.log('filter');
	const nodes: any = convertedData.nodes;
	const links: any = convertedData.links;
	const flattenNodes: any = flattenNode(nodes);

	assignParentReference(nodes);
	console.log(nodes);

	const graphData: any = {
		nodes,
		links,
		flattenNodes
	};
	return graphData;
}

export function draw(svgElements, graphData, drawSettings) {
	console.log('draw');
	let simulations: any;

	return {
		simulations,
		svgElements
	};
}

function flattenNode(nodes) {
	//   reserse the order so that the parent is always at the end.
	let hasMember = false;
	let result = [];
	nodes.forEach((node) => {
		// order matter.
		if (node.members) {
			result.push(...flattenNode(node.members));
		}
		result.push(node);
	});
	return result;
}
