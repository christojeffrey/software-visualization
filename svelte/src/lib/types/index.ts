export type ConfigType = {
	isGrouped: boolean;
	showNodeLabels: boolean;
	showLinkLabels: boolean;
	isForceSimulationEnabled: boolean;
	collapsedGroups: string[];
};
export type GraphDataType = {
	nodes: any[];
	links: any[];
	groups: any[];
	groupLinks: any[];
	groupButtons: any[];
};


export type GraphElementsType = {
	nodes: any;
	nodeLabels: any;
	links: any;
	linkLabels: any;
	groups: any;
	groupButtons: any;
};
export type Node = {
	id: string;
};
export type Link = {
	source: string;
	target: string;
	label?: string;
};
export type Group = {
	id: string;
	leaves: string[];
	color?: string;
	members?: any[];
	parent?: string;
	children?: string[];
};

export type RawEdge = {
	data: RawEdgeData;
};

// enum RawEdgeDataLabel {
// 	CONTAINS = 'contains',
// 	CONSTRUCT = 'construct',
// 	HOLDS = 'holds',
// 	CALLS = 'calls',
// 	ACCEPTS = 'accepts',
// 	SPECIALIZES = 'specializes',
// 	RETURNS = 'returns',
// 	ACCESSES = 'accesses'
// }
export type RawEdgeData = {
	id: string;
	source: string;
	target: string;
	label: string;
	properties: RawEdgeDataProperties;
};
export type RawEdgeDataProperties = {
	weight: number;
	containmentType?: string;
};

export type RawGraphData = {
	elements: RawGraphDataElements;
};
export type RawGraphDataElements = {
	nodes: RawNode[];
	edges: RawEdge[];
};
export type RawNode = {
	data: RawNodeData;
};
export type RawNodeData = {
	id: string;
	labels: string[];
	properties: RawNodeDataProperties;
};
export type RawNodeDataProperties = {
	simpleName: string;
	kind?: string;
};
