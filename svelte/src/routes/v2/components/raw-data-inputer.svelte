<script lang="ts">
	import Button from "../../../ui/button.svelte";
import Heading from "../../../ui/heading.svelte";

    export let rawData: any;
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
		if (files){
			disableButton = false;
		}else{
			disableButton = true;
		}
	}

	// TODO: need to fix. whenever file is changed, bellow is triggered. we don't want unnecessary reconvert
	$: {
		if (useExampleData) {
			rawData = undefined;
			doReconvert = true;
		}
		else{
			loadItems(files[0]);
		}
	}
</script>
<div class="">
	<Heading>
		Input raw data
	</Heading>
    <label for="uploader">Upload a json file:</label>
	<input accept="application/json" bind:files id="uploader" name="uploader" type="file" />
	<Button class="mt-2" bind:state={useExampleData} onToggle={() => {
		if (!disableButton) {
			useExampleData = !useExampleData;
		}
	}} bind:disabled={disableButton}>
		Use example data
	</Button>
</div>