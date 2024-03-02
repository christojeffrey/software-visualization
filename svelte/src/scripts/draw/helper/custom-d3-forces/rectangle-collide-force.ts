import type { Force } from 'd3';
import type { GraphDataNode } from '$types';

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
	node: GraphDataNode;
}

function calcForceStrength(node1: squareData, node2: squareData, alpha: number) {
	return (
		((node1.width + node1.height) / (node1.width + node1.height + node2.width + node2.height)) *
		(1 + alpha) *
		20
	); // random magic number
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
		height: node.height,
		node: node
	};
}

function chargeForce(node1: squareData, node2: squareData) {
	// wil keep the 2 nodes in stable distance. if too far, make them close. if too close, push them away.
	// we want the node to be stable on the margin
	const margin = 25;
	const tollerance = 50;
	const strength = 1;

	// Trig stuff to calculate the direction of the force-vector
	const delta = (node1.middle.y - node2.middle.y) / (node1.middle.x - node2.middle.x);
	// delta is the tangent of the angle between the two nodes

	const minimumDistanceX = (node1.width + node2.width) / 2 + margin;
	const maxDistanceX = minimumDistanceX + tollerance;

	const minimumDistanceY = (node1.height + node2.height) / 2 + margin;
	const maxDistanceY = minimumDistanceY + tollerance;

	// repulse only when the nodes are close
	// attract when they are far
	// Set the values

	const leftNode = node1.middle.x <= node2.middle.x ? node1 : node2;
	const rightNode = node1.middle.x <= node2.middle.x ? node2 : node1;

	const topNode = node1.middle.y <= node2.middle.y ? node1 : node2;
	const bottomNode = node1.middle.y <= node2.middle.y ? node2 : node1;

	const distanceX = rightNode.middle.x - leftNode.middle.x;
	const distanceY = bottomNode.middle.y - topNode.middle.y;

	const DIRECTION_LEFT = -1;
	const DIRECTION_RIGHT = 1;
	const DIRECTION_UP = -1;
	const DIRECTION_DOWN = 1;

	// check X
	const tooCloseX = distanceX < minimumDistanceX;
	const tooFarX = distanceX > maxDistanceX;
	// the more they deviate, the stronger the force logaritmically
	if (tooCloseX) {
		// move leftNode to the left, rightNode to the right
		leftNode.node.vx! += DIRECTION_LEFT * strength * Math.log(minimumDistanceX - distanceX);
		rightNode.node.vx! += DIRECTION_RIGHT * strength * Math.log(minimumDistanceX - distanceX);
	}
	if (tooFarX) {
		// move leftNode to the right, rightNode to the left
		leftNode.node.vx! += DIRECTION_RIGHT * strength * Math.log(distanceX - maxDistanceX);
		rightNode.node.vx! += DIRECTION_LEFT * strength * Math.log(distanceX - maxDistanceX);
	}
	// check Y
	const tooCloseY = distanceY < minimumDistanceY;
	const tooFarY = distanceY > maxDistanceY;
	// the more they deviate, the stronger the force logaritmically
	if (tooCloseY) {
		// move topNode up, bottomNode down
		topNode.node.vy! += DIRECTION_UP * strength * Math.log(minimumDistanceY - distanceY);
		bottomNode.node.vy! += DIRECTION_DOWN * strength * Math.log(minimumDistanceY - distanceY);
	}
	if (tooFarY) {
		// move topNode down, bottomNode up
		topNode.node.vy! += DIRECTION_DOWN * strength * Math.log(distanceY - maxDistanceY);
		bottomNode.node.vy! += DIRECTION_UP * strength * Math.log(distanceY - maxDistanceY);
	}
}

/**
 * Creates a rectangular collison force across all nodes
 *
 * Assumes all nodes are rectangles, with a width and height property, rather than circles
 */
export function rectangleCollideForce(): Force<GraphDataNode, undefined> {
	let nodes: GraphDataNode[];
	const snap = false;

	// actual force calulation
	function force(alpha: number) {
		// Loop through all nodes for collision check
		for (let i = 0; i < nodes.length; i++) {
			for (let j = i + 1; j < nodes.length; j++) {
				// Caclulate x and y position of the top-left and bottom-right corner of the node, and middle position.
				const node1 = makeSquare(nodes[i]);
				const node2 = makeSquare(nodes[j]);

				// Check for collision
				const isColliding =
					node1.bottomright.x >= node2.topleft.x &&
					node1.topleft.x <= node2.bottomright.x &&
					node1.bottomright.y >= node2.topleft.y &&
					node1.topleft.y <= node2.bottomright.y;
				if (isColliding && snap) {
					// Snap stuff into place
					// check who is on the left or right
					if (node2.middle.x < node1.middle.x) {
						// node 2 is to the left of node 1
						nodes[i].x = nodes[j].x + 0.5 * nodes[j].width + 0.5 * nodes[i].width;
					} else {
						// node 2 is to the right of node 1
						nodes[j].x = nodes[i].x + 0.5 * nodes[i].width + 0.5 * nodes[j].width;
					}

					if (node2.middle.y < node1.middle.y) {
						// node 2 is above node 1
						nodes[i].y = nodes[j].y + 0.5 * nodes[j].height + 0.5 * nodes[i].height;
					} else {
						// node 2 is below node 1
						nodes[j].y = nodes[i].y + 0.5 * nodes[i].height + 0.5 * nodes[j].height;
					}
				} else if (
					// We also want to try to keep a minimum distance. However, for performance reasons we don't do this on the innermost level
					nodes[i].level === nodes[j].level
					// nodes[i].members!.length > 0 &&
					// nodes[j].members!.length > 0
				) {
					chargeForce(node1, node2);
				}
			}
		}
	}

	force.initialize = function (_nodes: GraphDataNode[]) {
		nodes = _nodes;
	};

	return force;
}
