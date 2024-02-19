import type { SimulationNodeDatum } from "d3";
import type { EdgeType } from "../../types";

export interface simluationNodeDatumType extends SimulationNodeDatum {
    id: string,
    width: number,
    height: number,
    cx?: number,
    cy?: number,
    level: number,
    members: simluationNodeDatumType[],
    parent?: simluationNodeDatumType,
    incomingLinks?: simluationLinkType[],
    outgoingLinks?: simluationLinkType[],
}

export interface simluationLinkType {
    id: string,
    index: number,
    source: simluationNodeDatumType,
    target: simluationNodeDatumType,
    type: EdgeType,
}
