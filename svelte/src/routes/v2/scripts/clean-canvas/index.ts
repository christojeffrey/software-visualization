import * as d3 from 'd3';
import type { GraphDataNode } from '../../types';

export function cleanCanvas(
	svgElement: SVGElement,
	simulations: d3.Simulation<GraphDataNode, undefined>[]
) {
	// remove all simulations and forces
	simulations.forEach((simulation) => {
		simulation.stop();
	});

	// remove all the elements
	d3.select(svgElement).selectChildren().remove();
}
