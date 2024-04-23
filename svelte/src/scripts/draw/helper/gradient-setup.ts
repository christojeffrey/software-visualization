import {EdgeType} from '../../../types';

const LINK_COLOR_POOL = [
	['#e5f5f9', '#2ca25f'],
	['#e0ecf4', '#8856a7'],
	['#bebada', '#D6DABA'],
	['#e0f3db', '#43a2ca'],
	['#e7e1ef', '#dd1c77'],
	['#ffffe5', '#662506'],
	['#ffffe5', '#004529'],
];

export function setupGradient(svg: d3.Selection<SVGGElement, unknown, null, undefined>) {
	// Use defs to store gradient definitions
	const defs = svg.append('defs');
	const poolLength = LINK_COLOR_POOL.length;
	Object.keys(EdgeType).forEach((edgeType, idx) => {
		for (let i = 0; i < 4; i++) {
			// If i > 2, handle vertical gradient. Reversed if i % 2 == 0. Reversed means the x1 or y2 equals 1
			const x1 = i < 2 ? i % 2 : 0;
			const y1 = i < 2 ? 0 : (i + 1) % 2;
			const x2 = i < 2 ? (i + 1) % 2 : 0;
			const y2 = i < 2 ? 0 : i % 2;

			const idSuffix = `${i < 2 ? '' : 'Vertical'}${i % 2 == 0 ? '' : 'Reversed'}`

			const gradient = defs
				.append('linearGradient')
				.attr('id', `${edgeType}Gradient${idSuffix}`)
				.attr('x1', x1)
				.attr('y1', y1)
				.attr('x2', x2)
				.attr('y2', y2);
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
		}
	});
}
