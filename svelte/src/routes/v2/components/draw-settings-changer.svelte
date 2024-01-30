<script lang="ts">
	import Toggle from '$ui/toggle.svelte';
import Heading from '$ui/heading.svelte';
	import type { DrawSettingsInterface } from '../types';
	import Input from '$ui/input.svelte';
	export let drawSettings: DrawSettingsInterface;
	export let doRedraw;
</script>

<div>
	<Heading class="mt-2">Draw Settings Changer</Heading>
	<!-- Filter Edge -->
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

	</div>

	<!-- Show Edges Label -->
	<div>
		
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

	<!-- Show Node Label -->
	<div>
		<Heading headingNumber={5}>Show Node Label</Heading>
		<Toggle
			class="ml-4"
			onToggle={() => {
				drawSettings.showNodeLabels = !drawSettings.showNodeLabels;
				doRedraw = true;
			}}
			state={drawSettings.showNodeLabels}
		>
			{drawSettings.showNodeLabels ? 'Hide' : 'Show'}
		</Toggle>
	</div>

	<!-- Button Radius -->
	<div>
		<Heading headingNumber={5}>Button Radius</Heading>
		<Input type="number" value={drawSettings.buttonRadius} onChange={(e) => {
			drawSettings.buttonRadius = Number(e.currentTarget.value);
			doRedraw = true;
		}} />
	</div>
	<!-- Node Size -->
	<div>
		<Heading headingNumber={5}>Node Size</Heading>
		<Input type="number" value={drawSettings.minimumVertexSize} onChange={(e) => {
			drawSettings.minimumVertexSize = Number(e.currentTarget.value);
			doRedraw = true;
		}} />
	</div>
	<!-- nodeCornerRadius -->
	<div>
		<Heading headingNumber={5}>node Corner Radius</Heading>
		<Input type="number" value={drawSettings.nodeCornerRadius} onChange={(e) => {
			drawSettings.nodeCornerRadius = Number(e.currentTarget.value);
			doRedraw = true;
		}} />
	</div>
</div>
