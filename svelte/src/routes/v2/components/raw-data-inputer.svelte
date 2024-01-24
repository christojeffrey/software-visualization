<script lang="ts">
    export let rawData: any;
	export let doReconvert: boolean;

    let files: any;
    let useExampleData = true;


	const loadItems = async (file: any) => {
		let text = await file.text();

		rawData = JSON.parse(text);

		doReconvert = true;
	};

	$: {
		if (files && !useExampleData) {
			loadItems(files[0]);
		}
	}
	$: {
		if (useExampleData) {
			rawData = undefined;
			doReconvert = true;
		}
	}
</script>
<div class="border-2 border-neutral-200">
    raw data inputer
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