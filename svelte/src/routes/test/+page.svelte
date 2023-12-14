<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	import { rawToGraphDataConverter, tick } from '$lib';
	import { rawData, exampleData } from '$lib/graph-data';
	import { SVGSIZE, SVGMARGIN } from '$lib/constants';
	import type { ConfigType, GraphDataType, GraphElementsType } from '$lib/types';

	import SidePanel from './components/side-panel.svelte';

	let svgElement: any;

	let config: ConfigType = {
		isGrouped: false,
		useRawData: false,
		isConfigChanged: true,
		showNodeLabels: false,
		showLinkLabels: false
	};

	// graph
	let graphData: GraphDataType = {
		nodes: exampleData.nodes,
		links: exampleData.links,
		groups: exampleData.groups,
		groupLinks: []
	};
	let convertedData = rawToGraphDataConverter(rawData);
	console.log(convertedData);
	let svg: any;
	let simulation: any = null;

	let graphElements: GraphElementsType = {
		nodes: null,
		nodeLabels: null,
		links: null,
		linkLabels: null,
		groups: null
	};

	let isMounted = false;

	$: {
		if (isMounted) {
			// handle config changes
			if (config.isConfigChanged) {
				// remove the old data
				d3.select(svgElement).selectChildren().remove();

				if (config.useRawData === true) {
					// raw
					graphData.nodes = convertedData.nodes;
					graphData.links = convertedData.links;
					graphData.groups = convertedData.groups;
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

				// clear previous simulation
				if (simulation !== null) {
					simulation.force('link', null);
					simulation.force('charge', null);
					simulation.force('x', null);
					simulation.force('y', null);
					simulation.force('groupLink', null);
					simulation.stop();
				}
				// Create a simulation with several forces.
				simulation = d3.forceSimulation(graphData.nodes);
				// simulation.alphaMin();
				// simulation.alphaDecay(0.2);
				simulation.force(
					'link',
					d3
						.forceLink(graphData.links)
						.id((d: any) => d.id)
						.strength(0.1)
				);
				simulation.force('charge', d3.forceManyBody().strength(-300));
				simulation.force('x', d3.forceX((SVGSIZE + SVGMARGIN * 2) / 2));
				simulation.force('y', d3.forceY((SVGSIZE + SVGMARGIN * 2) / 2));
				// handle isGrouped

				// INITIALIZE COMPONENTS
				graphElements.links = svg
					.selectAll('line')
					.data(graphData.links)
					.enter()
					.append('line')
					.style('stroke', '#aaa');

				graphElements.groups = svg
					.selectAll('rect')
					.data(graphData.groups)
					.enter()
					.append('rect')
					.attr('x', 5)
					.attr('y', 5)
					.attr('width', 100)
					.attr('height', 100)
					.attr('fill-opacity', config.isGrouped ? 0.7 : 0)
					.style('fill', (d: any) => d.color);

				graphElements.nodes = svg
					.selectAll('circle')
					.data(graphData.nodes)
					.enter()
					.append('circle')
					.attr('r', 5)
					.style('fill', '#69b3a2');

				const t = d3.transition().duration(100).ease(d3.easeLinear);

				if (config.isGrouped) {
					// add fake link between node in same group
					graphData.groupLinks = [];
					for (let i = 0; i < graphData.groups.length; i++) {
						for (let j = 0; j < graphData.groups[i].leaves.length; j++) {
							for (let k = j + 1; k < graphData.groups[i].leaves.length; k++) {
								graphData.groupLinks.push({
									source: graphData.groups[i].leaves[j],
									target: graphData.groups[i].leaves[k]
								});
							}
						}
					}
					// turn on force
					simulation = simulation.force(
						'groupLink',
						d3
							.forceLink(graphData.groupLinks)
							.id((d: any) => d.id)
							.strength(0.01)
					);
					// change oppacity of group svg
					graphElements.groups.transition(t).attr('fill-opacity', 0.7);
				} else {
					// turn off force
					simulation = simulation.force('groupLink', null);
					// change oppacity of group svg
					graphElements.groups.transition(t).attr('fill-opacity', 0);
				}
				simulation.alpha(0.7).restart();
				// add text
				if (config.showNodeLabels) {
					graphElements.nodeLabels = svg
						.selectAll('text.node-label')
						.data(graphData.nodes)
						.enter()
						.append('text')
						.text((d: any) => d.id)
						.attr('x', 6)
						.attr('y', 3)
						.attr('class', 'node-label');
				}
				if (config.showLinkLabels) {
					graphElements.linkLabels = svg
						.selectAll('text.link-label')
						.data(graphData.links)
						.enter()
						.append('text')
						.text((d: any) => d.source.id + '->' + d.target.id)
						.attr('class', 'link-label');
				}
				function dragstarted(event: any) {
					// if (!event.active) simulation.alpha(0.7).restart();
					event.subject.fx = event.subject.x;
					event.subject.fy = event.subject.y;
				}

				// Update the subject (dragged node) position during drag.
				function dragged(event: any) {
					event.subject.fx = event.x;
					event.subject.fy = event.y;
				}

				function dragended(event: any) {
					if (!event.active) simulation.alpha(0.7).restart();
					event.subject.fx = null;
					event.subject.fy = null;
				}

				// Add a drag behavior.
				graphElements.nodes.call(
					d3.drag<any, any>().on('start', dragstarted).on('drag', dragged).on('end', dragended)
				);

				simulation.on('tick', () => {
					tick(config, graphData, graphElements);
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
	<button
		on:click={() => {
			// turn off force
			simulation.stop();
		}}>turn off force</button
	>
	<button
		on:click={() => {
			// turn off force
			simulation.alpha(0.7).restart();
		}}>turn on force</button
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
