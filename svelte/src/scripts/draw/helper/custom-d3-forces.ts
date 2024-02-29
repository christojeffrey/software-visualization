
import type {Force} from "d3";
import type { GraphDataNode, GraphDataEdgeD3 } from "$types";

/**
 * Creates a rectangular collison force across all nodes
 * 
 * Assumes all nodes are rectangles, with a width and height property, rather than circles
 */
export function rectangleCollideForce(): Force<GraphDataNode, undefined>  {
    let nodes: GraphDataNode[];
    const snap = false;

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
    
    function makeSquare(node: GraphDataNode): squareData {
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
                x: topLeftx + 0.5*node.width,
                y: topLefty + 0.5*node.height,
            },
            width: node.width,
            height: node.height,
        };
    };
    
    function calcForceStrength(node1: squareData, node2: squareData, alpha: number) {
        return (node1.width + node1.height) / (node1.width + node1.height + node2.width + node2.height)
            * (1 + alpha)
            * 20; // random magic number
    }

    // actual force calculation
	function force(alpha: number) {
        // Loop through all nodes for collision check
		for (let i = 0; i < nodes.length; i++) {
			for (let j = i + 1; j < nodes.length; j++) {
                if (nodes[i].x && nodes[i].y && nodes[j].x && nodes[j].y) {
                    // Calculate x and y position of the top-left and bottom-right corner of the node, and middle position.
                    const node1 = makeSquare(nodes[i]);
				    const node2 = makeSquare(nodes[j]);
                    
                    // Check for collision
                    if (node1.bottomright.x >= node2.topleft.x && node1.topleft.x <= node2.bottomright.x && 
                        node1.bottomright.y >= node2.topleft.y && node1.topleft.y <= node2.bottomright.y) {
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
                        }
                        else {
                            // Use a force instead
                            chargeForce(node1, node2, alpha, i, j, 20);
                        }
                    } else if (
                        // We also want to try to keep a minimum distance. However, for performance reasons we don't do this on the innermost level
                        nodes[i].level === nodes[j].level && nodes[i].members!.length > 0 && nodes[j].members!.length > 0
                    ) {
                        const clearDistance = Math.max(
                            Math.abs(node1.middle.x - node2.middle.x) - ((node1.width + node2.width)/2),
                            Math.abs(node1.middle.y - node2.middle.y) - ((node1.height + node2.height)/2),
                        );

                        chargeForce(node1, node2, alpha, i, j, 300*(1/clearDistance));
                    }
                }
			}
		}
	};

    force.initialize = function (_nodes: GraphDataNode[]) {
        nodes = _nodes;
    }

    return force;

    function chargeForce(node1: squareData, node2: squareData, alpha: number, i: number, j: number, strength: number) {
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
): Force<GraphDataNode, undefined> {
    let nodes: GraphDataNode[]; 
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

    force.initialize = function (_nodes: GraphDataNode[]) {
        nodes = _nodes;
    }

    return force;
}

export function downForce(): Force<GraphDataNode, undefined> {
    let nodes: GraphDataNode[]; 
    const nodeMap: Map<string, Set<GraphDataEdgeD3>> = new Map();

    function force(alpha: number) {
        nodes.forEach((node) => {
            const set = nodeMap.get(node.id);
            set?.forEach((link) => {
                link.source.incomingLinks?.forEach((l) => set.add(l));
                link.source?.members?.forEach(m => m.incomingLinks?.forEach(l => set.add(l)));
            })
        });

        const sorted = [...nodeMap.entries()].sort(([_a, a], [_b, b]) => {
            return (a.size < b.size) ? -1 : 1;
        });
        nodes.forEach((node) => {
            const set = nodeMap.get(node.id);
            const index = sorted.findIndex(([id, _]) => {
                return node.id === id;
            });
            const weight = (index ?? 0) * 30;
            node.vy! += weight * alpha;
        });
    }

    force.initialize = function (_nodes: GraphDataNode[]) {
        nodes = _nodes;
        nodes.forEach(node => {
            const set = new Set(node.incomingLinks);
            nodeMap.set(node.id, set);
            node?.members?.forEach(node => {
                node.incomingLinks?.forEach((link) => set.add(link));
            })
        })
    }

    return force;
}