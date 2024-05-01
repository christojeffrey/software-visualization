<script lang="ts">
	import {onMount} from 'svelte';
	import * as d3 from 'd3';
	import RightPanel from './components/right-panel.svelte';
	import * as Resizable from '$lib/components/ui/resizable';
	import drawPack from './scripts/drawPack';
	let svgElement: SVGElement;

	type HierarchyData = {
		count: number;
		package?: string;
		class?: string;
		layer?: string;
		children?: HierarchyData[];
	};

	let isMounted = false;
	let hoverDetail = '';
	const data: HierarchyData = {
		class: 'App',
		count: 0,
		children: [
			{
				package: 'com.fsck.k9.account',
				class: 'com.fsck.k9.account.AccountCreator',
				layer: 'Presentation Layer',
				count: 1,
			},
		],
	};
	let roots = [d3.hierarchy(data) as any];

	function writeDetailHover(detail: string) {
		hoverDetail = detail;
	}
	$: {
		if (isMounted) {
			if (svgElement) {
				// clean
				d3.select(svgElement).selectChildren().remove();
			}

			// setup canvas
			const canvas = d3.select(svgElement).append('g').attr('id', 'canvas');
			d3.select(svgElement).call(
				d3.zoom<SVGElement, unknown>().on('zoom', ({transform}) => {
					canvas.attr('transform', transform);
				}),
			);

			// TODO: maybe we can add another way of drawing?
			// Construct the treemap layout.
			drawPack(canvas, roots, writeDetailHover);
		}
	}
	onMount(() => {
		isMounted = true;
	});
</script>

<div class="p-4 h-full w-full">
	<Resizable.PaneGroup direction="horizontal">
		<!-- left -->
		<Resizable.Pane class="p-4" defaultSize={85}>
			<svg bind:this={svgElement} class="w-full h-full" width="100%" />
		</Resizable.Pane>
		<!-- handle -->
		<Resizable.Handle />
		<!-- right -->
		<Resizable.Pane class="pl-4">
			<RightPanel {hoverDetail} bind:roots />
		</Resizable.Pane>
	</Resizable.PaneGroup>
</div>
