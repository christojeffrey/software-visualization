// PLAN B CHARGE FORCE!

import * as d3 from 'd3';
import type {simulationLinkType, simulationNodeDatumType} from './types';

interface simulationNOdeDatumTypeExt extends simulationNodeDatumType {
	treeData?: {
		targets: Map<simulationNodeDatumType, number>; // Store nodes at lower level
		level: number; // The depth of the node in the tree
	};
}

/**
 * Caculates a set of arboricities on the given graph, but only on the top level in the dependency hierarchy.
 * (Not necicarilly maximal or efficient)
 *
 * Stores data in a new property treeData on the node (in place)
 *
 * TODO move to parser
 * */
function findArboricity(nodes: simulationNOdeDatumTypeExt[]) {
	// Helper functions
	function getOutLinks(node: simulationNOdeDatumTypeExt): simulationLinkType[] {
		return node.members.flatMap(m => getOutLinks(m)).concat(node.outgoingLinks ?? []);
	}

	function getCompoundNode(node: simulationNodeDatumType): simulationNodeDatumType {
		if (nodes.includes(node)) {
			return node;
		} else if (node.parent) {
			return getCompoundNode(node.parent);
		} else {
			throw `Invalid node data, ${node.id} is not related to any node passed to findArboricity`;
		}
	}

	// (Works in place!)
	function liftOutLinks(node: simulationNOdeDatumTypeExt, links: simulationLinkType[]) {
		links.forEach(link => {
			const outNode = getCompoundNode(link.target);
			if (outNode !== node) {
				node.treeData!.targets!.set(outNode, (node.treeData!.targets!.get(outNode) ?? 0) + 1);
			}
		});
	}

	// Start actual logic
	// Prepare data/structure
	// All dependencies must be lifted, but not in render data
	nodes.forEach(node => {
		node.treeData = {
			targets: new Map(),
			level: NaN,
		};
		const links = getOutLinks(node);
		liftOutLinks(node, links);
	});

	// Get node with maximum outgoing connections, we assume this is the root of the first arboricity.
	const findRootReduce = (a: simulationNOdeDatumTypeExt, node: simulationNOdeDatumTypeExt) =>
		node.treeData!.targets.size > a.treeData!.targets.size ? node : a;
	const initialRoot = nodes.reduce(findRootReduce);
	initialRoot.treeData!.level = 0;

	// Set up hull data
	const nodesCovered = new Set<simulationNOdeDatumTypeExt>();
	const levelMap = new Map<number, Set<simulationNOdeDatumTypeExt>>(); // Necacary for calculating force strength eventually.

	/**
	 * Helper function, to caculate arboricity/tree structure (Greedy algorithm)
	 * Assumes everything is connected
	 * */
	function calculateTree(node: simulationNOdeDatumTypeExt, level: number): void {
		// Add current node to cover
		node.treeData!.level = level;
		if (levelMap.has(level)) {
			levelMap.get(level)!.add(node);
		} else {
			levelMap.set(level, new Set());
		}
		nodesCovered.add(node);

		let options: {weigth: number; target: simulationNOdeDatumTypeExt; level: number}[] = [];
		do {
			options = [];
			nodesCovered.forEach(n => {
				n.treeData!.targets.forEach((weigth, target) => {
					if (!nodesCovered.has(target)) {
						const o = options.find(o => o.target === target);
						if (o) {
							o.weigth += weigth;
						} else if (!nodesCovered.has(target)) {
							options.push({weigth, target, level: n.treeData!.level + 1});
						}
					}
				});
			});
			if (options.length > 0) {
				const bestOption = options.reduce((a, o) => {
					if (!a || o.weigth > a.weigth) return o;
					return a;
				});
				calculateTree(bestOption.target, bestOption.level);
			}
		} while (options.length > 0);
	}

	calculateTree(initialRoot, 0);

	// For now, we assume this check failing means we found a disconnected component.
	// (Obviously, this might not be the case)
	while (nodesCovered.size < nodes.length) {
		const newRoot = nodes.filter(n => !nodesCovered.has(n)).reduce(findRootReduce)!;
		nodesCovered.add(newRoot);
		calculateTree(newRoot, 0);
	}

	return levelMap;
}

export function addStaticTreeLayout(
	nodes: simulationNodeDatumType[],
	simulation: d3.Simulation<simulationNodeDatumType, undefined>,
) {
	const levelMap = findArboricity(nodes);
	const treeForce = d3.forceY((d: simulationNOdeDatumTypeExt) => {
		let res = 30;
		for (let i = 0; i < d.treeData!.level; i++) {
			let maxHeight = 0;
			levelMap.get(i)!.forEach(node => {
				maxHeight = Math.max(node.height ?? 0, maxHeight ?? 0);
			});
			res += maxHeight;
		}
		return res;
	});

	// horrible hack
	setTimeout(function () {
		simulation.force('y', treeForce);
	}, 1000);
}
