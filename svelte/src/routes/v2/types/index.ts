export interface ConfigInterface {
	dependencyLifting: {
		node: GraphDataNode;
		depth: number;
	}[];
	dependencyTolerance: number;
	collapsedVertices: any[];
}

export interface DrawSettingsInterface {
	minimumVertexSize: number;
	buttonRadius: number;
	nodeCornerRadius: number;
	nodePadding: number;
	shownEdgesType: Map<EdgeType, boolean>;
	showNodeLabels: boolean;
	showEdgeLabels: boolean;
	nodeDefaultColor: string;
	nodeColors: string[];
	transformation?: { k: number; x: number; y: number }; // Used to remember the last transformation in-between redraws.
}

export interface ConvertedNode {
	id: string;
	members: ConvertedNode[];
	parentId?: string;
	level: number;
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
	nodesDictionary: NodesDictionaryType;
}

export interface NodesDictionaryType {
	[id: string]: ConvertedNode;
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

export type GraphData = {
	nodes: GraphDataNode[];
	links: GraphDataEdge[];
	flattenNodes: ConvertedNode[];
};
export type GraphDataEdge = {
	source: GraphDataNode;
	target: GraphDataNode;
	id: string;
	type: EdgeType;
	weight: number;
	originalWeight?: number;
	originalSource?: GraphDataNode;
	originalTarget?: GraphDataNode;
};
export type GraphDataNode = {
	id: string;
	level: number;
	members?: GraphDataNode[];
	parent?: GraphDataNode;
	originalMembers?: GraphDataNode[];
	outgoingLinks?: GraphDataEdge[];
	incomingLinks?: GraphDataEdge[];
};
