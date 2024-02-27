import type { GraphDataNode } from '../../../types';

const slowAlpha = 0.7;
export function dragStartedNode(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	event: any,
	simulations: d3.Simulation<GraphDataNode, undefined>[]
) {
	simulations.forEach((simulation) => {
		if (!event.active) simulation.alpha(slowAlpha).restart();
	});
	event.subject.fx = event.subject.x;
	event.subject.fy = event.subject.y;
}

// Update the subject (dragged node) position during drag.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function draggedNode(event: any, simulations: d3.Simulation<GraphDataNode, undefined>[]) {
	simulations.forEach((simulation) => {
		simulation.alpha(slowAlpha).restart();
	});
	event.subject.fx = event.x;
	event.subject.fy = event.y;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function dragEndedNode(event: any, simulations: d3.Simulation<GraphDataNode, undefined>[]) {
	simulations.forEach((simulation) => {
		if (!event.active) simulation.alpha(slowAlpha).restart();
	});
	event.subject.fx = null;
	event.subject.fy = null;
}
