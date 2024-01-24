import { doCollapseVertices } from './collapse-vertices';

export function filter(config: any, graphData: any) {
	console.log('filter');
	console.log(config);
	console.log(graphData);

	// handle collapsed vertices
	doCollapseVertices(config, graphData);
}
