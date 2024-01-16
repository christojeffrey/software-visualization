<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';

	import { liftLinks, rawToGraphDataConverter, tick } from '$lib';
	import { rawData, exampleData } from '$lib/graph-data';
	import { SVGSIZE, SVGMARGIN, LINK_COLOR_MAP } from '$lib/constants';
	import type { ConfigType, GraphDataType, GraphElementsType } from '$lib/types';

	import SidePanel from './components/side-panel.svelte';
	import {
		dragEndedGroup,
		dragEndedNode,
		dragStartedGroup,
		dragStartedNode,
		draggedGroup,
		draggedNode
	} from '$lib';
	import { linkStrokeValue } from '$lib/style-injector';

	let svgElement: any; // Reference to the svg tag

	let config: ConfigType = {
		isGrouped: false,
		useRawData: false,
		isConfigChanged: true,
		showNodeLabels: false,
		showLinkLabels: false,
		isForceSimulationEnabled: true
	};

	// graph
	let graphData: GraphDataType = {
		nodes: exampleData.nodes,
		links: exampleData.links,
		groups: exampleData.groups,
		groupLinks: [],
		groupButtons: [],
		collapsedGroups: []
	};
	let convertedData = rawToGraphDataConverter(rawData);

	let svg: any; // The svg data that is manipulated
	let simulation: any;

	let graphElements: GraphElementsType = {
		nodes: null,
		nodeLabels: null,
		links: null,
		linkLabels: null,
		groups: null,
		groupButtons: null
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
					graphData.groupLinks = [];
					graphData.groupButtons = [];
				} else {
					// example
					graphData.nodes = exampleData.nodes;
					graphData.links = exampleData.links;
					graphData.groups = exampleData.groups;
					graphData.groupLinks = [];
					graphData.groupButtons = [];
				}
				liftLinks(graphData);

				// prepare data
				// TODO: handle collapsed group
				function handleCollapsedGroup(collapsedGroups: any, graphData: any) {
					// remove nodes data and group data.

					let filteredNodes = graphData.nodes;
					// preformat to make the newly inputed links and the previous one the same
					let filteredLinks = graphData.links.map((link: any) => {
						return {
							source: link.source,
							target: link.target
						};
					});

					collapsedGroups.forEach((collapsedGroupId: string) => {
						let newNodes: any[] = [];
						let newLinks: any[] = [];
						let collapsedGroup = graphData.groups.find(
							(group: any) => group.id === collapsedGroupId
						);

						// average the position of the nodes
						let averageX = 0;
						let averageY = 0;
						collapsedGroup.leaves.forEach((id: string) => {
							let node = graphData.nodes.find((node: any) => node.id === id);
							averageX += node.x;
							averageY += node.y;
						});
						averageX /= collapsedGroup.leaves.length;
						averageY /= collapsedGroup.leaves.length;
						newNodes.push({
							id: collapsedGroupId,
							x: averageX,
							y: averageY,
							isCollapsedGroup: true,
							size: collapsedGroup.leaves.length + 5
						});
						let collapsedGroupLinks = filteredLinks.filter(
							(link: any) =>
								collapsedGroup.leaves.includes(link.source) !==
								collapsedGroup.leaves.includes(link.target)
						);
						collapsedGroupLinks.forEach((link: any) => {
							if (collapsedGroup.leaves.includes(link.source)) {
								newLinks.push({
									source: collapsedGroupId,
									target: link.target
								});
							} else {
								newLinks.push({
									source: link.source,
									target: collapsedGroupId
								});
							}
						});

						filteredNodes = filteredNodes.filter(
							(node: any) => !collapsedGroup.leaves.includes(node.id)
						);
						filteredNodes = filteredNodes.concat(newNodes);

						filteredLinks = filteredLinks.filter(
							(link: any) =>
								!collapsedGroup.leaves.includes(link.source) &&
								!collapsedGroup.leaves.includes(link.target)
						);
						filteredLinks = filteredLinks.concat(newLinks);
					});
					// update graphData
					graphData.nodes = filteredNodes;
					graphData.links = filteredLinks;
					graphData.groups = graphData.groups.filter(
						(group: any) => !collapsedGroups.includes(group.id)
					);

					// TODO: handle nested group
				}
				handleCollapsedGroup(graphData.collapsedGroups, graphData);

				if (config.isGrouped) {
					graphElements.groups = svg
						.selectAll('rect.group-container')
						.data(graphData.groups)
						.enter()
						.append('rect')
						.attr('x', 5)
						.attr('y', 5)
						.attr('width', 100)
						.attr('height', 100)
						.attr('fill-opacity', config.isGrouped ? 0.7 : 0)
						.attr('class', 'group-container')
						.style('fill', (d: any) => d.color);

					// bind members to group
					for (let i = 0; i < graphData.groups.length; i++) {
						let members: any[] = [];
						graphData.groups[i].leaves.forEach((id: any) => {
							// find the node in the nodeData array
							const node = graphData.nodes.find((node: any) => node.id === id);
							members.push(node);
						});
						graphData.groups[i].members = members;
					}
					// bind group button to group
					let buttons: any[] = [];
					for (let i = 0; i < graphData.groups.length; i++) {
						buttons.push({ x: 0, y: 0, id: graphData.groups[i].id });
					}
					graphData.groupButtons = buttons;

					graphElements.groupButtons = svg
						.selectAll('circle.group-button')
						.data(graphData.groupButtons)
						.enter()
						.append('circle')
						.attr('r', 10)
						.attr('class', 'group-button')
						.style('fill', 'black')
						.on('click', (_event: any, data: any) => {
							graphData.collapsedGroups.push(data.id);
							config.isConfigChanged = true;
						});

					for (let i = 0; i < graphData.groups.length; i++) {
						graphData.groups[i].button = graphData.groupButtons[i];
					}
				}

				// handle redraw
				// clear previous simulation
				if (simulation) {
					simulation.force('link', null);
					simulation.force('charge', null);
					simulation.force('x', null);
					simulation.force('y', null);
					simulation.force('groupLink', null);
					simulation.stop();
				}
				// draw
				svg = d3
					.select(svgElement)
					.attr('width', SVGSIZE + SVGMARGIN * 2)
					.attr('height', SVGSIZE + SVGMARGIN * 2);

				simulation = d3.forceSimulation([...graphData.nodes, ...graphData.groups]);
				simulation.force(
					'link',
					d3
						.forceLink(graphData.links)
						.id((d: any) => {
							return d.id;
						})
						.strength(0.1)
				);
				simulation.force('charge', d3.forceManyBody().strength(-300));
				simulation.force('x', d3.forceX((SVGSIZE + SVGMARGIN * 2) / 2));
				simulation.force('y', d3.forceY((SVGSIZE + SVGMARGIN * 2) / 2));

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
					const t = d3.transition().duration(100).ease(d3.easeLinear);
					graphElements.groups.transition(t).attr('fill-opacity', 0.7);
					graphElements.groups.call(
						d3
							.drag<any, any>()
							.on('start', (e) => dragStartedGroup(e, simulation))
							.on('drag', (e) => draggedGroup(e, simulation))
							.on('end', (e) => dragEndedGroup(e, simulation, config))
					);
				}

				graphElements.nodes = svg
					.selectAll('circle.node')
					.data(graphData.nodes)
					.enter()
					.append('circle')
					.attr('r', (d: any) => d.size ?? 5)
					.style('fill', (d: any) => (d.isCollapsedGroup ? 'black' : 'red'))
					.attr('class', 'node')
					.on('click', (_event: any, data: any) => {
						if (data.isCollapsedGroup) {
							// uncollapse
							graphData.collapsedGroups = graphData.collapsedGroups.filter(
								(id: string) => id !== data.id
							);
							config.isConfigChanged = true;
						}
					});

				graphElements.links = svg
					.selectAll('line.link')
					.data(graphData.links)
					.enter()
					.append('line')
					.style('stroke', (d: any) => linkStrokeValue(d, LINK_COLOR_MAP))
					.attr('class', 'link');

				if (config.isForceSimulationEnabled) {
					simulation.alpha(0.7).restart();
				} else {
					simulation.alpha(0).restart();
				}
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

				simulation.on('tick', () => {
					tick(config, graphData, graphElements);
				});
				config.isConfigChanged = false;
			}

			// Add a drag behavior.
			graphElements.nodes.call(
				d3
					.drag<any, any>()
					.on('start', function (this: any, e) {
						// To combine element drag and pan
						d3.select(this).raise();
						dragStartedNode(e, simulation);
					})
					.on('drag', (e) => draggedNode(e, simulation))
					.on('end', (e) => dragEndedNode(e, simulation, config))
			);

			// Add zoom handler
			svg.call(
				d3
					.zoom()
					.extent([
						[0, 0],
						[SVGSIZE + SVGMARGIN * 2, SVGSIZE + SVGMARGIN * 2]
					])
					.scaleExtent([1, 8])
					.on('zoom', ({ transform }) => {
						const elements = Object.keys(graphElements);
						elements.forEach((e: string) =>
							graphElements[e as keyof GraphElementsType]?.attr('transform', transform)
						);
					})
			);
		}
	}
	onMount(() => {
		isMounted = true;
	});
</script>

<div class="graph">
	<svg bind:this={svgElement} />
	<!-- <button
		on:click={() => {
			// remove data
			d3.select(svgElement).selectChildren().remove();
		}}>remove data</button
	> -->
	<!-- <button
		on:click={() => {
			// turn off force
			simulation.stop();
		}}>turn off force</button
	> -->
	<!-- <button
			on:click={() => {
				// turn off force
				simulation.alpha(0.7).restart();
			}}>turn on force</button
		> -->

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
