<script lang="ts">
	import { rawToGraphDataConverter } from '$lib';
	import { simpleData } from '$lib/graph-data';

	export let doRedraw: boolean;
	export let convertedData: any;

	let files: any;
	let useExampleData = true;

	const loadItems = async (file: any) => {
		let text = await file.text();

		convertedData = rawToGraphDataConverter(JSON.parse(text));
		doRedraw = true;
	};

	$: {
		if (files && !useExampleData) {
			loadItems(files[0]);
		}
	}
	$: {
		if (useExampleData) {
			convertedData = rawToGraphDataConverter(simpleData);
			doRedraw = true;
		}
	}
</script>

<div>
	<label for="avatar">Upload a jsonfile:</label>
	<input accept="application/json" bind:files id="avatar" name="avatar" type="file" />
	<button
		on:click={() => {
			if (!files) {
				useExampleData = true;
			} else {
				useExampleData = !useExampleData;
			}
		}}
	>
		use example data: {useExampleData ? 'true' : 'false'}</button
	>
</div>
