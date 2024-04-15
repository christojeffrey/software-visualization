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
			node.originalMembers = node.members;
		}
	});
}

function assignOutgoingAndIncomingLinksAndOriginalSourceAndTargetReference(
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
	const graphDataLinks = links as unknown as GraphDataEdge[];
	links.forEach((link) => {
		const sourceIndex = flattenNodes.findIndex((node) => node.id === link.source);
		const targetIndex = flattenNodes.findIndex((node) => node.id === link.target);

		const graphDataLink = link as unknown as GraphDataEdge;
		const nodeSource = graphDataFlattenNodes[sourceIndex];
		const nodeTarget = graphDataFlattenNodes[targetIndex];
		nodeSource.outgoingLinks.push(graphDataLink);
		nodeSource.originalOutgoingLinks.push(graphDataLink);

		nodeTarget.incomingLinks.push(graphDataLink);
		nodeTarget.originalIncomingLinks.push(graphDataLink);

		// Populate the source and target reference
		graphDataLink.source = nodeSource;
		graphDataLink.target = nodeTarget;
		
		// assign original source and target
		graphDataLink.originalSource = nodeSource;
		graphDataLink.originalTarget = nodeTarget;
	});
	return graphDataLinks;
}

export function createGraphData(convertedData: ConvertedData): GraphData {
	// do deep copy
	const nodes: ConvertedNode[] = JSON.parse(JSON.stringify(convertedData.nodes));
	const flattenNodes = flattenNode<ConvertedNode>(nodes);

	const links: GraphDataEdge[] = JSON.parse(JSON.stringify(convertedData.links));

	const graphDataNodes = nodes as GraphDataNode[];
	const graphDataFlattenNodes = flattenNodes as GraphDataNode[];

	assignParentReference(graphDataNodes);

	// add originalIncoming and outgoingLinks
	graphDataFlattenNodes.forEach((node) => {
		node.outgoingLinks = [];
		node.originalOutgoingLinks = [];
		node.incomingLinks = [];
		node.originalIncomingLinks = [];
	});

	// Initialize links
	links.forEach(link => {
		link.routing = [];
	})

	const graphDataLinks = assignOutgoingAndIncomingLinksAndOriginalSourceAndTargetReference(
		//@ts-expect-error GraphDataEdge is still a ConvertedEdge
		links,
		flattenNodes,
		graphDataFlattenNodes
	);

	const graphData: GraphData = {
		nodes: graphDataNodes,
		links: graphDataLinks,
		flattenNodes: graphDataFlattenNodes
	};
	return graphData;
}

export default createGraphData;
