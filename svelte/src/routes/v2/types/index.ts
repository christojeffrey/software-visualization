export interface ConfigInterface {
	dependencyLifting: {
		nodeId: string;
		depth: number;
	}[];
	dependencyTolerance: number;
	collapsedVertices: any[];
}

export interface DrawSettingsInterface {
	minimumVertexSize: number;
	shownEdgesType: Map<EdgeType, boolean>;
	showNodeLabels: boolean;
	showEdgeLabels: boolean;
	transformation?: { k: number; x: number; y: number }; // Used to remember the last transformation in-between redraws.
}

export interface ConvertedNode {
	id: string;
	members: ConvertedNode[];
	parentId?: string;
	level: number;
}

export interface NodesDictionaryType {
	[id: string]: ConvertedNode;
}

export interface ConvertedEdge {
	id: string;
	source: string;
	target: string;
	type: EdgeType;
}

export enum EdgeType {
	// (in retrospect, this might not need to be an enum)
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

export interface ConvertedData {
	nodes: ConvertedNode[];
	links: ConvertedEdge[];
	nodesDictionary: NodesDictionaryType;
}

export type PreGraphData = {
	nodes: GraphDataNode[];
	links: PreGraphDataEdge[];
	flattenNodes: ConvertedNode[];
};
export type PreGraphDataEdge = {
	source: string;
	target: string;
	id: string;
	type: EdgeType;
};
export type GraphDataNode = {
	id: string;
	level: number;
	members?: GraphDataNode[];
	parent?: GraphDataNode;
	originalMembers?: GraphDataNode[];
	outgoingLinks?: PreGraphDataEdge[];
	incomingLinks?: PreGraphDataEdge[];
};
