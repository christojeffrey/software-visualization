export interface RawInputType {
	// (generated via https://transform.tools/json-to-typescript)
	elements: {
		nodes: RawNodeType[];
		edges: RawEdgeType[];
	};
}
export interface RawNodeType {
	data: {
		id: string;
		properties: {
			simpleName: string;
			kind?: string;
			description?: string;
			rs?: string;
		};
		labels: string[];
	};
}

export interface RawEdgeType {
	data: {
		id: string;
		source: string;
		target: string;
		label?: string; // Does the same as labels
		labels?: string[];
		properties: {
			containmentType?: string;
			weight: number;
			specializationType?: string;
		};
	};
}
