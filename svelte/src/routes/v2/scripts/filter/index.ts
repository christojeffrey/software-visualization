import { doCollapseVertices } from './collapse-vertices';
import { liftDependencies } from './lift-edges';

export function filter(config: any, graphData: any) {
	// handle collapsed vertices
	doCollapseVertices(config, graphData);

	// handle dependency lifting
	graphData.links = liftDependencies(config, graphData);
}
