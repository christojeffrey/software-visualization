import { rawToGraphDataConverter } from './converter';
import type { ConfigType, GraphDataType } from './types';
import { exampleData, simpleData } from '$lib/graph-data';

export function dataSetter(config: ConfigType, graphData: GraphDataType) {
	const convertedData = rawToGraphDataConverter(simpleData);

	if (config.useRawData === true) {
		// raw
		graphData.nodes = convertedData.nodes;
		graphData.links = convertedData.links;
		graphData.groups = convertedData.groups;
		graphData.groupLinks = [];
		graphData.groupButtons = [];
	} else {
		// example
		graphData.nodes = exampleData.nodes;
		graphData.links = exampleData.links;
		graphData.groups = Object.assign([], exampleData.groups);
		graphData.groupLinks = [];
		graphData.groupButtons = [];
	}
}
