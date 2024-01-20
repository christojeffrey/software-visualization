import * as d3 from 'd3';

export function cleanCanvas(svgElement, simulations) {
	console.log('clean canvas');
}

export function converter(rawData) {
	console.log('converter');
	// hardcode for now

	return {
		nodes: [
			{ id: 'node1', level: 1 },
			{ id: 'node2', level: 1 },
			{
				id: 'node3',
				level: 1,
				members: [
					{
						id: 'member1',
						level: 2,
						members: [
							{
								id: 'anak1',
								level: 3
							},
							{
								id: 'anak2',
								level: 3
							}
						]
					},
					{
						id: 'member2',
						level: 2
					},
					{
						id: 'member3',
						level: 2
					}
				]
			}
		],
		links: [
			{ source: 'node1', target: 'node2' },
			{ source: 'node2', target: 'node3' },
			{ source: 'member2', target: 'member1' },
			{ source: 'member2', target: 'node1' }
		]
	};
}

// filter and helper

function assignParentReference(nodes) {
	// console.log(nodes);
	nodes.forEach((node, index, arr) => {
		if (node.members) {
			node.members.forEach((member, index, arr) => {
				arr[index].parent = node;
			});
			assignParentReference(node.members);
		}
	});
}
function flattenNode(nodes) {
	//   reserse the order so that the parent is always at the end.
	let hasMember = false;
	let result = [];
	nodes.forEach((node) => {
		// order matter.
		if (node.members) {
			result.push(...flattenNode(node.members));
		}
		result.push(node);
	});
	return result;
}

export function filter(config: any, convertedData: any) {
	console.log('filter');
	const nodes: any = convertedData.nodes;
	const links: any = convertedData.links;
	const flattenNodes: any = flattenNode(nodes);

	assignParentReference(nodes);

	const graphData: any = {
		nodes,
		links,
		flattenNodes
	};
	return graphData;
}

// draw and helper

const SVGSIZE = 800;
const SVGMARGIN = 50;
const PADDING = 10;
// const MINIMUMNODESIZE = 10;

function createInnerSimulation(nodes: any, canvas: any, allSimulation: any, parentNode: any) {
	console.log(nodes);
	// use this instead of forEach so that it is passed by reference.

	// bind for easy reference.
	for (let i = 0; i < nodes.length; i++) {
		nodes[i].parent = parentNode;
	}

	const innerSimulation = d3.forceSimulation(nodes);
	innerSimulation.force('charge', d3.forceManyBody().strength(-30));
	innerSimulation.force('x', d3.forceX());
	innerSimulation.force('y', d3.forceY());

	allSimulation.push(innerSimulation);

	const parentElement = canvas.select(`#${parentNode.id}`).append('g');
	let membersContainerElement = parentElement
		.selectAll('g')
		.data(nodes)
		.enter()
		.append('g')
		.attr('class', 'node')
		.attr('id', (d: any) => d.id);

	membersContainerElement.call(
		d3
			.drag()
			.on('start', (d) => {
				dragStartedNode(d, allSimulation);
			})
			.on('drag', (d) => {
				draggedNode(d, allSimulation);
			})
			.on('end', (d) => {
				dragEndedNode(d, allSimulation);
			})
	);
	const memberElements = membersContainerElement
		.append('rect')
		.attr('x', 0)
		.attr('y', 0)
		.attr('width', 5)
		.attr('height', 5)
		.style('fill', 'green')
		.attr('fill-opacity', '0.2');

	innerSimulation.on('tick', function ticked() {
		membersContainerElement.attr('transform', (d) => `translate(${d.x},${d.y})`);
		memberElements.attr('width', (d) => d.width).attr('height', (d) => d.height);
		memberElements.attr('x', (d) => d.cx).attr('y', (d) => d.cy);
	});

	// recursive inner simulation.
	for (let i = 0; i < nodes.length; i++) {
		if (nodes[i].members) {
			createInnerSimulation(nodes[i].members, canvas, allSimulation, nodes[i]);
		}
	}
}
function linkTicked(linkElements: any) {
	linkElements
		.attr('x1', (d: any) => {
			// change to global coordinates.
			let result = d.source.x;

			let temp = d.source;
			while (temp.parent) {
				result += temp.parent.x;
				temp = temp.parent;
			}

			return result;
		})
		.attr('y1', (d: any) => {
			// change to global coordinates.
			let result = d.source.y;

			let temp = d.source;
			while (temp.parent) {
				result += temp.parent.y;
				temp = temp.parent;
			}

			return result;
		})
		.attr('x2', (d: any) => {
			// change to global coordinates.
			let result = d.target.x;

			let temp = d.target;
			while (temp.parent) {
				result += temp.parent.x;
				temp = temp.parent;
			}

			return result;
		})
		.attr('y2', (d: any) => {
			// change to global coordinates.
			let result = d.target.y;

			let temp = d.target;
			while (temp.parent) {
				result += temp.parent.y;
				temp = temp.parent;
			}

			return result;
		});
}
function masterSimulationTicked(graphData: any, containerElement: any, nodeElements: any) {
	// calculate nodes width and height, x and y. only do this calculation once, on master simulation
	for (let i = 0; i < graphData.flattenNodes.length; i++) {
		if (graphData.flattenNodes[i].members) {
			const members = graphData.flattenNodes[i].members;
			// members location is relative to the parent.
			let minX = members[0].x + members[0].cx;
			let maxX = members[0].x + members[0].cx + members[0].width;
			let minY = members[0].y + members[0].cy;
			let maxY = members[0].y + members[0].cy + members[0].height;

			for (let j = 0; j < members.length; j++) {
				if (members[j].x + members[j].cx < minX) {
					minX = members[j].x;
				}
				if (members[j].x + members[j].cx + members[j].width > maxX) {
					maxX = members[j].x + members[j].cx + members[j].width;
				}
				if (members[j].y + members[j].cy < minY) {
					minY = members[j].y + members[j].cy;
				}
				if (members[j].y + members[j].cy + members[j].height > maxY) {
					maxY = members[j].y + members[j].cy + members[j].height;
				}
			}

			graphData.flattenNodes[i].width = maxX - minX + PADDING * 2;
			graphData.flattenNodes[i].height = maxY - minY + PADDING * 2;
			// stands for calculated x and y.
			graphData.flattenNodes[i].cx = minX - PADDING;
			graphData.flattenNodes[i].cy = minY - PADDING;
		} else {
			graphData.flattenNodes[i].width = 10;
			graphData.flattenNodes[i].height = 10;
			//   stands for calculated x and y.
			graphData.flattenNodes[i].cx = 0;
			graphData.flattenNodes[i].cy = 0;
		}
	}

	containerElement.attr('transform', (d: any) => {
		return `translate(${d.x},${d.y})`;
	});
	nodeElements.attr('width', (d: any) => d.width).attr('height', (d: any) => d.height);
	// cannot use below as this wouldn't move the children of that group, which is the subgraph

	nodeElements.attr('x', (d: any) => d.cx).attr('y', (d: any) => d.cy);
}

const slowAlpha = 0.001;
function dragStartedNode(event: any, simulations: any) {
	simulations.forEach((simulation: any) => {
		if (!event.active) simulation.alpha(slowAlpha).restart();
	});
	event.subject.fx = event.subject.x;
	event.subject.fy = event.subject.y;
}

// Update the subject (dragged node) position during drag.
function draggedNode(event: any, simulations: any) {
	simulations.forEach((simulation: any) => {
		simulation.alpha(slowAlpha).restart();
	});
	console.log('test');
	event.subject.fx = event.x;
	event.subject.fy = event.y;
}

function dragEndedNode(event: any, simulations: any) {
	simulations.forEach((simulation: any) => {
		if (!event.active) simulation.alpha(slowAlpha).restart();
	});
	event.subject.fx = null;
	event.subject.fy = null;
}
export function draw(svgElement: any, graphData: any, drawSettings: any) {
	console.log('draw');
	const simulations: any = [];

	const svg = d3
		.select(svgElement)
		.attr('width', SVGSIZE + SVGMARGIN * 2)
		.attr('height', SVGSIZE + SVGMARGIN * 2);

	const simulation = d3.forceSimulation(graphData.nodes);
	simulation.force('charge', d3.forceManyBody().strength(-300));
	simulation.force('center', d3.forceCenter(SVGSIZE / 2, SVGSIZE / 2));
	simulation.on('tick', () => {
		masterSimulationTicked(graphData, containerElement, nodeElements);
	});

	simulations.push(simulation);

	const canvas = svg.append('g');

	const containerElement = canvas
		.append('g')
		.selectAll('g')
		.data(graphData.nodes)
		.enter()
		.append('g')
		.attr('class', 'nodes')
		.attr('id', (d: any) => d.id);

	containerElement.call(
		d3
			.drag<any, any>()
			.on('start', function (this: any, e) {
				// To combine element drag and pan
				d3.select(this).raise();
				dragStartedNode(e, simulations);
			})
			.on('drag', (e) => draggedNode(e, simulations))
			.on('end', (e) => dragEndedNode(e, simulations))
	);

	const nodeElements = containerElement
		.append('rect')
		.attr('x', 0)
		.attr('y', 0)
		.attr('width', 10)
		.attr('height', 10)
		.attr('fill', 'red')
		.attr('fill-opacity', '0.1');

	// link
	const linkElements = canvas
		.selectAll('line.link')
		.data(graphData.links)
		.enter()
		.append('line')
		.style('stroke', 'blue')
		.attr('class', 'link');
	const linkSimulation = d3
		.forceSimulation(graphData.flattenNodes)
		.force(
			'link',
			d3
				.forceLink(graphData.links)
				.id((d: any) => {
					return d.id;
				})
				.strength(0)
		)
		.on('tick', () => {
			linkTicked(linkElements);
		});
	simulations.push(linkSimulation);
	// create inner simulation.
	for (let i = 0; i < graphData.nodes.length; i++) {
		if (graphData.nodes[i].members) {
			createInnerSimulation(graphData.nodes[i].members, canvas, simulations, graphData.nodes[i]);
		}
	}

	return {
		simulations,
		svgElement
	};
}
