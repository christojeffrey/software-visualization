import * as d3 from 'd3';

export function cleanCanvas(svgElement: any, simulations: any) {
	console.log('clean canvas');
	d3.select(svgElement).selectChildren().remove();
}
