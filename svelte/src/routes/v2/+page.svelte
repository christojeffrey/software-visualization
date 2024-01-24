<script lang="ts">
    
    import { onMount } from 'svelte';
    import {cleanCanvas} from "./scripts/clean-canvas";
    import {draw} from "./scripts/draw";
    import {filter} from "./scripts/filter";
    import {converter} from "./scripts/converter";
	import {createGraphData} from "./scripts/create-graph-data";
	import RawDataInputer from './components/raw-data-inputer.svelte';
	import ConfigChanger from './components/config-changer.svelte';
	import DrawSettingsChanger from './components/draw-settings-changer.svelte';
	
	let simulations: any[] = [];
    
	let rawData: any;
    let convertedData: any;
    const config:any = {
		collapsedVertices: []
	};
    let graphData: any;
    const drawSettings: any = {
		minimumVertexSize: 20,
	};
	let svgElement: any = {};
    
	let doReconvert = true;
	let doRecreateWholeGraphData = true;
    let doRefilter = false; // nothing to filter at first
	let doRedraw = true;

    let isMounted = false;
    
	$: {
		if (isMounted) {
			// handle config changes
            if (doReconvert) {
				convertedData = converter(rawData);
                doReconvert = false;

				// must recreate graph data after reconvert
				doRecreateWholeGraphData = true;
            }
			if(doRecreateWholeGraphData){
				graphData = createGraphData(convertedData);
				doRecreateWholeGraphData = false;
				
				// must refilter after recreate graph data
				doRefilter = true;
			}
            if (doRefilter) {
				filter(config, graphData);
                doRefilter = false;
				console.log(graphData);

				// must redraw after refilter
				doRedraw = true;
            }
			if (doRedraw) {
				// remove the old data	
                cleanCanvas(svgElement, simulations);

                let result = draw(svgElement, graphData, drawSettings, (datum:any)=>{
					// on collapse button clicked
					console.log("on collapse button clicked");
					config.collapsedVertices.push(datum);
					doRedraw = true;
				}, ()=>{
					// on lift
				});
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
	<div class="m-6 w-full">
		<svg bind:this={svgElement} class="w-full h-full"/>
	</div>

	<!-- vertical line -->
	<div class ="bg-neutral-300 w-[2px]"/>
	
	<!-- sidepanel -->
	<div class = "flex flex-col m-6">
		
		<RawDataInputer bind:rawData bind:doReconvert/>
		<div class ="bg-neutral-300 h-[1px]"/>
		<ConfigChanger/>
		<div class ="bg-neutral-300 h-[1px]"/>
		<DrawSettingsChanger/>

	</div>
</div>
