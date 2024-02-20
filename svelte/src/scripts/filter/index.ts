import type { ConfigInterface, GraphData } from '../../types';
import { doCollapseNodes } from './collapse-nodes';
import { liftDependencies } from './lift-edges';

export function filter(config: ConfigInterface, graphData: GraphData) {
	// handle dependency lifting
	graphData.links = liftDependencies(config, graphData);

	// handle collapsed vertices
	doCollapseNodes(config, graphData);
}
