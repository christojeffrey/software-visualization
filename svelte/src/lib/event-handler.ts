export function dragStartedNode(event: any) {
	// if (!event.active) simulation.alpha(0.7).restart();
	event.subject.fx = event.subject.x;
	event.subject.fy = event.subject.y;
}

// Update the subject (dragged node) position during drag.
export function draggedNode(event: any) {
	event.subject.fx = event.x;
	event.subject.fy = event.y;
}

export function dragEndedNode(event: any) {
	// if (!event.active) simulation.alpha(config.isForceSimulationEnabled ? 0.7 : 0).restart();
	event.subject.fx = null;
	event.subject.fy = null;
}

export function dragStartedGroup(event: any) {
	// if (!event.active) simulation.alpha(0.7).restart();
	event.subject.fx = event.subject.x;
	event.subject.fy = event.subject.y;
	event.subject.members.forEach((member: any) => {
		member.fx = member.x;
		member.fy = member.y;
	});
}

export function draggedGroup(event: any) {
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
export function dragEndedGroup(event: any) {
	// if (!event.active) simulation.alpha(config.isForceSimulationEnabled ? 0.7 : 0).restart();
	event.subject.fx = null;
	event.subject.fy = null;
	event.subject.members.forEach((member: any) => {
		member.fx = null;
		member.fy = null;
	});
}
