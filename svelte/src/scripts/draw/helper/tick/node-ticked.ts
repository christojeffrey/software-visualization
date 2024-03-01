import type { DrawSettingsInterface, GraphData, GraphDataNode } from '$types';
import { calculateWidthHeighXandYBasedOnChildrenRecursive, updateLocationNode, updateLocationNodeButtonsAndLabels } from './helper';

export function innerTicked(
	drawSettings: DrawSettingsInterface,
	membersContainerElement: d3.Selection<SVGGElement, GraphDataNode, SVGGElement, unknown>,
	memberElements: d3.Selection<SVGRectElement, GraphDataNode, SVGGElement, unknown>,
	nodeLabelsElements: d3.Selection<SVGTextElement, GraphDataNode, SVGGElement, unknown>,
	collapseButtonElements: d3.Selection<SVGCircleElement, GraphDataNode, SVGGElement, unknown>,
	liftButtonElements: d3.Selection<SVGCircleElement, GraphDataNode, SVGGElement, unknown>
) {
	updateLocationNode(membersContainerElement, memberElements);

	updateLocationNodeButtonsAndLabels(
		drawSettings,
		collapseButtonElements,
		liftButtonElements,
		nodeLabelsElements
	);
}

export function masterSimulationTicked(
	graphData: GraphData,
	containerElement: d3.Selection<SVGGElement, GraphDataNode, SVGGElement, unknown>,
	nodeElements: d3.Selection<SVGRectElement, GraphDataNode, SVGGElement, unknown>,
	drawSettings: DrawSettingsInterface,
	nodeLabelsElements: d3.Selection<SVGTextElement, GraphDataNode, SVGGElement, unknown>,
	collapseButtonElements: d3.Selection<SVGCircleElement, GraphDataNode, SVGGElement, unknown>,
	liftButtonElements: d3.Selection<SVGCircleElement, GraphDataNode, SVGGElement, unknown>
) {
	// calculate nodes width and height, x and y (which is cx and cy) - based on the location of the its members.
	// only do this calculation once, on master simulation
	calculateWidthHeighXandYBasedOnChildrenRecursive(graphData.nodes, drawSettings);

	// update node container and node elements location
	updateLocationNode(containerElement, nodeElements);

	// update node button and labels location
	updateLocationNodeButtonsAndLabels(
		drawSettings,
		collapseButtonElements,
		liftButtonElements,
		nodeLabelsElements
	);
}
