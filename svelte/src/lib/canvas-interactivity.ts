import type { ConfigType, GraphElementsType } from './types';
import { SVGSIZE, SVGMARGIN } from '$lib/constants';

import * as d3 from 'd3';
import { dragEndedNode, dragStartedNode, draggedNode } from '$lib';

export function addCanvasInteractivity(
	graphElements: GraphElementsType,
	simulation: any,
	config: ConfigType,
	svg: any
) {
	graphElements.nodes.call(
		d3
			.drag<any, any>()
			.on('start', function (this: any, e) {
				// To combine element drag and pan
				d3.select(this).raise();
				dragStartedNode(e, simulation);
			})
			.on('drag', (e) => draggedNode(e, simulation))
			.on('end', (e) => dragEndedNode(e, simulation, config))
	);

	// Add zoom handler
	svg.call(
		d3
			.zoom()
			.extent([
				[0, 0],
				[SVGSIZE + SVGMARGIN * 2, SVGSIZE + SVGMARGIN * 2]
			])
			.scaleExtent([1, 8])
			.on('zoom', ({ transform }) => {
				const elements = Object.keys(graphElements);
				elements.forEach((e: string) =>
					graphElements[e as keyof GraphElementsType]?.attr('transform', transform)
				);
			})
	);
}
