import { doCollapseVertices } from './collapse-vertices';
import { liftDependencies } from './lift-edges';

export function filter(config: any, graphData: any) {
	console.log('filter');
	console.log(config);
	console.log(graphData);

	// handle collapsed vertices
	doCollapseVertices(config, graphData);

	// handle dependency lifting
	graphData.links = liftDependencies(config, graphData);
}
