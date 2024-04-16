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
	/** Remembers the last transformation in-between redraws. */
	transformation?: { k: number; x: number; y: number }; 
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
	/** Dictionary containing references to all nodes, indexed by id */
	nodesDict: {[id: string]: GraphDataNode};
}

export interface GraphDataEdge {
	/** The source / target of the edge, after edge lifting and other filter-operation */
 	source: string | GraphDataNode; 
	target: string | GraphDataNode;

	/** The source / target of the edge, when lifting would be applied at level 0 (used for lay-outing) */ 
	liftedSource?: GraphDataNode; 
	liftedTarget?: GraphDataNode;

	id: string;
	type: EdgeType;
	weight: number;
	originalWeight?: number;

	/** The original source / target of the edge, if filter operations are ignored */ 
	originalSource?: GraphDataNode;
	originalTarget?: GraphDataNode;

	/** Lists routing information for this edge, generated by layout algorithm */
	routing: EdgeRoutingPoint[];

	/** Used for (temporarily) storing the direction of the rendering coordinates during edge rendering */
	gradientDirection? : boolean;
	labelCoordinates?: {x: number; y: number} [];
}

/** Routing information for edges.
 * 
 * Represented by the x and y coordinates of a point that the edge should pass through, 
 * relative to the position of origin.
 * 
 * Origin is neither the source of the edge nor the target; it is the parentnode of the layout responsible 
 * for adding the RoutingPoint, to allow the use of relative coordinates.
 */
interface EdgeRoutingPoint {
	x: number,
	y: number,
	origin?: GraphDataNode,
}

export interface GraphDataNode extends SimpleNode {
	// initial data
	id: string;
	level: number;

	// bellow is initial data but already a Reference.
	members: GraphDataNode[];
	parent?: GraphDataNode;

	outgoingLinks: GraphDataEdge[];
	incomingLinks: GraphDataEdge[];

	/** The incoming/outgoing source/target of the edges, when lifting would be applied at level 0 (used for lay-outing)
	 *  Unrelated to whether it is actually being lifted */
	incomingLinksLifted: GraphDataEdge[];
	outgoingLinksLifted: GraphDataEdge[];

	originalOutgoingLinks: GraphDataEdge[];
	originalIncomingLinks: GraphDataEdge[];

	// created by draw steps
	originalMembers: GraphDataNode[];

	// Created by draw steps
	width?: number;
	height?: number;
	x?: number;
	y?: number;
}
