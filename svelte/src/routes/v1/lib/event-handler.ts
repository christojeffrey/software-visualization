import type { ConfigType } from './types';

const slowAlpha = 0.001;
export function dragStartedNode(event: any, simulation: any) {
	if (!event.active) simulation.alpha(slowAlpha).restart();
	event.subject.fx = event.subject.x;
	event.subject.fy = event.subject.y;
}

// Update the subject (dragged node) position during drag.
export function draggedNode(event: any, simulation: any) {
	simulation.alpha(slowAlpha).restart();
	event.subject.fx = event.x;
	event.subject.fy = event.y;
}

export function dragEndedNode(event: any, simulation: any, config: ConfigType) {
	if (!event.active) simulation.alpha(config.isForceSimulationEnabled ? slowAlpha : 0).restart();
	event.subject.fx = null;
	event.subject.fy = null;
}

export function dragStartedGroup(event: any, simulation: any) {
	if (!event.active) simulation.alpha(slowAlpha).restart();
	event.subject.fx = event.subject.x;
	event.subject.fy = event.subject.y;
	event.subject.members.forEach((member: any) => {
		member.fx = member.x;
		member.fy = member.y;
	});
}

export function draggedGroup(event: any, simulation: any) {
	simulation.alpha(slowAlpha).restart();

	// console.log(event.subject.y, event.y);
	const differenceX = event.x - event.subject.fx;
	const differenceY = event.y - event.subject.fy;
	event.subject.fy = event.y;
	event.subject.fx = event.x;
	event.subject.members.forEach((member: any) => {
		// keep node within bounds
		// add the difference to the node
		member.fx += differenceX;
		member.fy += differenceY;
	});
}
export function dragEndedGroup(event: any, simulation: any, config: ConfigType) {
	if (!event.active) simulation.alpha(config.isForceSimulationEnabled ? slowAlpha : 0).restart();

	event.subject.fx = null;
	event.subject.fy = null;
	event.subject.members.forEach((member: any) => {
		member.fx = null;
		member.fy = null;
	});
}
