const LINK_COLOR_MAP = {
	construct: ['#8dd3c7', '#D38D99'],
	holds: ['#ffffb3', '#fccde5'],
	calls: ['#bebada', '#D6DABA'],
	accepts: ['#fb8072', '#ffed6f'],
	specializes: ['#80b1d3', '#D3A280'],
	returns: ['#ACD728', '#5328D7'],
	accesses: ['#bc80bd', '#81BD80']
};

export function setupGradient(svg: any) {
	// Use defs to store gradient definitions
	const defs = svg.append('defs');
	Object.entries(LINK_COLOR_MAP).forEach(([edgeType, colors]) => {
		const gradient = defs.append('linearGradient').attr('id', `${edgeType}Gradient`);
		// First color stop
		gradient
			.append('stop')
			.attr('offset', '0%')
			.attr('class', 'start')
			.attr('stop-color', colors[0])
			.attr('stop-opacity', 1);
		// Second color stop
		gradient
			.append('stop')
			.attr('offset', '100%')
			.attr('class', 'end')
			.attr('stop-color', colors[1])
			.attr('stop-opacity', 1);
	});
}
