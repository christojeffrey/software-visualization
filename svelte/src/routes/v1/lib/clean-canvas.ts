import * as d3 from 'd3';

export function cleanCanvas(svgElement: any, simulation: any) {
	d3.select(svgElement).selectChildren().remove();
	// clear previous simulation
	if (simulation) {
		simulation.force('link', null);
		simulation.force('charge', null);
		simulation.force('x', null);
		simulation.force('y', null);
		simulation.force('groupLink', null);
		simulation.stop();
	}
}
