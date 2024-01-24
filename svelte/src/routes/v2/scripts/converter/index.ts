import { type ConvertedData, type ConvertedEdge, type ConvertedNode, EdgeType } from '../../types';
import type { RawNodeType, rawInputType } from '../../types/raw-data';
import { simpleData } from './simple-data';

export function converter(rawData: rawInputType): ConvertedData {
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
			level: NaN
		};
	});

	let links: ConvertedEdge[] = rawData.elements.edges.map(({ data }): ConvertedEdge => {
		// find the correct type
		let type: EdgeType;
		switch (data.label) {
			case 'contains':
				type = EdgeType.contains;
				break;
			case 'constructs':
				type = EdgeType.constructs;
				break;
			case 'holds':
				type = EdgeType.holds;
				break;
			case 'calls':
				type = EdgeType.calls;
				break;
			case 'accepts':
				type = EdgeType.accepts;
				break;
			case 'specializes':
				type = EdgeType.specializes;
				break;
			case 'returns':
				type = EdgeType.returns;
				break;
			case 'accesses':
				type = EdgeType.accesses;
				break;
			case 'creates':
				type = EdgeType.creates;
				break;
			default:
				throw new Error(`Unknown edge type ${data.label}`);
		}
		return {
			id: data.id,
			source: data.source,
			target: data.target,
			type
		};
	});
	// at this point, we have no use for rawData. we only play with links and nodesAsObject

	// change nodes member based on links 'contains'
	links.forEach((link) => {
		if (link.type === EdgeType.contains) {
			// put child node inside parent node

			// create members array if not exist
			if (!nodesAsObject[link.source].members) {
				nodesAsObject[link.source].members = [];
			}
			nodesAsObject[link.source].members?.push(nodesAsObject[link.target]);

			// remove child node
			delete nodesAsObject[link.target];
		}
	});
	// delete links which type is 'contains'
	links = links.filter((link) => link.type !== EdgeType.contains);
	const nodes = Object.values(nodesAsObject);
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
		links,
		nodesDictionary: nodesAsObject
	};
}
