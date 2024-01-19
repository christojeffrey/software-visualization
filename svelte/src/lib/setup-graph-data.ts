import type { GraphDataType } from './types';

export function setupGraphData(convertedData: any) {
	const graphData: GraphDataType = {
		nodes: [],
		links: [],
		groups: [],
		groupLinks: [],
		groupButtons: []
	};
	graphData.nodes = convertedData.nodes;
	graphData.links = convertedData.links;
	graphData.groups = convertedData.groups;
	graphData.groupLinks = [];
	graphData.groupButtons = [];
	return graphData;
}
