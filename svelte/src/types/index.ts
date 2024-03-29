export type { RawInputType } from './raw-data';

export interface ConfigInterface {
	dependencyLifting: {
		node: GraphDataNode;
		sensitivity: number;
	}[];
	dependencyTolerance: number;
	collapsedNodes: GraphDataNode[];
}

export interface DrawSettingsInterface {
	minimumNodeSize: number;
	buttonRadius: number;
	nodeCornerRadius: number;
	nodePadding: number;
	textSize: number;
	shownEdgesType: Map<EdgeType, boolean>;
	showNodeLabels: boolean;
	showEdgeLabels: boolean;
	nodeDefaultColor: string;
	nodeColors: string[];
	disableAnimation: boolean;
	transformation?: { k: number; x: number; y: number }; // Used to remember the last transformation in-between redraws.
}

export interface SimpleNode {
	id: string;
	level: number;
	members?: SimpleNode[];
}
export interface ConvertedNode extends SimpleNode {
	id: string;
	level: number;
	members?: ConvertedNode[];
	parentId?: string;
}
export interface ConvertedEdge {
	id: string;
	source: string;
	target: string;
	type: EdgeType;
	weight: number;
}
export interface ConvertedData {
	nodes: ConvertedNode[];
	links: ConvertedEdge[];
}

export interface SimpleNodesDictionaryType {
	[id: string]: GraphDataNode;
}

// (in retrospect, this might not need to be an enum)
export enum EdgeType {
	contains = 'contains',
	constructs = 'constructs',
	holds = 'holds',
	calls = 'calls',
	accepts = 'accepts',
	specializes = 'specializes',
	returns = 'returns',
	accesses = 'accesses',
	creates = 'creates',
	exhibits = 'exhibits',
	invokes = 'invokes',
	type = 'type',
	hasVariable = 'hasVariable',
	hasParameter = 'hasParameter',
	hasScript = 'hasScript',
	returnType = 'returnType',
	instantiates = 'instantiates',
	// Temp fix, some of our input data does not have the edge type.
	unknown = 'UNKNOWN'
}

export interface GraphData {
	nodes: GraphDataNode[];
	links: GraphDataEdge[];
	flattenNodes: GraphDataNode[];
}
export interface GraphDataEdge extends d3.SimulationLinkDatum<GraphDataNode> {
	source: GraphDataNode;
	target: GraphDataNode;
	id: string;
	type: EdgeType;
	weight: number;
	originalWeight?: number;
	originalSource: GraphDataNode;
	originalTarget: GraphDataNode;
}
export interface GraphDataNode extends d3.SimulationNodeDatum, SimpleNode {
	// initial data
	id: string;
	level: number;
	// bellow is initial data but already a Reference.
	members: GraphDataNode[];
	parent?: GraphDataNode;

	outgoingLinks: GraphDataEdge[];
	incomingLinks: GraphDataEdge[];

	originalOutgoingLinks: GraphDataEdge[];
	originalIncomingLinks: GraphDataEdge[];

	// created by draw steps
	originalMembers: GraphDataNode[];

	width: number;
	height: number;

	// injected by d3
	x: number;
	y: number;
}
