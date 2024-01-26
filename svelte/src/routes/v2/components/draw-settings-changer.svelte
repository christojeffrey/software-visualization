<script lang="ts">
	import Heading from '$ui/heading.svelte';
	export let drawSettings: any;
	export let doRedraw;
</script>

<div>
	<Heading class="mt-2">Draw Settings Changer</Heading>
	<div class="filter-edge">
		<label for="edgeType">Filter edge type</label>
		{#if drawSettings.shownEdgesType}
			{#each drawSettings.shownEdgesType as [edgeType, isShown], index}
				<div>
					<label for={edgeType}>{edgeType}</label>
					<input
						type="checkbox"
						id={edgeType}
						name="edgeType"
						on:click={(e) => {
							drawSettings.shownEdgesType?.set(edgeType, e.currentTarget.checked);
							doRedraw = true;
						}}
						bind:checked={isShown}
					/>
				</div>
			{/each}
		{/if}
	</div>
</div>
