
import type {Force, SimulationNodeDatum} from "d3";

interface simluationNodeDatumType extends SimulationNodeDatum {
    width: number,
    height: number,
    cx?: number,
    cy?: number,
}

/**
 * Creates a rectangular collison force across all nodes
 * 
 * Assumes all nodes are rectangles, with a width and height property, rather than circles
 */
export function rectangleCollideForce(): Force<simluationNodeDatumType, any>  {
    let nodes: simluationNodeDatumType[];

    interface point {
        x: number,
        y: number,
    }
    
    interface squareData {
        topleft: point,
        bottomright: point,
        middle: point,
        width: number,
        height: number,
    }
    
    function makeSquare(node: simluationNodeDatumType): squareData {
        const topLeftx = node.x! + node.cx!;
        const topLefty = node.y! + node.cy!;
        return {
            topleft: { // Coordinates of top-left point
                x: topLeftx,
                y: topLefty,
            },
            bottomright: { // Coordinates of bottomright point
                x: topLeftx + node.width,
                y: topLefty + node.height,
            },
            middle: {
                x: topLeftx + node.width,
                y: topLefty + node.height,
            },
            width: node.width,
            height: node.height,
        };
    };
    
    function calcForceStrength(node1: squareData, node2: squareData, alpha: number) {
        return (node1.width + node1.height) / (node1.width + node1.height + node2.width + node2.height)
            * (1 + alpha)
            * 5; // random magic number
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
                    if (node1.bottomright.x >= node2.topleft.x && node1.topleft.x <= node2.bottomright.x && 
                        node1.bottomright.y >= node2.topleft.y && node1.topleft.y <= node2.bottomright.y) {

                        // We collided!
                        // We want small nodes to move out of the way for large nodes
                        // Also, the strenght of the force should decrease with alpha
                        const n1ForceStrength = calcForceStrength(node1, node2, alpha);
                        const n2ForceStrength = calcForceStrength(node2, node1, alpha);

                        // Trig stuff to calculate the direction of the force-vector
                        const delta = (node1.middle.y-node2.middle.y)/(node1.middle.x-node2.middle.x)
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
			}
		}
	};

    force.initialize = function (_nodes: simluationNodeDatumType[]) {
        nodes = _nodes;
    }

    return force;
}

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
export function radialClampForce(
    r: () => number, 
): Force<simluationNodeDatumType, any> {
    let nodes: simluationNodeDatumType[]; 
    // Unused, might want to set this to false after dragging a node.
    // Might also want to have this set to false at the start of a simluation.
    const clamp = true;


    function force(alpha: number) {
        const cx = r();
        const cy = r();
        const radius = r();
        if (!Number.isNaN(cx) && !Number.isNaN(cy) && !Number.isNaN(radius)) {
            nodes.forEach(node => {
                if (node.x && node.y) {
                    const dx = node.x - cx;
                    const dy = node.y - cy;
                    const distance = Math.sqrt(dx ** 2 + dy ** 2);
                    if (clamp) {
                        node.x = cx + ((dx / distance) * radius);
                        node.y = cy + ((dy / distance) * radius);
                    }
                    else if (node.vx && node.vy) {
                        node.vx += ((cx + ((dx / distance) * radius))-node.x) * alpha;
                        node.vy += ((cy + ((dy / distance) * radius))-node.y) * alpha;
                    }
                }
            });
        }
    }

    force.initialize = function (_nodes: simluationNodeDatumType[]) {
        nodes = _nodes;
    }

    return force;
}