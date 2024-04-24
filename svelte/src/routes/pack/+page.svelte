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
	let hoverDetail = '';
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
		roots = [];
		Object.entries(packages).forEach(([key, value]: any) => {
			// setup data
			let temporaryTable = [...value];

			// if there's same class, combine them into one parent class and add -child1, -child2, etc

			let groupedTable: any = {};
			temporaryTable.forEach((row: any) => {
				if (!(row.class in groupedTable)) {
					groupedTable[row.class] = [];
				}
				groupedTable[row.class].push(row);
			});

			temporaryTable = [];
			Object.entries(groupedTable).forEach(([key, value]: any) => {
				if (value.length > 1) {
					// append children
					value.forEach((row: any, index: number) => {
						temporaryTable.push({
							class: `${key}-child${index + 1}`,
							package: key,
							count: row.count,
							layer: row.layer,
						});
					});
					// append parent class
					temporaryTable.push({
						class: key,
						package: value[0].package, // all same
						count: 0,
						layer: '',
					});
				} else {
					temporaryTable.push(value[0]);
				}
			});

			// append package
			temporaryTable.push({
				class: key,
				package: '',
				count: 0,
				layer: '',
			});
			console.log('temporaryTable');
			console.log(temporaryTable);

			// turn to d3 hierarchy
			const root = d3
				.stratify()
				.id((d: any) => d.class)
				.parentId((d: any) => d.package)(temporaryTable);
			roots.push(root);
		});
		console.log('roots', roots);

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
			{id: 'Awan', count: 1},
			{id: 'Azura', count: 1},
		],
	};
	let roots = [d3.hierarchy(data) as any];
	$: {
		if (isMounted) {
			// Construct the treemap layout.
			d3.select(svgElement!).call(
				d3.zoom<SVGElement, unknown>().on('zoom', ({transform}) => {
					canvas.attr('transform', transform);
				}),
			);
			const canvas = d3.select(svgElement!).append('g').attr('id', 'canvas');
			roots.forEach((root: any, index: number) => {
				const pack = d3.pack<any>();
				pack.padding(2);

				// // Sum and sort the data.
				root.sum((d: any) => d.count);
				// root.sort((a, b) => b.height - a.height || b.value! - a.value!);
				// check the root value
				console.log('root', root.value);
				const FACTOR = 100;
				// let size = (root.value ** 1/2) * FACTOR; // make it non linear
				let size = Math.sqrt(Math.sqrt(root.value)) * FACTOR; // make it non linear
				pack.size([size, size]);
				// Compute the pack layout.
				pack(root);

				let containerElement = canvas
					.append('g')
					.attr('transform', `translate(0,0)`)
					.attr('id', `root-${index}`);

				// add container drag
				containerElement.call(
					d3.drag<any, any>().on('drag', function (event) {
						// console.log('event', drawSettings.transform.k); - this would result in error
						const x = event.dx / 1;
						const y = event.dy / 1;
						root.x += x;
						root.y += y;
						d3.select(this).attr('transform', `translate(${root.x},${root.y})`);
					}),
				);

				root.each((d: any) => {
					const node = containerElement
						.append('g')
						.attr('transform', `translate(${d.x},${d.y})`)
						.attr('class', 'node');

					node
						.append('circle')
						.attr('r', d.r)
						.attr('fill', () => {
							// based on data.layer
							if (d?.data?.layer === 'Data Source Layer') {
								return 'rgba(0, 100, 0, 0.2)';
							} else if (d?.data?.layer === 'Domain Layer') {
								return 'rgba(100, 0, 0, 0.2)';
							} else if (d?.data?.layer === 'Presentation Layer') {
								return 'rgba(0, 0, 100, 0.2)';
							} else if (d?.data?.layer === 'Service Layer') {
								return 'rgba(100, 100, 0, 0.2)';
							} else {
								return 'rgba(0, 0, 0, 0)';
							}
						})
						.attr('stroke', 'black');

					node.on('mouseover', function (event, data) {
						hoverDetail = JSON.stringify(d.data, null, '\t');
						d3.select(this).select('circle').attr('stroke-width', 2);
					});

					node.on('mouseout', function (event, data) {
						hoverDetail = '';
						d3.select(this).select('circle').attr('stroke-width', 1);
					});

					node
						.append('text')
						.attr('dy', '0.3em')
						.attr('fill', 'black')
						.attr('text-anchor', 'middle')
						.attr('font-size', '10px')
						.text(d.data.id);
				});
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
		<!-- left -->
		<Resizable.Pane class="p-4" defaultSize={85}>
			<svg bind:this={svgElement} class="w-full h-full" width="100%" />
		</Resizable.Pane>
		<!-- handle -->
		<Resizable.Handle />
		<!-- right -->
		<Resizable.Pane class="pl-4">
			<Resizable.PaneGroup direction="vertical">
				<Resizable.Pane class="pb-4" defaultSize={20}>{hoverDetail}</Resizable.Pane>
				<Resizable.Handle />

				<Resizable.Pane class="pt-4">
					<div class="grid w-full max-w-sm items-center gap-1.5">
						<Label for="picture" class="font-bold">Input</Label>
						<Input id="picture" type="file" on:change={handleFileChange} />
					</div>
				</Resizable.Pane>
			</Resizable.PaneGroup>
		</Resizable.Pane>
	</Resizable.PaneGroup>
</div>
