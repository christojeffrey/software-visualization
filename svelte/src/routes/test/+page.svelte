<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import * as cola from 'webcola';

	import graphData from '$lib';

	let svgElement: any;
	const SVGMARGIN = 50;
	const SVGSIZE = 500;
	const NODECOUNT = 5;
	const EDGECOUNT = 100;
	const RANDOMGRAPH = true;

	// graph

	let nodes: any[] = [];
	let edges: any[] = [];

	if (RANDOMGRAPH) {
		// generate NODECOUNT nodes
		for (let i = 0; i < NODECOUNT; i++) {
			nodes.push({ id: i });
		}

		// generate NODECOUNT edges

		// max edges is n(n-1)/2
		let edgeCount = EDGECOUNT;
		if (EDGECOUNT > NODECOUNT * (NODECOUNT - 1)) {
			edgeCount = NODECOUNT * (NODECOUNT - 1);
		}

		for (let i = 0; i < edgeCount; i++) {
			// prevent duplicate edges
			let candidate = {
				source: Math.floor(Math.random() * NODECOUNT),
				target: Math.floor(Math.random() * NODECOUNT)
			};
			let reverseCandidate = {
				source: candidate.target,
				target: candidate.source
			};
			while (edges.includes(candidate) || edges.includes(reverseCandidate)) {
				candidate = {
					source: Math.floor(Math.random() * NODECOUNT),
					target: Math.floor(Math.random() * NODECOUNT)
				};
				reverseCandidate = {
					source: candidate.target,
					target: candidate.source
				};
			}
			edges.push(candidate);
		}
	} else {
		nodes = graphData.nodes;
		edges = graphData.links;
	}

	// graph done

	onMount(() => {
		// graph
		const svg = d3
			.select(svgElement)
			.attr('width', SVGSIZE + SVGMARGIN * 2)
			.attr('height', SVGSIZE + SVGMARGIN * 2);

		// Initialize the links
		const link = svg.selectAll('line').data(edges).join('line').style('stroke', '#aaa');

		// // Initialize the nodes
		const node = svg
			.selectAll('circle')
			.data(nodes)
			.join('circle')
			.attr('r', 5)
			.style('fill', '#69b3a2');

		// attach node, link, and force to svg
		let result = cola
			.d3adaptor(d3)
			.linkDistance(100)
			.size([SVGSIZE + SVGMARGIN * 2, SVGSIZE + SVGMARGIN * 2])
			.nodes(nodes)
			.links(edges)
			.start(10, 15, 20)
			.avoidOverlaps(true)
			.on('tick', ticked);

		// // add zoom in zoom out on scroll
		// svg.call(
		// 	d3.zoom().on('zoom', function (event) {
		// 		svg.attr('transform', event.transform);
		// 	})
		// );

		// //add draggable nodes
		node.call(cola.d3adaptor(d3).drag);

		// // drag functions
		function dragstarted(event: any, d: any) {
			if (!event.active) result.alpha(0.3);
			console.log(d);
		}

		function dragged(event: any, d: any) {
			console.log('dragged');
			console.log(d);
		}

		function dragended(event: any, d: any) {
			// if (!event.active) result.alpha(0);
			// d.fx = null;
			// d.fy = null;
		}

		// This function is run at each iteration of the force algorithm, updating the nodes position.
		function ticked() {
			link
				.attr('x1', function (d) {
					return d.source.x;
				})
				.attr('y1', function (d) {
					return d.source.y;
				})
				.attr('x2', function (d) {
					return d.target.x;
				})
				.attr('y2', function (d) {
					return d.target.y;
				});

			node
				.attr('cx', function (d) {
					return d.x;
				})
				.attr('cy', function (d) {
					return d.y;
				});
		}
	});
</script>

<div class="graph">
	<svg bind:this={svgElement} />
</div>

<style>
	.graph {
		/* border black 2px */
		border: 2px solid black;
	}
	.graph svg {
		/* border red 2px */
		border: 2px solid red;
	}
</style>
