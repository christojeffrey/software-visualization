<script lang="ts">
	import * as Resizable from '$lib/components/ui/resizable';
	import {Input} from '$lib/components/ui/input/index.js';
	import {Label} from '$lib/components/ui/label/index.js';
	import * as d3 from 'd3';

	export let hoverDetail = '';
	export let roots: any[] = [];

	function inputDataToHierarchyData(csvText: string): any {
		// package, class, layer, count
		const table = d3.csvParse(csvText);
		const packages: any = new Map<String, any[]>();
		// get all unique package, and append to table
		table.forEach(row => {
			// parse all count to number
			if (!(row.package in packages)) {
				packages[row.package] = [];
			}
			packages[row.package].push(row);
		});
		roots = [];
		Object.entries(packages).forEach(([key, value]: any) => {
			// setup data
			let temporaryTable = [...value];
			// parse all count to number
			temporaryTable.forEach(row => {
				row.count = +row.count;
			});

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

			// turn to d3 hierarchy
			const root = d3
				.stratify()
				.id((d: any) => d.class)
				.parentId((d: any) => d.package)(temporaryTable);

			// temporary, limit to two

			roots.push(root);
		});
	}
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
