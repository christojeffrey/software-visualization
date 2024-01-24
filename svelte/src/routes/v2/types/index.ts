export interface ConfigInterface {
	dependencyLifting: {
		nodeId: string;
		depth: number;
	}[];
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
