<script lang="ts">
    
    import { onMount } from 'svelte';
    import {cleanCanvas} from "./script";
	let svgElement: any; // Reference to the svg tag
	let simulations: any[];

	
    let rawData: any;
    let config:any;
    let drawSettings:any;
    
	let doRedraw = true;
	let isMounted = false;

	$: {
		if (isMounted) {
			// handle config changes
			if (doRedraw) {
				// remove the old data	
                cleanCanvas();

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
