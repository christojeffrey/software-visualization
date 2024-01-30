import type { ConfigInterface } from '../../types';
import { doCollapseVertices } from './collapse-vertices';
import { liftDependencies } from './lift-edges';

export function filter(config: ConfigInterface, graphData: any) {
	// handle dependency lifting
	graphData.links = liftDependencies(config, graphData);

	// handle collapsed vertices
	doCollapseVertices(config, graphData);
}
