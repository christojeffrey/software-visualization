import type { Force } from 'd3';
import type { GraphDataNode, GraphDataEdge } from '$types';

/**
 * Creates a rectangular collison force across all nodes
 *
 * Assumes all nodes are rectangles, with a width and height property, rather than circles
 */
export function rectangleCollideForce(): Force<GraphDataNode, undefined> {
	let nodes: GraphDataNode[];
	const snap = false;

	interface point {
		x: number;
		y: number;
	}

	interface squareData {
		topleft: point;
		bottomright: point;
		middle: point;
		width: number;
		height: number;
	}

	function makeSquare(node: GraphDataNode): squareData {
		const topLeftx = node.x;
		const topLefty = node.y;
		return {
			topleft: {
				// Coordinates of top-left point
				x: topLeftx,
				y: topLefty
			},
			bottomright: {
				// Coordinates of bottomright point
				x: topLeftx + node.width,
				y: topLefty + node.height
			},
			middle: {
				x: topLeftx + 0.5 * node.width,
				y: topLefty + 0.5 * node.height
			},
			width: node.width,
			height: node.height
		};
	}

	function calcForceStrength(node1: squareData, node2: squareData, alpha: number) {
		return (
			((node1.width + node1.height) / (node1.width + node1.height + node2.width + node2.height)) *
			(1 + alpha) *
			20
		); // random magic number
	}

	// actual force calulation
	function force(alpha: number) {
		// Loop through all nodes for collision check
		for (let i = 0; i < nodes.length; i++) {
			for (let j = i + 1; j < nodes.length; j++) {
				if (nodes[i].x && nodes[i].y && nodes[j].x && nodes[j].y) {
					// Caclulate x and y position of the top-left and bottom-right corner of the node, and middle position.
					const node1 = makeSquare(nodes[i]);
					const node2 = makeSquare(nodes[j]);

					// Check for collision
					if (
						node1.bottomright.x >= node2.topleft.x &&
						node1.topleft.x <= node2.bottomright.x &&
						node1.bottomright.y >= node2.topleft.y &&
						node1.topleft.y <= node2.bottomright.y
					) {
						// We collided!
						if (snap) {
							// Snap stuff into place
							if (node2.middle.x < node1.middle.x) {
								nodes[i].x = nodes[j].x! + 0.5 * nodes[j].width + 0.5 * nodes[i].width;
							} else {
								nodes[j].x = nodes[i].x! + 0.5 * nodes[i].width + 0.5 * nodes[j].width;
							}

							if (node2.middle.y < node1.middle.y) {
								nodes[i].y = nodes[j].y! + 0.5 * nodes[j].height + 0.5 * nodes[i].height;
							} else {
								nodes[j].y = nodes[i].y! + 0.5 * nodes[i].height + 0.5 * nodes[j].height;
							}
						} else {
							// Use a force instead
							chargeForce(node1, node2, alpha, i, j, 20);
						}
					} else if (
						// We also want to try to keep a minimum distance. However, for performance reasons we don't do this on the innermost level
						nodes[i].level === nodes[j].level &&
						nodes[i].members!.length > 0 &&
						nodes[j].members!.length > 0
					) {
						const clearDistance = Math.max(
							Math.abs(node1.middle.x - node2.middle.x) - (node1.width + node2.width) / 2,
							Math.abs(node1.middle.y - node2.middle.y) - (node1.height + node2.height) / 2
						);

						chargeForce(node1, node2, alpha, i, j, 300 * (1 / clearDistance));
					}
				}
			}
		}
	}

	force.initialize = function (_nodes: GraphDataNode[]) {
		nodes = _nodes;
	};

	return force;

	function chargeForce(
		node1: squareData,
		node2: squareData,
		alpha: number,
		i: number,
		j: number,
		strength: number
	) {
		const n1ForceStrength = strength;
		const n2ForceStrength = strength;

		// Trig stuff to calculate the direction of the force-vector
		const delta = (node1.middle.y - node2.middle.y) / (node1.middle.x - node2.middle.x);
		const angle = Math.atan(delta);
		const vy = Math.sin(angle);
		const vx = Math.cos(angle);

		// Set the values
		if (node1.middle.x > node2.middle.x) {
			nodes[i].vx! += vx * n1ForceStrength;
			nodes[i].vy! += vy * n1ForceStrength;
			nodes[j].vx! -= vx * n2ForceStrength;
			nodes[j].vy! -= vy * n2ForceStrength;
		} else {
			nodes[i].vx! -= vx * n1ForceStrength;
			nodes[i].vy! -= vy * n1ForceStrength;
			nodes[j].vx! += vx * n2ForceStrength;
			nodes[j].vy! += vy * n2ForceStrength;
		}
	}
}
