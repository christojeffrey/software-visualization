import type { Group, Link, Node, RawEdge, RawGraphData } from './types';

export const rawToGraphDataConverter = (rawData: RawGraphData) => {
	const nodes: Node[] = rawData.elements.nodes
		.filter((node: any) => {
			return node.data.labels[0] !== 'Container';
		})

		.map((node: any) => {
			return {
				id: node.data.id
			};
		});

	const links: Link[] = rawData.elements.edges
		.filter((link: RawEdge) => {
			// get valid label list from type enum
			const validLabel = [
				'construct',
				'holds',
				'calls',
				'accepts',
				'specializes',
				'returns',
				'accesses'
			];
			return validLabel.includes(link.data.label);
		})
		.map((link: RawEdge) => {
			return {
				source: link.data.source,
				target: link.data.target,
				label: link.data.label
			};
		});
	const groups: Group[] = rawData.elements.nodes
		.filter((node: any) => {
			return node.data.labels[0] === 'Container';
		})
		.map((node: any) => {
			// random hex color
			const color = '#' + Math.floor(Math.random() * 16777215).toString(16);
			return {
				id: node.data.id,
				leaves: [],
				color
			};
		});
	rawData.elements.edges
		.filter((link: RawEdge) => {
			return link.data.label === 'contains';
		})
		.forEach((link: RawEdge) => {
			const group = groups.find((group: Group) => {
				return group.id === link.data.source;
			});
			if (group) {
				group.leaves.push(link.data.target);
			}
		});
	// handle contain another container,  recursively
	groups.forEach((group: Group) => {
		group.leaves = flattenGroupLeaves(groups, group);
	});

	return {
		nodes,
		links,
		groups
	};
};

function flattenGroupLeaves(groups: Group[], groupToFlatten: Group): string[] {
	// base case: group to flattern has no leaves
	if (groupToFlatten.leaves.length == 0) {
		return [];
	}
	// recursive
	const flattenedLeaves = [];
	for (let i = 0; i < groupToFlatten.leaves.length; i++) {
		const leaf = groupToFlatten.leaves[i];

		const leafAsAGroup = groups.find((group: Group) => {
			return group.id == leaf;
		});

		if (leafAsAGroup !== undefined) {
			flattenedLeaves.push(...flattenGroupLeaves(groups, leafAsAGroup));
		} else {
			flattenedLeaves.push(leaf);
		}
	}
	return flattenedLeaves;
}
