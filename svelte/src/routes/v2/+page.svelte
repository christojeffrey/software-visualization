<script lang="ts">
    
    import { onMount } from 'svelte';
    import {cleanCanvas} from "./scripts/clean-canvas";
    import {draw} from "./scripts/draw";
    import {filter} from "./scripts/filter";
    import {converter} from "./scripts/converter";
	import RawDataInputer from './components/raw-data-inputer.svelte';
	import ConfigChanger from './components/config-changer.svelte';
	import DrawSettingsChanger from './components/draw-settings-changer.svelte';
	
	let simulations: any[];
    
	let rawData: any;
    let convertedData: any;
    const config:any = {};
    let graphData: any;
    const drawSettings: any = {};
	let svgElement: any = {};
    
	let doReconvert = true;
    let doRefilter = true;
	let doRedraw = true;

    let isMounted = false;
    
	$: {
		if (isMounted) {
			// handle config changes
            if (doReconvert) {
				convertedData = converter(rawData);
				console.log("convertedData");
				console.log(convertedData);
                doReconvert = false;

				// must refilter after reconvert
				doRefilter = true;
            }
            if (doRefilter) {
				graphData = filter(config, convertedData);
                doRefilter = false;

				// must redraw after refilter
				doRedraw = true;
            }
			if (doRedraw) {
				// remove the old data	
                cleanCanvas(svgElement, simulations);

                let result = draw(svgElement, graphData, drawSettings);
                simulations = result.simulations;
				doRedraw = false;
			}
		}
	}
	onMount(() => {
		isMounted = true;
	});
</script>

<div class="flex justify-between h-full">
	<!-- canvas -->
	<div class="m-6 border-2 border-black w-full">
		<svg bind:this={svgElement} class="w-full h-full"/>
	</div>

	<!-- vertical line -->
	<div class ="bg-neutral-300 w-1"/>

	<!-- sidepanel -->
	<div class = " m-6 border-2">
		<RawDataInputer bind:rawData bind:doReconvert/>
		<ConfigChanger/>
		<DrawSettingsChanger/>
	</div>
</div>

<style>
	.graph {
		/* border black 2px */
		border: 2px solid black;
		display: flex;
		justify-content: space-between;
	}
	.graph svg {
		/* border red 2px */
		border: 2px solid red;
	}
</style>
