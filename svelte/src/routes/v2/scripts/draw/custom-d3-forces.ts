
import type {SimulationNodeDatum} from "d3";

interface simluationNodeDatumType extends SimulationNodeDatum {
    width: number,
    height: number,
    cx?: number,
    cy?: number,
}

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

export function rectangleCollideForce(nodes: simluationNodeDatumType[]) {
	return function (alpha: number) {
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
}