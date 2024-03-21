import type {
	ConvertedData,
	ConvertedEdge,
	ConvertedNode,
	GraphData,
	GraphDataEdge,
	GraphDataNode
} from '../../types';
import { flattenNode } from '$helper';

// HELPER FUNCTIONS
function assignParentReference(nodes: GraphDataNode[]) {
	nodes.forEach((node, _index, _arr) => {
		if (node.members) {
			node.members.forEach((_, index, arr) => {
				arr[index].parent = node;
			});
			assignParentReference(node.members);
		}
	});
}

function assignLinkReference(
	links: ConvertedEdge[],
	flattenNodes: ConvertedNode[],
	graphDataFlattenNodes: GraphDataNode[]
) {
	flattenNodes.forEach(node => {
		//@ts-expect-error Type of this variable will change later
		node.incomingLinks = [];
		//@ts-expect-error same
		node.outgoingLinks = [];
	})
	links.forEach((link) => {
		const sourceIndex = flattenNodes.findIndex((node) => node.id === link.source);
		const targetIndex = flattenNodes.findIndex((node) => node.id === link.target);

		const graphDataLink = link as unknown as GraphDataEdge;
		graphDataFlattenNodes[sourceIndex].outgoingLinks?.push(graphDataLink);
		graphDataFlattenNodes[targetIndex].incomingLinks?.push(graphDataLink);
	});
}

export function createGraphData(convertedData: ConvertedData): GraphData {
	// do deep copy
	const nodes: ConvertedNode[] = JSON.parse(JSON.stringify(convertedData.nodes));
	const flattenNodes = flattenNode<ConvertedNode>(nodes);

	const links: ConvertedEdge[] = JSON.parse(JSON.stringify(convertedData.links));

	const graphDataNodes = nodes as GraphDataNode[];
	const graphDataFlattenNodes = flattenNodes as GraphDataNode[];

	assignParentReference(graphDataNodes);

	assignLinkReference(links, flattenNodes, graphDataFlattenNodes);

	const graphData: GraphData = {
		nodes: graphDataNodes,
		links: links as unknown as GraphDataEdge[],
		flattenNodes: graphDataFlattenNodes
	};
	return graphData;
}

export default createGraphData;
