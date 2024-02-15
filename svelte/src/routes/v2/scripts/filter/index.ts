import type { ConfigInterface, GraphData } from '../../types';
import { doCollapseVertices } from './collapse-vertices';
import { liftDependencies } from './lift-edges';

export function filter(config: ConfigInterface, graphData: GraphData) {
	// handle dependency lifting
	graphData.links = liftDependencies(config, graphData);

	// handle collapsed vertices
	doCollapseVertices(config, graphData);
}
