export interface ConfigInterface {
	dependencyLifting: {
		nodeId: string;
		depth: number;
	}[];
	dependencyTolerance: number;
	collapsedVertices: any[];
}

export interface ConvertedNode {
	id: string;
	members?: ConvertedNode[];
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
	contains = 'contains',
	constructs = 'constructs',
	holds = 'holds',
	calls = 'calls',
	accepts = 'accepts',
	specializes = 'specializes',
	returns = 'returns',
	accesses = 'accesses',
	creates = 'creates'
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
