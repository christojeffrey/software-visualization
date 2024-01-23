import type { ConvertedData } from "../converter";

export interface ConfigInterface {
	linkLifting: {
		id: string,
		depth: number,
	}[],
}

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

export function filter(_config: ConfigInterface, convertedData: ConvertedData) {
	const nodes = convertedData.nodes;
	const links = convertedData.links;
	const flattenNodes = flattenNode(nodes);

	assignParentReference(nodes);

	// Dependency lifting
	const liftedLinks = links.flatMap(link => {
		link.source
	});

	const graphData = {
		nodes,
		links,
		flattenNodes
	};
	return graphData;
}
