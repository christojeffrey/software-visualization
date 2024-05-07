import type {GraphData, GraphDataEdge, GraphDataEdgeAfterLayout, GraphDataNode} from '$types';
import * as d3 from 'd3';
//@ts-expect-error Can'f find definitions for this
import {ShapeInfo, Intersection} from 'kld-intersections';

function isAncestor(node: GraphDataNode, presumedParent: GraphDataNode) {
	if (node.id === presumedParent.id) {
		return true;
	} else if (node.parent) {
		return isAncestor(node.parent, presumedParent);
	} else {
		return false;
	}
}

function getAbsPosition(node: GraphDataNode): {x: number; y: number} {
	if (node.parent) {
		const {x, y} = getAbsPosition(node.parent);
		return {
			x: node.x! + x,
			y: node.y! + y,
		};
	} else {
		return {x: 0, y: 0};
	}
}

export function runMetrics() {
	// Get elements from canvas
	const pathSelection = d3.select('svg #canvas').selectAll('path') as d3.Selection<
		SVGPathElement,
		GraphDataEdgeAfterLayout,
		HTMLElement,
		unknown
	>;
	const nodeSelection = d3.select('svg #canvas').selectAll('.nodes > rect') as d3.Selection<
		SVGCircleElement,
		GraphDataNode,
		HTMLElement,
		unknown
	>;

	// Get line intersections
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const linePairs: any[] = [];
	pathSelection.each(function (_, i) {
		const p1 = ShapeInfo.path(this.getAttribute('d'));
		pathSelection.each(function (_, j) {
			if (i < j) {
				const p2 = ShapeInfo.path(this.getAttribute('d'));
				const intersect = Intersection.intersect(p1, p2);
				linePairs.push(intersect);
			}
		});
	});
	const lineIntersections = linePairs.filter(i => i.status !== 'No Intersection');

	// Get line-node intersections
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const lineRectPairs: any[] = [];
	pathSelection.each(function (line) {
		const lineShape = ShapeInfo.path(this.getAttribute('d'));
		nodeSelection.each(function (node) {
			if (isAncestor(line.target, node) || isAncestor(line.source, node)) {
				undefined;
			} else {
				const {x, y} = getAbsPosition(node);
				const rectShape = ShapeInfo.rectangle({
					top: y,
					left: x,
					width: this.getAttribute('width'),
					height: this.getAttribute('height'),
				});
				lineRectPairs.push(Intersection.intersect(lineShape, rectShape));
			}
		});
	});
	const lineRectIntersections = lineRectPairs.filter(i => i.status !== 'No Intersection');

	// Get the average line length and the average deviation of this length
	const amountOfPaths = pathSelection.size();
	let totalLength = 0;
	pathSelection.each(function () {
		totalLength += this.getTotalLength();
	});
	const averageLength = totalLength / amountOfPaths;

	let totalDeviation = 0;
	pathSelection.each(function () {
		totalDeviation += Math.abs(this.getTotalLength() - averageLength);
	});
	const averageDeviation = totalDeviation / amountOfPaths;

	console.log(
		`Layout metrics \n
		There are ${amountOfPaths} lines.
		Lines deviate ${averageDeviation} on average (total ${totalDeviation})
		Lines are on average ${averageLength} long (total ${totalLength})
		Amount of line crossings:  ${lineIntersections.length}
		Amount of crossings between lines and unrelated nodes: ${lineRectIntersections.length}
		`,
	);
}
