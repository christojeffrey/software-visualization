const slowAlpha = 0.001;
export function dragStartedNode(event: any, simulations: any) {
	simulations.forEach((simulation: any) => {
		if (!event.active) simulation.alpha(slowAlpha).restart();
	});
	event.subject.fx = event.subject.x;
	event.subject.fy = event.subject.y;
}

// Update the subject (dragged node) position during drag.
export function draggedNode(event: any, simulations: any) {
	simulations.forEach((simulation: any) => {
		simulation.alpha(slowAlpha).restart();
	});
	event.subject.fx = event.x;
	event.subject.fy = event.y;
}

export function dragEndedNode(event: any, simulations: any) {
	simulations.forEach((simulation: any) => {
		if (!event.active) simulation.alpha(slowAlpha).restart();
	});
	event.subject.fx = null;
	event.subject.fy = null;
}
