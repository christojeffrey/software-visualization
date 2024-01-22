<script lang="ts">
	export let config: { shownEdgesType?: Map<string, boolean> };
	export let doRefilter;
	export let doRedraw; // Keeping it here to anticipate when only redrawing is needed
</script>

<div class="side-panel-container">
	<div class="filter-edge">
		<label for="edgeType">Filter edge type</label>
		{#if config.shownEdgesType}
			{#each config.shownEdgesType as [edgeType, isShown], index}
				<div>
					<label for={edgeType}>{edgeType}</label>
					<input
						type="checkbox"
						id={edgeType}
						name="edgeType"
						on:click={(e) => {
							config.shownEdgesType?.set(edgeType, e.currentTarget.checked);
							doRefilter = true;
						}}
						bind:checked={isShown}
					/>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.side-panel-container {
		display: flex;
		flex-direction: column;
		width: 200px;
	}
	.filter-edge {
		border: black;
	}
	button {
		margin: 1rem;
		padding: 1rem;
		width: 100%;
	}
</style>
