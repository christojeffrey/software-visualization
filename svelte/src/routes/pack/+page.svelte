<script lang="ts">
	import {onMount} from 'svelte';
	import * as d3 from 'd3';

	import * as Resizable from '$lib/components/ui/resizable';
	let svgElement: SVGElement | undefined = undefined;

	type HierarchyData = {
		name: string;
		value: number;
		children?: HierarchyData[];
	};
	let isMounted = false;

	const data: HierarchyData = {
		name: 'Eve',
		value: 10,
		children: [
			{name: 'Cain', value: 10},
			{
				name: 'Seth',
				value: 10,
				children: [
					{name: 'Enos', value: 10},
					{name: 'Noam', value: 10},
				],
			},
			{name: 'Abel', value: 10},
			{name: 'Awan', value: 10, children: [{name: 'Enoch', value: 10}]},
			{name: 'Azura', value: 10},
		],
	};
	$: {
		if (isMounted) {
			const root = d3.hierarchy(data) as any;

			// Construct the treemap layout.
			const pack = d3.pack<any>();
			pack.size([500, 500]);
			pack.padding(2);

			// // Sum and sort the data.
			root.sum((d: any) => d.value);
			// root.sort((a, b) => b.height - a.height || b.value! - a.value!);

			// // Compute the treemap layout.
			pack(root);
			console.log('root');
			console.log(root);

			const canvas = d3.select(svgElement!).append('g').attr('id', 'canvas');
			// const canvasElement = document.getElementById('canvas')!;
			root.each((d: any) => {
				console.log(d);
				const node = canvas
					.append('g')
					.attr('transform', `translate(${d.x},${d.y})`)
					.attr('class', 'node')
					.attr('fill', 'red');

				node
					.append('circle')
					.attr('r', d.r)
					.attr('fill', 'rgba(0, 0, 0, 0.2)')
					.attr('stroke', 'black');

				node
					.append('text')
					.attr('dy', '0.3em')
					.attr('fill', 'black')
					.attr('text-anchor', 'middle')
					.attr('font-size', '10px')
					.text(d.data.name);
			});
		}
	}
	onMount(() => {
		isMounted = true;
	});
</script>

<Resizable.PaneGroup direction="horizontal">
	<Resizable.Pane>
		left
		<svg bind:this={svgElement} class="w-1/2 h-1/2 border-2 border-black" />
		done
	</Resizable.Pane>
	<Resizable.Handle withHandle />
	<Resizable.Pane>right</Resizable.Pane>
</Resizable.PaneGroup>
