import type { GraphDataNode } from '../../../types';

const slowAlpha = 0.0001; // based on this: https://d3js.org/d3-force/simulation#simulation_alphaMin. we want the the alpha to be lower than alpha min (the default is 0.001) so that the animation is stopping. don't turn this into 0. it will crash after many ticks (try this by dragging the node for a long time).
export function dragStartedNode(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	event: any,
	simulations: d3.Simulation<GraphDataNode, undefined>[]
) {
	simulations.forEach((simulation) => {
		if (!event.active) simulation.alpha(slowAlpha).restart();
	});
	event.subject.fx = null;
	event.subject.fy = null;
}

// Update the subject (dragged node) position during drag.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function draggedNode(event: any, simulations: d3.Simulation<GraphDataNode, undefined>[]) {
	simulations.forEach((simulation) => {
		simulation.alpha(slowAlpha).restart();
	});

	event.subject.x = event.x;
	event.subject.y = event.y;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dragEndedNode(event: any, simulations: d3.Simulation<GraphDataNode, undefined>[]) {
	simulations.forEach((simulation) => {
		if (!event.active) simulation.alpha(slowAlpha).restart();
	});
	event.subject.fx = null;
	event.subject.fy = null;
}
