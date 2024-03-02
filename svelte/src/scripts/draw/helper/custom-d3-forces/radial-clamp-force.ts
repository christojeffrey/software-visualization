import type { Force } from 'd3';
import type { GraphDataNode, GraphDataEdge } from '$types';

/**
 * Fixes all nodes on the circumference a circle defined by parameters.
 *
 * Unlike the built-in radial force, it fixes nodes rather than moving them,
 * and allows for the circle coordinates/radius to change.
 *
 * @param x function returning the x-coordinate of the circle center
 * @param y function returning the y-coordinate of the circle center
 * @param r function returning the radius the circle
 *
 *
 */
export function radialClampForce(r: () => number): Force<GraphDataNode, undefined> {
	let nodes: GraphDataNode[];
	// Unused, might want to set this to false after dragging a node.
	// Might also want to have this set to false at the start of a simluation.
	const clamp = true;

	function force(alpha: number) {
		const cx = r();
		const cy = r();
		const radius = r();
		if (!Number.isNaN(cx) && !Number.isNaN(cy) && !Number.isNaN(radius)) {
			nodes.forEach((node) => {
				if (node.x && node.y) {
					const dx = node.x - cx;
					const dy = node.y - cy;
					const distance = Math.sqrt(dx ** 2 + dy ** 2);
					if (clamp) {
						node.x = cx + (dx / distance) * radius;
						node.y = cy + (dy / distance) * radius;
					} else if (node.vx && node.vy) {
						node.vx += (cx + (dx / distance) * radius - node.x) * alpha;
						node.vy += (cy + (dy / distance) * radius - node.y) * alpha;
					}
				}
			});
		}
	}

	force.initialize = function (_nodes: GraphDataNode[]) {
		nodes = _nodes;
	};

	return force;
}
