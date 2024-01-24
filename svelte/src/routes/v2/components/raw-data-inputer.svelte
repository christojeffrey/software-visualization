<script lang="ts">
    export let rawData: any;
    let files: any;
    let useExampleData = true;
</script>
<div>
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