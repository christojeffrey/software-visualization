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

function assignOutgoingIncomingLinksAndOriginalLiftedSourceTargetReference(
	links: ConvertedEdge[],
	flattenNodes: ConvertedNode[],
	graphDataFlattenNodes: GraphDataNode[]
) {
	flattenNodes.forEach((node) => {
		//@ts-expect-error Type of this variable will change later
		node.incomingLinks = [];
		//@ts-expect-error same
		node.outgoingLinks = [];
	});
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

		const {oldestSource, oldestTarget} = leastCommonAncestor(nodeSource, nodeTarget);

		graphDataLink.liftedSource = oldestSource;
		graphDataLink.liftedTarget = oldestTarget;

		oldestSource.outgoingLinksLifted.push(graphDataLink);
		oldestTarget.incomingLinksLifted.push(graphDataLink);
	});
	return graphDataLinks;
}

function leastCommonAncestor(source: GraphDataNode, target: GraphDataNode) {
	function findAncestors(node: GraphDataNode): GraphDataNode[] {
		return node.parent ? [...findAncestors(node.parent), node] : [node];
	}

	const a1 = findAncestors(source);
	const a2 = findAncestors(target);

	let i = a1.findIndex((n, i) => a2[i] !== n);
	if (i === -1) {
		i = Math.min(a1.length, a2.length)-1;
	}

	return {
		oldestSource: a1[i]!,
		oldestTarget: a2[i]!,
	}
}

export function createGraphData(convertedData: ConvertedData): GraphData {
	// do deep copy. TODO: now that we don't need to preserve previous graphData, we don't need to copy it.
	const nodes: ConvertedNode[] = JSON.parse(JSON.stringify(convertedData.nodes));
	const flattenNodes = flattenNode<ConvertedNode>(nodes);

	const links: ConvertedEdge[] = JSON.parse(JSON.stringify(convertedData.links));

	const graphDataNodes = nodes as GraphDataNode[];
	const graphDataFlattenNodes = flattenNodes as GraphDataNode[];

	assignParentReference(graphDataNodes);

	// setup to be assigned
	graphDataFlattenNodes.forEach((node) => {
		// all are reference reference
		node.outgoingLinks = [];
		node.originalOutgoingLinks = [];
		node.incomingLinks = [];
		node.originalIncomingLinks = [];
		node.outgoingLinksLifted = [];
		node.incomingLinksLifted = [];
	});

	const graphDataLinks = assignOutgoingIncomingLinksAndOriginalLiftedSourceTargetReference(
		links,
		flattenNodes,
		graphDataFlattenNodes
	);

	// create nodesDict
	const nodesDict: { [id: string]: GraphDataNode } = {};
	graphDataFlattenNodes.forEach((node) => {
		nodesDict[node.id] = node;
	});
	const graphData: GraphData = {
		nodes: graphDataNodes,
		links: graphDataLinks,
		flattenNodes: graphDataFlattenNodes, // flattenNodes can be derived from nodes
		nodesDict // nodesDict can be derived from nodes
		// both put here to reduce calculation time
	};

	return graphData;
}

export default createGraphData;
