<script lang="ts">
	import Toggle from '$ui/toggle.svelte';
	import Heading from '$ui/heading.svelte';
	import type {RawInputType} from '$types/raw-data';

	export let rawData: RawInputType | undefined;
	export let doReconvert: boolean;

	let files: any;
	let useExampleData = true;
	let disableButton = true;

	const loadItems = async (file: any) => {
		let text = await file.text();

		rawData = JSON.parse(text);
		doReconvert = true;
	};

	$: {
		if (files) {
			disableButton = false;
		} else {
			disableButton = true;
		}
	}

	// TODO: need to fix. whenever file is changed, bellow is triggered. we don't want unnecessary reconvert
	$: {
		if (useExampleData) {
			rawData = undefined;
			doReconvert = true;
		} else {
			loadItems(files[0]);
		}
	}
</script>

<div class="">
	<Heading>Input raw data</Heading>
	<label for="uploader">Upload a json file:</label>
	<input accept="application/json" bind:files id="uploader" name="uploader" type="file" />
	<Toggle
		class="mt-2"
		bind:state={useExampleData}
		onToggle={() => {
			if (!disableButton) {
				useExampleData = !useExampleData;
			}
		}}
		bind:disabled={disableButton}
	>
		Use example data
	</Toggle>
</div>
