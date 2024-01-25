import * as d3 from 'd3';

export function cleanCanvas(svgElement: any, simulations: any) {
	// remove all simulations and forces
	simulations.forEach((simulation: any) => {
		simulation.stop();
	});

	// remove all the elements
	const svg = d3.select(svgElement).selectChildren().remove();
}
