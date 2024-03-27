import { EdgeType } from '../../../types';

const LINK_COLOR_POOL = [
	['#e5f5f9', '#2ca25f'],
	['#e0ecf4', '#8856a7'],
	['#bebada', '#D6DABA'],
	['#e0f3db', '#43a2ca'],
	['#e7e1ef', '#dd1c77'],
	['#ffffe5', '#662506'],
	['#ffffe5', '#004529']
];

export function setupGradient(svg: d3.Selection<SVGGElement, unknown, null, undefined>) {
	// Use defs to store gradient definitions
	const defs = svg.append('defs');
	const poolLength = LINK_COLOR_POOL.length;
	Object.keys(EdgeType).forEach((edgeType, idx) => {
		const gradient = defs.append('linearGradient').attr('id', `${edgeType}Gradient`);
		// First color stop
		gradient
			.append('stop')
			.attr('offset', '0%')
			.attr('class', 'start')
			.attr('stop-color', LINK_COLOR_POOL[idx % poolLength][0])
			.attr('stop-opacity', 1);
		// Second color stop
		gradient
			.append('stop')
			.attr('offset', '100%')
			.attr('class', 'end')
			.attr('stop-color', LINK_COLOR_POOL[idx % poolLength][1])
			.attr('stop-opacity', 1);
	});
	// Setup the reversed gradient so the direction is correct when it's mirrored for x=0
	Object.keys(EdgeType).forEach((edgeType, idx) => {
		const gradient = defs.append('linearGradient').attr('id', `${edgeType}GradientReversed`);
		// First color stop
		gradient
			.append('stop')
			.attr('offset', '0%')
			.attr('class', 'start')
			.attr('stop-color', LINK_COLOR_POOL[idx % poolLength][1])
			.attr('stop-opacity', 1);
		// Second color stop
		gradient
			.append('stop')
			.attr('offset', '100%')
			.attr('class', 'end')
			.attr('stop-color', LINK_COLOR_POOL[idx % poolLength][0])
			.attr('stop-opacity', 1);
	});
}
