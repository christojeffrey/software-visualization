<script lang="ts">
	import Toggle from '$ui/toggle.svelte';
import Heading from '$ui/heading.svelte';
	import type { DrawSettingsInterface } from '../types';
	import Input from '$ui/input.svelte';
	import Button from '$ui/button.svelte';
	export let drawSettings: DrawSettingsInterface;
	export let doRedraw;
</script>

<div class="overflow-auto">
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

	<!-- seperator -->
	<div class="h-8"/>

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
	<!-- node padding -->
	<div>
		<Heading headingNumber={5}>node padding</Heading>
		<Input type="number" value={drawSettings.nodePadding} onChange={(e) => {
			drawSettings.nodePadding = Number(e.currentTarget.value);
			doRedraw = true;
		}} />
	</div>
	<!-- seperator -->
	<div class="h-8"/>

	<!-- default node color -->
	<div>
		<Heading headingNumber={5}>Default Node Color</Heading>
		<Input type="color" value={drawSettings.nodeDefaultColor} onChange={(e) => {
			drawSettings.nodeDefaultColor = e.currentTarget.value;
			doRedraw = true;
		}} />
	</div>

	<!-- node colors -->
	<div>
		<Heading headingNumber={5}>Node Colors</Heading>
		{#each drawSettings.nodeColors as color, index}
		<div class="flex">

				<Input type="color" value={color} onChange={(e) => {
					drawSettings.nodeColors[index] = e.currentTarget.value;
					doRedraw = true;
				}} />
		<!-- remove level -->
			<Button
			onClick={() => {
				drawSettings.nodeColors.splice(index, 1);
				doRedraw = true;
			}}
			>
				Remove this level
			</Button>
		</div>

		{/each}
		<!-- add new level -->
		<Button
			onClick={() => {
				drawSettings.nodeColors.push('#000000');
				doRedraw = true;
			}}
		>
			Add new level
		</Button>
	</div>
</div>
