import {distance, geometricMean, notNaN, toHTMLToken} from '$helper';
import {getAbsCoordinates} from '$helper/graphdata-helpers';
import type {
	DrawSettingsInterface,
	EdgeRoutingOrigin,
	GraphDataEdge,
	GraphDataNode,
	GraphDataNodeDrawn,
	SimpleNodesDictionaryType,
} from '$types';

/**
 * Render and or update all given links
 * Requires access to all nodes via a dictionary, since links might not contain a reference to their source/target
 * Binds the data
 */
export function renderLinks(
	links: GraphDataEdge[],
	nodesDictionary: SimpleNodesDictionaryType,
	linkCanvas: d3.Selection<SVGGElement, unknown, null, undefined>,
	drawSettings: DrawSettingsInterface,
) {
	function calculateIntersection(
		source: {x: number; y: number; width: number; height: number},
		target: {x: number; y: number; width: number; height: number},
	) {
		const dx = target.x - source.x;
		const dy = target.y - source.y;
		const angle = Math.atan2(dy, dx);

		// Determine intersection with source rectangle
		let x, y;
		if (Math.abs(dx) * source.height > Math.abs(dy) * source.width) {
			// Intersection is with left or right edge of the rectangle
			x = dx > 0 ? source.width / 2 : -source.width / 2;
			y = x * Math.tan(angle);
		} else {
			// Intersection is with top or bottom edge of the rectangle
			y = dy > 0 ? source.height / 2 : -source.height / 2;
			x = y / Math.tan(angle);
		}
		const intersectionSource = {x: source.x + x, y: source.y + y};

		// Determine intersection with target rectangle
		if (Math.abs(dx) * target.height > Math.abs(dy) * target.width) {
			// Intersection is with left or right edge of the rectangle
			x = dx > 0 ? -target.width / 2 : target.width / 2;
			y = x * Math.tan(angle);
		} else {
			// Intersection is with top or bottom edge of the rectangle
			y = dy > 0 ? -target.height / 2 : target.height / 2;
			x = y / Math.tan(angle);
		}
		const intersectionTarget = {x: target.x + x, y: target.y + y};

		return {intersectionSource, intersectionTarget};
	}

	/** Returns path coordinates, and annotates the line-data with extra info.
	 *
	 * Routes edges through edge port
	 */
	function annotateLinePorts(l: GraphDataEdge) {
		const source = (
			typeof l.source === 'string' ? nodesDictionary[l.source] : l.source
		) as GraphDataNodeDrawn;
		const target = (
			typeof l.target === 'string' ? nodesDictionary[l.target] : l.target
		) as GraphDataNodeDrawn;

		l.gradientDirection = source.x! > target.x!;

		/** List of all coordinates the path will need to go through */
		let coordinates = [
			...l.routing.map(point => {
				const {x, y} = getAbsCoordinates(point.origin);
				return {
					x: x + point.x,
					y: y + point.y,
				};
			}),
		];

		if (coordinates.length < 2) {
			coordinates = [source, target];
		}

		l.labelCoordinates = [coordinates[0], coordinates[1]];

		// TODO find right coordinates (Put on the longest stretch)
		let result = `M ${coordinates[0].x} ${coordinates[0].y}`;

		coordinates.forEach(({x, y}) => {
			result += `L ${x} ${y} `;
		});

		return result;
	}

	/** Returns path coordinates, and annotates the line-data with extra info
	 *
	 * (No edge ports)
	 */
	function annotateLine(l: GraphDataEdge) {
		const source = (
			typeof l.source === 'string' ? nodesDictionary[l.source] : l.source
		) as GraphDataNodeDrawn;
		const target = (
			typeof l.target === 'string' ? nodesDictionary[l.target] : l.target
		) as GraphDataNodeDrawn;

		const sourceAbsoluteCoordinate = getAbsCoordinates(source);
		const targetAbsoluteCoordinate = getAbsCoordinates(target);

		const {intersectionSource: s, intersectionTarget: t} = calculateIntersection(
			{
				x: sourceAbsoluteCoordinate.x,
				y: sourceAbsoluteCoordinate.y,
				width: source.width!,
				height: source.height!,
			},
			{
				x: targetAbsoluteCoordinate.x,
				y: targetAbsoluteCoordinate.y,
				width: target.width!,
				height: target.height!,
			},
		);

		l.gradientDirection = s.x! > t.x!;
		l.labelCoordinates = [s, t];

		return `M ${s.x} ${s.y} L ${t.x} ${t.y} `;
	}

	// Enter
	linkCanvas
		.selectAll('path')
		.data(links, l => (l as GraphDataEdge).id)
		.enter()
		.append('path')
		.attr('id', l => `line-${toHTMLToken(l.id)}`)
		.attr('d', l => (drawSettings.showEdgePorts ? annotateLinePorts(l) : annotateLine(l)))
		.attr(
			'stroke',
			l => `url(#${toHTMLToken(l.type)}Gradient${l.gradientDirection ? 'Reversed' : ''})`,
		)
		.attr('fill', 'transparent')
		.on('mouseover', (e, d) => {});

	// Update
	(
		linkCanvas.selectAll('path') as d3.Selection<
			SVGPathElement,
			GraphDataEdge,
			SVGGElement,
			unknown
		>
	)
		.attr('d', annotateLinePorts)
		.attr(
			'stroke',
			l => `url(#${toHTMLToken(l.type)}Gradient${l.gradientDirection ? 'Reversed' : ''})`,
		)
		.attr('display', l => (drawSettings.shownEdgesType.get(l.type) ? 'inherit' : 'none'));

	// No exit, since we don't get all edges when updating

	// Labels
	if (drawSettings.showEdgeLabels) {
		linkCanvas
			.selectAll('text')
			.data(links, l => (l as GraphDataEdge).id)
			.enter()
			.append('text')
			.attr('class', 'link-label')
			.attr('text-anchor', 'middle')
			.attr('dominant-baseline', 'middle')
			.attr('fill', 'black')
			.attr('font-size', '10px')
			.text(l => l.id);

		(linkCanvas.selectAll('text') as d3.Selection<d3.BaseType, GraphDataEdge, SVGGElement, unknown>)
			.attr('x', l => (l.labelCoordinates![0].x + l.labelCoordinates![1].x) / 2)
			.attr('y', l => (l.labelCoordinates![0].y + l.labelCoordinates![1].y) / 2);
	} else if (!drawSettings.showEdgeLabels) {
		linkCanvas.selectAll('text').remove();
	}

	// Cleanup, just to be sure:
	links.forEach(l => {
		l.labelCoordinates = undefined;
		l.gradientDirection = undefined;
	});
}
