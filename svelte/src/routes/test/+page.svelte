<script lang="ts">
    
    import { onMount } from 'svelte';
    import {cleanCanvas} from "./scripts/clean-canvas";
    import {draw} from "./scripts/draw";
    import {filter, type ConfigInterface} from "./scripts/filter";
    import {converter, type ConvertedData} from "./scripts/converter";
	import { rawData } from '$lib/graph-data';
	
	let simulations: any[];
    
    let convertedData: ConvertedData;
    const config: ConfigInterface = {
		dependencyLifting: [],
	};
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
                convertedData = converter(undefined);
                doReconvert = false;
            }
            if (doRefilter) {
                graphData = filter(config, convertedData);
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
