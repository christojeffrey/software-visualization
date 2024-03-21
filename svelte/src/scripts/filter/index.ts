import type { ConfigInterface, GraphData, SimpleNodesDictionaryType } from '../../types';
import { doCollapseNodes } from './collapse-nodes';
import { liftDependencies } from './lift-edges';

export function filter(config: ConfigInterface, graphData: GraphData) {
	// handle dependency lifting
	let nodesDictionary: SimpleNodesDictionaryType;
	[graphData.links, nodesDictionary] = liftDependencies(config, graphData);

	// Initialize data
	graphData.nodesDict = {};
	graphData.flattenNodes.forEach(node => {
		node.incomingLinksLifted = [];
		node.outgoingLinksLifted = [];
		graphData.nodesDict[node.id] = node;
	});

	graphData.links.forEach(link => {
		link.liftedSource?.outgoingLinksLifted?.push(link);
		link.liftedTarget?.incomingLinksLifted.push(link);
	});

	// handle collapsed vertices
	doCollapseNodes(config, graphData);
}
