import type { GraphDataEdge, GraphDataNode } from '$types';
import type { Simulation, SimulationLinkDatum, SimulationNodeDatum } from 'd3';

function index(d: SimulationNodeDatum) {
	return d.index;
}

export function customForceLink(
	links: GraphDataEdge[]
): d3.ForceLink<d3.SimulationNodeDatum, d3.SimulationLinkDatum<GraphDataNode>> {
	let id = index,
		nodes: GraphDataNode[],
		iterations = 1;

	const strength = 0,
		distance = 10;

	if (links == null) links = [];

	function force() {
		for (let k = 0, n = links?.length; k < iterations; ++k) {
			for (let i = 0, link, source, target, x, y, l; i < n; ++i) {
				link = links[i];
				console.log(link)
				source = link.source;
				target = link.target;
				x = target.x - source.x;
				y = target.y - source.y;
				l = Math.sqrt(x * x + y * y);
				x *= l;
				y *= l;
			}
		}
	}

	function initialize() {
		if (!nodes) return;

		console.log('initialized')
	}

	force.initialize = function (_nodes: GraphDataNode[]) {
		nodes = _nodes;
		initialize();
	};

	force.links = function (_: GraphDataEdge[]) {
		return arguments.length ? ((links = _), initialize(), force) : links;
	};

	force.id = function (_: unknown) {
		return arguments.length
			? ((id = _ as (d: SimulationNodeDatum) => number | undefined), force)
			: id;
	};

	force.iterations = function (_: unknown) {
		return arguments.length ? ((iterations = +(_ as number)), force) : iterations;
	};

	force.strength = function (_: unknown) {
		return strength;
	};

	force.distance = function (_: unknown) {
		return distance;
	};

	return force;
}
