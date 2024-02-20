import { type ConvertedData, type ConvertedEdge, type ConvertedNode, EdgeType } from '../../types';
import type { RawNodeType, RawInputType } from '../../types/raw-data';
import { simpleData } from '../../example-raw-data/simple-data';

export function converter(rawData: RawInputType): ConvertedData {
	// give default data when no data is given
	if (!rawData) {
		rawData = simpleData;
	}

	// The actual parsing.
	// nodes should be array, but let's use object first for faster lookup
	const nodesAsObject: { [id: string]: ConvertedNode } = {};

	// Populate object, so we can create references later
	rawData.elements.nodes.forEach(({ data }: RawNodeType) => {
		nodesAsObject[data.id] = {
			id: data.id,
			level: 0,
			members: []
		};
	});

	let links: ConvertedEdge[] = rawData.elements.edges.map(({ data }): ConvertedEdge => {
		// Throw an error if label is not of type EdgeType
		const label = (data.label ?? data.labels?.[0] ?? EdgeType.unknown) as EdgeType;
		if (!Object.values(EdgeType).includes(label)) {
			console.log(new Set(rawData.elements.edges.map((r) => r.data.label ?? r.data.labels?.[0])));
			throw new Error(`Unknown edge type ${label}`);
		}
		return {
			id: data.id,
			source: data.source,
			target: data.target,
			type: label,
			weight: data.properties.weight
		};
	});
	// at this point, we have no use for rawData. we only play with links and nodesAsObject

	// change nodes member based on links 'contains'
	links.forEach((link) => {
		if (link.type === EdgeType.contains) {
			// put child node inside parent node
			nodesAsObject[link.source].members?.push(nodesAsObject[link.target]);
			nodesAsObject[link.target].level = NaN;
		}
	});
	// delete links which type is 'contains'
	links = links.filter((link) => link.type !== EdgeType.contains);
	const nodes = Object.values(nodesAsObject).filter((node) => node.level === 0);
	calulateNestingLevels(nodes);

	function calulateNestingLevels(node: ConvertedNode[], level: number = 0) {
		node.forEach((n) => {
			n.level = level;
			if (n.members) {
				calulateNestingLevels(n.members, level + 1);
			}
		});
	}
	return {
		nodes,
		links
	};
}
export default converter;
