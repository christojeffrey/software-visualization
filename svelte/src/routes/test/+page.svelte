<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	import { rawToGraphDataConverter, tick } from '$lib';
	import { rawData, exampleData } from '$lib/graph-data';
	import { SVGSIZE, SVGMARGIN } from '$lib/constants';

	import SidePanel from './components/side-panel.svelte';

	let svgElement: any;

	type ConfigType = {
		isGrouped: boolean;
		useRawData: boolean;
		isConfigChanged: boolean;
		showNodeLabel: boolean;
	};
	let config: ConfigType = {
		isGrouped: false,
		useRawData: false,
		isConfigChanged: true,
		showNodeLabel: false
	};

	// graph
	let graphData: {
		nodes: any[];
		links: any[];
		groups: any[];
	} = {
		nodes: exampleData.nodes,
		links: exampleData.links,
		groups: exampleData.groups
	};
	let convertedData = rawToGraphDataConverter(rawData);

	let svg: any;
	let simulation: any;
	let groupLinks: any[] = [];
	let groupElements: any;
	let nodeElements: any;
	let linkElements: any;
	let nodeLabelElements: any;
	let isMounted = false;

	$: {
		if (isMounted) {
			// handle config changes
			if (config.isConfigChanged) {
				// simulation.alphaTarget(0.1).restart();
				const t = d3.transition().duration(100).ease(d3.easeLinear);
				// handle isGrouped
				if (config.isGrouped) {
					// turn on force
					simulation.force(
						'groupLink',
						d3
							.forceLink(groupLinks)
							.id((d: any) => d.id)
							.strength(1)
					);
					// change oppacity of group svg
					groupElements.transition(t).attr('fill-opacity', 0.3);
				} else {
					// turn off force
					// simulation.force('groupLink', null);
					// change oppacity of group svg
					// groupElements.transition(t).attr('fill-opacity', 0);
				}
				// remove the old data
				d3.select(svgElement).selectChildren().remove();

				if (config.useRawData === true) {
					// raw
					graphData.nodes = convertedData.nodes;
					graphData.links = convertedData.links;
					graphData.groups = convertedData.groups ?? [];
				} else {
					// graph
					graphData.nodes = exampleData.nodes;
					graphData.links = exampleData.links;
					graphData.groups = exampleData.groups;
				}

				// draw
				// BASICS
				svg = d3
					.select(svgElement)
					.attr('width', SVGSIZE + SVGMARGIN * 2)
					.attr('height', SVGSIZE + SVGMARGIN * 2);

				// Create a simulation with several forces.
				simulation = d3
					.forceSimulation(graphData.nodes)
					.force(
						'link',
						d3
							.forceLink(graphData.links)
							.id((d: any) => d.id)
							.strength(0.1)
					)
					.force('charge', d3.forceManyBody().strength(-300))
					.force('x', d3.forceX((SVGSIZE + SVGMARGIN * 2) / 2))
					.force('y', d3.forceY((SVGSIZE + SVGMARGIN * 2) / 2));
				// add fake link between node in same group
				groupLinks = [];
				for (let i = 0; i < graphData.groups.length; i++) {
					for (let j = 0; j < graphData.groups[i].leaves.length; j++) {
						for (let k = j + 1; k < graphData.groups[i].leaves.length; k++) {
							groupLinks.push({
								source: graphData.groups[i].leaves[j],
								target: graphData.groups[i].leaves[k]
							});
						}
					}
				}

				// INITIALIZE COMPONENTS
				linkElements = svg
					.selectAll('line')
					.data(graphData.links)
					.enter()
					.append('line')
					.style('stroke', '#aaa');

				groupElements = svg
					.selectAll('rect')
					.data(graphData.groups)
					.enter()
					.append('rect')
					.attr('x', 5)
					.attr('y', 5)
					.attr('width', 100)
					.attr('height', 100)
					.attr('fill-opacity', config.isGrouped ? 0.3 : 0)
					.style('fill', (d: any) => d.color);

				nodeElements = svg
					.selectAll('circle')
					.data(graphData.nodes)
					.enter()
					.append('circle')
					.attr('r', 5)
					.style('fill', '#69b3a2');

				// add text
				if (config.showNodeLabel) {
					nodeLabelElements = svg
						.selectAll('text')
						.data(graphData.nodes)
						.enter()
						.append('text')
						.text((d: any) => d.id)
						.attr('x', 6)
						.attr('y', 3);
				}
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

				function dragended(event: any) {
					if (!event.active) simulation.alphaTarget(0);
					event.subject.fx = null;
					event.subject.fy = null;
				}

				// Add a drag behavior.
				nodeElements.call(
					d3.drag<any, any>().on('start', dragstarted).on('drag', dragged).on('end', dragended)
				);

				simulation.on('tick', () => {
					tick(
						linkElements,
						nodeElements,
						groupElements,
						nodeLabelElements,
						graphData.groups,
						graphData.nodes
					);
				});
				config.isConfigChanged = false;
			}
		}
	}
	onMount(() => {
		isMounted = true;
	});
</script>

<div class="graph">
	<svg bind:this={svgElement} />
	<button
		on:click={() => {
			// remove data
			d3.select(svgElement).selectChildren().remove();
		}}>remove data</button
	>
	<SidePanel bind:config />
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
