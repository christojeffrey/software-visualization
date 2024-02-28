import type { SimulationNodeDatum } from "d3";
import type { EdgeType } from "$types";

export interface simulationNodeDatumType extends SimulationNodeDatum {
    id: string,
    width: number,
    height: number,
    cx?: number,
    cy?: number,
    level: number,
    members: simulationNodeDatumType[],
    parent?: simulationNodeDatumType,
    incomingLinks?: simulationLinkType[],
    outgoingLinks?: simulationLinkType[],
}

export interface simulationLinkType {
    id: string,
    index: number,
    source: simulationNodeDatumType,
    target: simulationNodeDatumType,
    type: EdgeType,
}
