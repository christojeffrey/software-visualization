import {
	type ConvertedData,
	type ConvertedEdge,
	type ConvertedNode,
	EdgeType,
	type RawDataConfigType,
} from '../../types';
import type {RawNodeType, RawInputType} from '../../types/raw-data';
import {simpleData} from '../../example-raw-data/simple-data';
import {v4 as uuidv4} from 'uuid';

const languagePrimitives: (string | RegExp)[] = [
	/java\.lang(.*)/,
	'int',
	'char',
	'byte',
	'short',
	'long',
	'float',
	'double',
	'boolean',
];

function isPrimitive(id: string) {
	if (languagePrimitives.includes(id)) {
		return true;
	} else {
		return (languagePrimitives.filter(t => typeof t != 'string') as RegExp[]).some(r => r.test(id));
	}
}

export function converter(rawData: RawInputType, config: RawDataConfigType): ConvertedData {
	// give default data when no data is given
	if (!rawData) {
		rawData = simpleData;
	}

	// The actual parsing.
	// nodes should be array, but let's use object first for faster lookup
	const nodesAsObject: {[id: string]: ConvertedNode} = {};

	// Populate object, so we can create references later
	rawData.elements.nodes.forEach(({data}: RawNodeType) => {
		if (config.filterPrimitives && isPrimitive(data.id)) {
			return;
		}
		nodesAsObject[data.id] = {
			id: data.id,
			level: 0,
			members: [],
		};
	});

	let links: ConvertedEdge[] = rawData.elements.edges
		.filter(
			({data}) =>
				!config.filterPrimitives || !(isPrimitive(data.source) || isPrimitive(data.target)),
		)
		.map(({data}): ConvertedEdge => {
			// Throw an error if label is not of type EdgeType
			const label = (data.label ?? data.labels?.[0] ?? EdgeType.unknown) as EdgeType;
			if (!Object.values(EdgeType).includes(label)) {
				console.log(new Set(rawData.elements.edges.map(r => r.data.label ?? r.data.labels?.[0])));
				throw new Error(`Unknown edge type ${label}`);
			}
			return {
				id: data.id ?? uuidv4(),
				source: data.source,
				target: data.target,
				type: label,
				weight: data.properties.weight,
			};
		});
	// at this point, we have no use for rawData. we only play with links and nodesAsObject

	// change nodes member based on links 'contains'
	links.forEach(link => {
		if (link.type === EdgeType.contains) {
			// put child node inside parent node
			nodesAsObject[link.source].members?.push(nodesAsObject[link.target]);
			nodesAsObject[link.target].level = NaN;
		}
	});
	// delete links which type is 'contains'
	links = links.filter(link => link.type !== EdgeType.contains);
	const nodes = Object.values(nodesAsObject).filter(node => node.level === 0);
	calulateNestingLevels(nodes);

	function calulateNestingLevels(node: ConvertedNode[], level: number = 0) {
		node.forEach(n => {
			n.level = level;
			if (n.members) {
				calulateNestingLevels(n.members, level + 1);
			}
		});
	}
	return {
		nodes,
		links,
	};
}
export default converter;
