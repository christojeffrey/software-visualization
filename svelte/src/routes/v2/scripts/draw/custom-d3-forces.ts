import type {SimulationNodeDatum} from "d3";

interface simluationNodeDatumType extends SimulationNodeDatum {
    width: number,
    height: number,
}

export function squareCollideForce(nodes: simluationNodeDatumType[]) {
	return function (alpha: number) {
        //Collision detection (Not as bad as it looks, this force only applies locally)
		for (let i = 0; i < nodes.length; i++) {
			for (let j = i + 1; j < nodes.length; j++) {
                const node1 = nodes[i];
				const node2 = nodes[j];
                if (node1.x && node1.y && node2.x && node2.y) {    
                    if (node1.x + node1.width >= node2.x && node1.x <= node2.x + node2.width && 
                        node1.y + node1.height >= node2.y && node1.y <= node2.y + node2.height) {
                        // We collided

                        // Calculate force strength (We want movement to go somewhat smooth)
                        const distance = Math.sqrt( Math.abs(node1.x - node2.x)**2 +  Math.abs(node1.y - node2.y)**2);
                        const verticalForceStrength = Math.max(node1.height, node2.height)*5*(1-alpha) / distance 
                        const horizontalForceStrength = Math.max(node1.width, node2.width)*5*(1-alpha) / distance 

                        // Update node positions
                        if (node1.x < node2.x) {
                            node1.vx! -= horizontalForceStrength;
                            node2.vx! += horizontalForceStrength;
                        } else {
                            node1.vx! += horizontalForceStrength;
                            node2.vx! -= horizontalForceStrength;
                        }

                        if (node1.y < node2.y) {
                            node1.vy! -= verticalForceStrength;
                            node2.vy! += verticalForceStrength;
                        } else {
                            node1.vy! += verticalForceStrength;
                            node2.vy! -= verticalForceStrength;
                        }
                    }
                }
			}
		}
	};
}