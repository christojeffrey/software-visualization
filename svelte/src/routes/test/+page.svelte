<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import * as cola from 'webcola';

	import graphData from '$lib';

	let svgElement: any;
	const SVGMARGIN = 50;
	const SVGSIZE = 500;

	// graph
	let nodes: any = graphData.nodes;
	let edges: any = graphData.links;
	let groups = graphData.groups;

	// graph done

	onMount(() => {
		// BASICS
		const svg = d3
			.select(svgElement)
			.attr('width', SVGSIZE + SVGMARGIN * 2)
			.attr('height', SVGSIZE + SVGMARGIN * 2);

		// Create a simulation with several forces.
		const simulation = d3
			.forceSimulation(nodes)
			.force(
				'link',
				d3.forceLink(edges).id((d: any) => d.id)
			)
			.force('charge', d3.forceManyBody())
			.force('x', d3.forceX())
			.force('y', d3.forceY());

		// INITIALIZE COMPONENTS
		const link = svg.selectAll('line').data(edges).join('line').style('stroke', '#aaa');

		const node = svg
			.selectAll('circle')
			.data(nodes)
			.join('circle')
			.attr('r', 5)
			.style('fill', '#69b3a2');

		// const group = svg
		// 	.selectAll('rect')
		// 	.data(groups)
		// 	.enter()
		// 	.append('rect')
		// 	.attr('x', 5)
		// 	.attr('y', 5)
		// 	.attr('width', 100)
		// 	.attr('height', 100)
		// 	.attr('fill-opacity', 0.3)
		// 	.style('fill', '#aaa');
		// Reheat the simulation when drag starts, and fix the subject position.
		function dragstarted(event: any) {
			if (!event.active) simulation.alphaTarget(0.3).restart();
			event.subject.fx = event.subject.x;
			event.subject.fy = event.subject.y;
		}

		// Update the subject (dragged node) position during drag.
		function dragged(event: any) {
			event.subject.fx = event.x;
			event.subject.fy = event.y;
		}

		// Restore the target alpha so the simulation cools after dragging ends.
		// Unfix the subject position now that it’s no longer being dragged.
		function dragended(event: any) {
			if (!event.active) simulation.alphaTarget(0);
			event.subject.fx = null;
			event.subject.fy = null;
		}
		// attach node, link, and force to svg
		// simulation.nodes(nodes).force('link').links(edges);
		// Add a drag behavior.
		node.call(
			d3.drag<any, any>().on('start', dragstarted).on('drag', dragged).on('end', dragended)
		);

		simulation.on('tick', () => {
			link
				.attr('x1', (d: any) => d.source.x)
				.attr('y1', (d: any) => d.source.y)
				.attr('x2', (d: any) => d.target.x)
				.attr('y2', (d: any) => d.target.y);

			node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);

			// group
			// 	.attr('x', function (d) {
			// 		//find the min x value of the nodes in the group
			// 		let min = d.leaves[0].x;
			// 		for (let i = 0; i < d.leaves.length; i++) {
			// 			if (d.leaves[i].x < min) {
			// 				min = d.leaves[i].x;
			// 			}
			// 		}
			// 		return min - 10;
			// 	})
			// 	.attr('y', function (d) {
			// 		//find the min y value of the nodes in the group
			// 		let min = d.leaves[0].y;
			// 		for (let i = 0; i < d.leaves.length; i++) {
			// 			if (d.leaves[i].y < min) {
			// 				min = d.leaves[i].y;
			// 			}
			// 		}
			// 		return min - 10;
			// 	})
			// 	.attr('width', function (d) {
			// 		// calculate height based on the difference between the max and min y values of the nodes in the group
			// 		let max = d.leaves[0].x;
			// 		let min = d.leaves[0].x;
			// 		for (let i = 0; i < d.leaves.length; i++) {
			// 			if (d.leaves[i].x > max) {
			// 				max = d.leaves[i].x;
			// 			}
			// 			if (d.leaves[i].x < min) {
			// 				min = d.leaves[i].x;
			// 			}
			// 		}
			// 		return max - min + 20;
			// 	})
			// 	.attr('height', function (d) {
			// 		// calculate height based on the difference between the max and min y values of the nodes in the group
			// 		let max = d.leaves[0].y;
			// 		let min = d.leaves[0].y;
			// 		for (let i = 0; i < d.leaves.length; i++) {
			// 			if (d.leaves[i].y > max) {
			// 				max = d.leaves[i].y;
			// 			}
			// 			if (d.leaves[i].y < min) {
			// 				min = d.leaves[i].y;
			// 			}
			// 		}
			// 		return max - min + 20;
			// 	});
		});
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
