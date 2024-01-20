<script lang="ts">
    
    import { onMount } from 'svelte';
    import {cleanCanvas} from "./scripts/clean-canvas";
    import {draw} from "./scripts/draw";
    import {filter} from "./scripts/filter";
    import {converter} from "./scripts/converter";

	let simulations: any[];
    
    let rawData: any;
    let convertedData: any;
    const config:any = {};
    let graphData: any;
    const drawSettings: any = {};
	let svgElement: any = {};
    
	let doRedraw = true;
	let doReconvert = true;
    let doRefilter = true;
    let isMounted = false;
    
	$: {
		if (isMounted) {
			// handle config changes
            if (doReconvert) {
                // remove the old data	
                convertedData = converter(rawData);
                doReconvert = false;
            }
            if (doRefilter) {
                graphData = filter(config, convertedData);
                console.log(graphData);
                doRefilter = false;
            }
			if (doRedraw) {
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

<div class="graph">
	<svg bind:this={svgElement} />
	<div>

	</div>
</div>

<style>
	.graph {
		/* border black 2px */
		border: 2px solid black;
		display: flex;
		justify-content: space-between;
		padding: 2rem;
	}
	.graph svg {
		/* border red 2px */
		border: 2px solid red;
	}
</style>
