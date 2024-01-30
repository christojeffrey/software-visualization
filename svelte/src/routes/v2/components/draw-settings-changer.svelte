<script lang="ts">
	import Toggle from '$ui/toggle.svelte';
import Heading from '$ui/heading.svelte';
	import type { DrawSettingsInterface } from '../types';
	export let drawSettings: DrawSettingsInterface;
	export let doRedraw;
</script>

<div>
	<Heading class="mt-2">Draw Settings Changer</Heading>
	<div class="filter-edge">
		<Heading headingNumber={5}>Filter Edge</Heading>
		<div class="ml-4">
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
	<div>
	</div>
		<Heading headingNumber={5}>Show Edges Label</Heading>
		<Toggle
			class="ml-4"
			onToggle={() => {
				drawSettings.showEdgeLabels = !drawSettings.showEdgeLabels;
				doRedraw = true;
			}}
			state={drawSettings.showEdgeLabels}
		>
			{drawSettings.showEdgeLabels ? 'Hide' : 'Show'}
		</Toggle>
	</div>
	<div>
		<Heading headingNumber={5}>Show Node Label</Heading>
	</div>
</div>
