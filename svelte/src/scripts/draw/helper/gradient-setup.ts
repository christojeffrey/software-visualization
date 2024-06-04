import {EdgeType, type GraphDataEdge} from '../../../types';
import * as d3 from 'd3';

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

			const idSuffix = `${i < 2 ? '' : 'Vertical'}${i % 2 == 0 ? '' : 'Reversed'}`;

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

/**
 *
 * @returns A dictionary of interpolators for each edge type
 */
export function interpolateColor(): {[key: string]: (t: number) => string} {
	const poolLength = LINK_COLOR_POOL.length;
	const result: {[key: string]: (t: number) => string} = {};
	Object.keys(EdgeType).forEach((edgeType, idx) => {
		result[edgeType] = d3.interpolateRgb(
			LINK_COLOR_POOL[idx % poolLength][0],
			LINK_COLOR_POOL[idx % poolLength][1],
		);
	});
	return result;
}

export type CustomPoint = {x: number, y: number, t: number};
export type Quad = {t: number, 0: CustomPoint, 1: CustomPoint, 2: CustomPoint, 3: CustomPoint};

// Sample the SVG path uniformly with the specified precision.
export function samples(
	path: SVGPathElement,
	precision: number,
) {
	if (path === null) return [];
	let i = 0;
	const n = path!.getTotalLength()
	const t = [0],
		dt = precision;
	while ((i += dt) < n) t.push(i);
	t.push(n);
	return t.map(function (t) {
		const p = path!.getPointAtLength(t),
			a: CustomPoint = {x: p.x, y: p.y, t: t};
		a.t = t / n;
		return a;
	});
}

// Compute quads of adjacent points [p0, p1, p2, p3].
export function quads(points: CustomPoint[]): Quad[] {
	return d3.range(points.length - 1).map(function (i) {
		const a = {0: points[i - 1], 1: points[i], 2: points[i + 1], 3: points[i + 2], t: 0};
		a.t = (points[i].t + points[i + 1].t) / 2;
		return a;
	});
}

// Compute stroke outline for segment p12.
export function lineJoin(p0: CustomPoint, p1: CustomPoint, p2: CustomPoint, p3: CustomPoint, width: number) {
	const u12 = perp(p1, p2),
		r = width / 2
	let	a = [p1.x + u12[0] * r, p1.y + u12[1] * r],
		b = [p2.x + u12[0] * r, p2.y + u12[1] * r],
		c = [p2.x - u12[0] * r, p2.y - u12[1] * r],
		d = [p1.x - u12[0] * r, p1.y - u12[1] * r];

	if (p0) {
		// clip ad and dc using average of u01 and u12
		const u01 = perp(p0, p1),
			e = [p1.x + u01[0] + u12[0], p1.y + u01[1] + u12[1]];
		a = lineIntersect(p1, e, a, b);
		d = lineIntersect(p1, e, d, c);
	}

	if (p3) {
		// clip ab and dc using average of u12 and u23
		const u23 = perp(p2, p3),
			e = [p2.x+ u23[0] + u12[0], p2.y + u23[1] + u12[1]];
		b = lineIntersect(p2, e, a, b);
		c = lineIntersect(p2, e, d, c);
	}

	return 'M' + a + 'L' + b + ' ' + c + ' ' + d + 'Z';
}

// Compute intersection of two infinite lines ab and cd.
export function lineIntersect(a: CustomPoint, b: number[], c: number[], d: number[]): [number, number] {
	const x1 = c[0],
		x3 = a.x,
		x21 = d[0] - x1,
		x43 = b[0] - x3,
		y1 = c[1],
		y3 = a.y,
		y21 = d[1] - y1,
		y43 = b[1] - y3,
		ua = (x43 * (y1 - y3) - y43 * (x1 - x3)) / (y43 * x21 - x43 * y21);
	return [x1 + ua * x21, y1 + ua * y21];
}

// Compute unit vector perpendicular to p01.
export function perp(p0: CustomPoint, p1: CustomPoint): [number, number] {
	const u01x = p0.y - p1.y,
		u01y = p1.x - p0.x,
		u01d = Math.sqrt(u01x * u01x + u01y * u01y);
	return [u01x / u01d, u01y / u01d];
}
