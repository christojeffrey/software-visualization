<script lang="ts">
	import {onMount} from 'svelte';
	import * as d3 from 'd3';
	import {Input} from '$lib/components/ui/input/index.js';
	import {Label} from '$lib/components/ui/label/index.js';

	import * as Resizable from '$lib/components/ui/resizable';
	let svgElement: SVGElement | undefined = undefined;

	type HierarchyData = {
		id: string;
		count: number;
		children?: HierarchyData[];
	};
	let isMounted = false;
	function inputDataToHierarchyData(csvText: string): any {
		// package, class, layer, count
		const table = d3.csvParse(csvText);
		const packages: any = new Map<String, any[]>();
		// get all unique package, and append to table
		table.forEach(row => {
			console.log('row', row);
			if (!(row.package in packages)) {
				packages[row.package] = [];
			}
			packages[row.package].push(row);
		});
		const roots: any = [];
		Object.entries(packages).forEach(([key, value]: any) => {
			let temporaryTable = [...value];
			temporaryTable.push({
				class: key,
				package: '',
				count: 1,
				layer: '',
			});
			console.log('temporaryTable');
			console.log(temporaryTable);
			const root = d3
				.stratify()
				.id((d: any) => d.class)
				.parentId((d: any) => d.package)(temporaryTable);
			roots.push(root);
		});
		console.log('roots', roots);

		root = roots[5];
		d3.select(svgElement!).selectChildren().remove();
	}
	const data: HierarchyData = {
		id: 'Eve',
		count: 1,
		children: [
			{id: 'Cain', count: 1},
			{
				id: 'Seth',
				count: 1,
				children: [
					{id: 'Enos', count: 1},
					{id: 'Noam', count: 1},
				],
			},
			{id: 'Abel', count: 1},
			{id: 'Awan', count: 1, children: [{id: 'Enoch', count: 1}]},
			{id: 'Azura', count: 1},
		],
	};
	let root = d3.hierarchy(data) as any;
	$: {
		if (isMounted) {
			// Construct the treemap layout.
			const pack = d3.pack<any>();
			pack.size([500, 500]);
			pack.padding(2);

			// // Sum and sort the data.
			root.sum((d: any) => d.count);
			// root.sort((a, b) => b.height - a.height || b.value! - a.value!);

			// Compute the pack layout.
			pack(root);
			let canvas = d3.select(svgElement!).append('g').attr('id', 'canvas');

			root.each((d: any) => {
				console.log(d);
				const node = canvas
					.append('g')
					.attr('transform', `translate(${d.x},${d.y})`)
					.attr('class', 'node');

				node
					.append('circle')
					.attr('r', d.r)
					.attr('fill', () => {
						console.log('d', d);
						// based on data.layer
						if (d?.data?.layer === 'Data Source Layer') {
							return 'rgba(0, 100, 0, 0.2)';
						} else if (d?.data?.layer === 'Domain Layer') {
							return 'rgba(100, 0, 0, 0.2)';
						} else if (d?.data?.layer === 'Presentation Layer') {
							return 'rgba(0, 0, 100, 0.2)';
						} else {
							return 'rgba(0, 0, 0, 0.2)';
						}
					})
					.attr('stroke', 'black');

				node
					.append('text')
					.attr('dy', '0.3em')
					.attr('fill', 'black')
					.attr('text-anchor', 'middle')
					.attr('font-size', '10px')
					.text(d.data.id);
			});
		}
	}
	onMount(() => {
		isMounted = true;
	});

	function handleFileChange(e: any) {
		const file = e.target?.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = e => {
			const text = e.target?.result as string;
			inputDataToHierarchyData(text);
		};
		reader.readAsText(file);
	}
</script>

<div class="p-4 h-full w-full">
	<Resizable.PaneGroup direction="horizontal">
		<Resizable.Pane class="p-2" defaultSize={85}>
			<svg bind:this={svgElement} class="w-full h-full" width="100%" />
		</Resizable.Pane>
		<Resizable.Handle />
		<Resizable.Pane class="p-2"
			><div class="grid w-full max-w-sm items-center gap-1.5">
				<Label for="picture" class="font-bold">Input</Label>
				<Input id="picture" type="file" on:change={handleFileChange} />
			</div></Resizable.Pane
		>
	</Resizable.PaneGroup>
</div>
