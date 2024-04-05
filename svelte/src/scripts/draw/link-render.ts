import { notNaN, toHTMLToken } from '$helper';
import type {
	DrawSettingsInterface,
	GraphDataEdge,
	GraphDataNode,
	SimpleNodesDictionaryType
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
	drawSettings: DrawSettingsInterface
) {
	/** Returns the absolute x and y coordinates of a GraphDataNode */
	function getAbsCoordinates(node?: GraphDataNode): { x: number; y: number } {
		if (node) {
			const { x, y } = getAbsCoordinates(node.parent);
			return {
				x: notNaN(node.x! + x),
				y: notNaN(node.y! + y)
			};
		} else {
			return { x: 0, y: 0 };
		}
	}

	/** Returns trus if atan2 is between (-3PI/4, -PI/4), (PI/4, 3PI/4) */
	function isVertical(x1: number, x2: number, y1: number, y2: number) {
		const radial = Math.atan2(y2 - y1, x2 - x1);
		return (
			(radial > (Math.PI * -3) / 4 && radial < Math.PI / -4) ||
			(radial > Math.PI / 4 && radial > (3 * Math.PI) / 4)
		);
	}

	/** Returns path coordinates, and annotates the line-data with extra info */
	function annotateLine(l: GraphDataEdge) {
		const source = typeof l.source === 'string' ? nodesDictionary[l.source] : l.source;
		const target = typeof l.target === 'string' ? nodesDictionary[l.target] : l.target;
		const s = getAbsCoordinates(source);
		const t = getAbsCoordinates(target);
		l.isGradientVertical = isVertical(s.x, t.x, s.y, t.y);
		l.gradientDirection = l.isGradientVertical ? s.y < t.y : s.x > t.x;
		l.absoluteCoordinates = [s, t];
		return `M${s.x} ${Math.abs(s.y - 35) < 0.3 ? 35.5 : s.y} L${t.x} ${t.y}`;
	}

	// Enter
	linkCanvas
		.selectAll('path')
		.data(links, (l) => (l as GraphDataEdge).id)
		.enter()
		.append('path')
		.attr('id', (l) => `line-${toHTMLToken(l.id)}`)
		.attr('d', annotateLine)
		.attr(
			'stroke',
			(l) =>
				`url(#${toHTMLToken(l.type)}Gradient${l.isGradientVertical ? 'Vertical' : ''}${
					l.gradientDirection ? 'Reversed' : ''
				})`
		)
		.attr('fill', 'transparent');

	// Update
	(
		linkCanvas.selectAll('path') as d3.Selection<
			SVGPathElement,
			GraphDataEdge,
			SVGGElement,
			unknown
		>
	)
		.attr('d', annotateLine)
		.attr(
			'stroke',
			(l) =>
				`url(#${toHTMLToken(l.type)}Gradient${l.isGradientVertical ? 'Vertical' : ''}${
					l.gradientDirection ? 'Reversed' : ''
				})`
		)
		.attr('display', (l) => (drawSettings.shownEdgesType.get(l.type) ? 'inherit' : 'none'));

	// No exit, since we don't get all edges when updating

	// Labels
	if (drawSettings.showEdgeLabels) {
		linkCanvas
			.selectAll('text')
			.data(links, (l) => (l as GraphDataEdge).id)
			.enter()
			.append('text')
			.attr('class', 'link-label')
			.attr('text-anchor', 'middle')
			.attr('dominant-baseline', 'middle')
			.attr('fill', 'black')
			.attr('font-size', '10px')
			.text((l) => l.id);

		(linkCanvas.selectAll('text') as d3.Selection<d3.BaseType, GraphDataEdge, SVGGElement, unknown>)
			.attr('x', (l) => (l.absoluteCoordinates![0].x + l.absoluteCoordinates![1].x) / 2)
			.attr('y', (l) => (l.absoluteCoordinates![0].y + l.absoluteCoordinates![1].y) / 2);
	} else if (!drawSettings.showEdgeLabels) {
		linkCanvas.selectAll('text').remove();
	}

	// Cleanup, just to be sure:
	links.forEach((l) => {
		l.absoluteCoordinates = undefined;
		l.gradientDirection = undefined;
	});
}
