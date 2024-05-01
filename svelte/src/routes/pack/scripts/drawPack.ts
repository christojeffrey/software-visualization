/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: remove above line
const FACTOR = 100;
const PADDING = 2;
import * as d3 from 'd3';
const layers = ['Presentation Layer', 'Service Layer', 'Data Source Layer', 'Domain Layer'];

export default function drawPack(
	canvas: d3.Selection<SVGGElement, unknown, null, undefined>,
	roots: any[],
	writeDetailHover: (detail: string) => void,
) {
	// 1. COMPUTE
	roots.forEach((root, index: number) => {
		// 1. Compute the pack layout.
		const pack = d3.pack<any>();
		pack.padding(PADDING);

		// // Sum and sort the data.
		root.sum((d: any) => d.count);

		// determine the max size of the root based on its value
		const size = Math.sqrt(Math.sqrt(root.value)) * FACTOR; // make it non linear
		pack.size([size, size]);

		pack(root);

		// 2. find the total 'count' attribute for each layer
		const layerCount: any = {
			'Presentation Layer': 0,
			'Service Layer': 0,
			'Data Source Layer': 0,
			'Domain Layer': 0,
			'Unknown Layer': 0,
		};
		let total = 0;
		root.each((d: any) => {
			let layer = d.data.layer;
			if (!layers.includes(layer)) {
				console.log('Unknown Layer:', layer);
				layer = 'Unknown Layer';
			}
			layerCount[layer] += d.data.count;
			total += d.data.count;
		});

		const layerPercentage = Object.keys(layerCount).reduce((acc: any, key) => {
			acc[key] = (layerCount[key] / total) * 100;
			return acc;
		}, {});

		// find the dominants layer, and remove non dominant layer.
		/*
		step
		1. sort the layerPercentage from highest to lowest
		2. if the second highest is more than 1.5 times the highest, the it's considered as dominant
		3. do this until non dominan is found, then truncate the rest
		*/
		// turn the layerPercentage into array
		const layerPercentageArray = Object.keys(layerPercentage).map(key => {
			return {layer: key, percentage: layerPercentage[key]};
		});
		// sort the layerPercentageArray from highest to lowest
		layerPercentageArray.sort((a, b) => b.percentage - a.percentage);

		const dominantLayer = [layerPercentageArray[0]];
		let layerIndexToCheck = 1;
		while (layerIndexToCheck < layerPercentageArray.length) {
			const currentLayer = layerPercentageArray[layerIndexToCheck];
			const previousLayer = layerPercentageArray[layerIndexToCheck - 1];
			if (currentLayer.percentage * 1.5 > previousLayer.percentage) {
				dominantLayer.push(currentLayer);
			} else {
				break;
			}
			layerIndexToCheck++;
		}

		// attach the layerPercentage to the root
		root.data.dominantLayer = dominantLayer;
		root.data.layerPercentageArray = layerPercentageArray;
	});

	// draw the layer as rectangle
	// height is the biggest pack size
	const biggestRootRadius = roots.reduce((acc, root) => {
		if (acc.value < root.value) {
			return root;
		}
		return acc;
	});
	const layerHeight = biggestRootRadius.r * 3;
	// CALCULATE LAYOUT
	// find the y for each root based on the dominantLayer

	let maxWidth = 0;
	const previousRoots: any = [];
	roots.forEach((root, index: number) => {
		const dominantLayer = root.data.dominantLayer;
		/*
			if dominant layer > 2 ,set Y to be -100
			if dominant layer = 2, check the two layer. if they're side to side, calculate based on the ratio of those two layer. 
			if not, set Y to be -100
			if dominant layer = 1, set Y the center of that layer
		*/
		if (dominantLayer.length > 2) {
			root.containerY = -100;
		} else if (dominantLayer.length === 2) {
			const layer1 = dominantLayer[0].layer;
			const layer2 = dominantLayer[1].layer;
			const layer1Index = layers.indexOf(layer1);
			const layer2Index = layers.indexOf(layer2);
			if (layer1Index + 1 === layer2Index || layer1Index - 1 === layer2Index) {
				const layer1 = dominantLayer[0].layer;
				const layer1Index = layers.indexOf(layer1);
				const layer1Location = (layer1Index + 0.5) * layerHeight;
				const layer1Percentage = dominantLayer[0].percentage;

				const layer2 = dominantLayer[1].layer;
				const layer2Index = layers.indexOf(layer2);
				const layer2Location = (layer2Index + 0.5) * layerHeight;
				const layer2Percentage = dominantLayer[1].percentage;

				console.log(layer1Location);
				console.log(layer2Location);
				console.log(layer1Percentage);
				console.log(layer2Percentage);

				// calculate based on ratio
				const distanceAdded =
					(layer2Location - layer1Location) *
					(layer2Percentage / (layer1Percentage + layer2Percentage));
				root.containerY = layer1Location + distanceAdded;
			} else {
				root.containerY = -100;
			}
		} else if (dominantLayer.length === 1) {
			const layer = dominantLayer[0].layer;
			const layerIndex = layers.indexOf(layer);
			root.containerY = (layerIndex + 0.5) * layerHeight;
		} else {
			root.containerY = -100;
		}
		// the coordinate is from top left.
		root.containerY -= root.r;

		// calculate the x. check if it overlaps with previous roots. if it does, move it to the right then check again
		root.containerX = 0;
		let isOverlap = false;
		do {
			isOverlap = false;
			for (let i = 0; i < previousRoots.length; i++) {
				const previousRoot = previousRoots[i];
				const circle1 = {
					x: previousRoot.containerX + previousRoot.r, // center of the circle
					y: previousRoot.containerY + previousRoot.r, // center of the circle
					r: previousRoot.r,
				};
				const circle2 = {
					x: root.containerX + root.r, // center of the circle
					y: root.containerY + root.r, // center of the circle
					r: root.r,
				};
				if (doesCircleOverlap(circle1, circle2)) {
					isOverlap = true;
					if (previousRoots.length === 5) {
						console.log('overlap');
						console.log('root.containerX', root.containerX);
					}
					root.containerX += findMoveNeededInXForCircle2(circle1, circle2) + 1;
					if (previousRoots.length === 5) {
						console.log('new root.containerX', root.containerX);
					}
					break;
				}
			}
		} while (isOverlap);
		previousRoots.push(root);

		if (root.containerX + root.r * 2 > maxWidth) {
			maxWidth = root.containerX + root.r * 2;
		}

		console.log('root.containerY', root.containerY);
		console.log('root.containerX', maxWidth);
	});

	// RENDER LAYER
	const layerWidth = maxWidth;
	layers.forEach((layer, i) => {
		canvas
			.append('rect')
			.attr('x', 0)
			.attr('y', i * layerHeight)
			.attr('width', layerWidth)
			.attr('height', layerHeight)
			.attr('fill', () => {
				// based on data.layer
				if (layer === 'Data Source Layer') {
					return 'rgba(0, 100, 0, 0.2)';
				} else if (layer === 'Domain Layer') {
					return 'rgba(100, 0, 0, 0.2)';
				} else if (layer === 'Presentation Layer') {
					return 'rgba(0, 0, 100, 0.2)';
				} else if (layer === 'Service Layer') {
					return 'rgba(100, 100, 0, 0.2)';
				} else {
					return 'rgba(0, 0, 0, 0)';
				}
			})
			.attr('stroke', 'black');

		canvas
			.append('text')
			.attr('x', 5)
			.attr('y', i * layerHeight + 15)
			.attr('fill', 'black')
			.attr('text-anchor', 'start')
			.attr('font-size', '10px')
			.text(layer);
	});

	// 2. RENDER PACKS
	roots.forEach((root, index: number) => {
		const containerElement = canvas
			.append('g')
			.attr('transform', `translate(${root.containerX},${root.containerY})`)
			.attr('id', `root-${index}`);

		// add container drag
		containerElement.call(
			d3
				.drag<any, any>()
				.on('drag', function (event) {
					console.log(event);
					const x = event.dx;
					const y = event.dy;
					root.containerX += x;
					root.containerY += y;
					d3.select(this).attr('transform', `translate(${root.containerX},${root.containerY})`);
				})
				.on('start', function (event) {
					// drag always assume from the center.
					// TODO: first, reposition based on mouse location relative to the node center
				}),
		);

		root.each((d: any) => {
			const node = containerElement
				.append('g')
				.attr('transform', `translate(${d.x},${d.y})`)
				.attr('class', 'node');

			node
				.append('circle')
				.attr('r', d.r)
				.attr('fill', () => {
					// based on data.layer
					if (d?.data?.layer === 'Data Source Layer') {
						return 'rgba(0, 100, 0, 0.2)';
					} else if (d?.data?.layer === 'Domain Layer') {
						return 'rgba(100, 0, 0, 0.2)';
					} else if (d?.data?.layer === 'Presentation Layer') {
						return 'rgba(0, 0, 100, 0.2)';
					} else if (d?.data?.layer === 'Service Layer') {
						return 'rgba(100, 100, 0, 0.2)';
					} else {
						return 'rgba(0, 0, 0, 0)';
					}
				})
				.attr('stroke', 'black');

			node.on('mouseover', function () {
				const hoverDetail = JSON.stringify(d.data, null, '\t');
				writeDetailHover(hoverDetail);

				d3.select(this).select('circle').attr('stroke-width', 2);
			});

			node.on('mouseout', function () {
				writeDetailHover('');
				d3.select(this).select('circle').attr('stroke-width', 1);
			});

			node
				.append('text')
				.attr('dy', '0.3em')
				.attr('fill', 'black')
				.attr('text-anchor', 'middle')
				.attr('font-size', '10px')
				.text(d.data.id);
		});
	});
}

type Circle = {
	x: number;
	y: number;
	r: number;
};
function doesCircleOverlap(circle1: Circle, circle2: Circle) {
	return findMoveNeededInXForCircle2(circle1, circle2) > 0;
}

// find the x and lock the y for the circle to not overlap new x must be to the right of the circle1
function findMoveNeededInXForCircle2(circle1: Circle, circle2: Circle) {
	const targetDistanceInX = Math.sqrt((circle1.r + circle2.r) ** 2 - (circle1.y - circle2.y) ** 2);
	if (Number.isNaN(targetDistanceInX)) {
		return 0;
	}
	const currentDistanceInX = Math.abs(circle1.x - circle2.x);
	let moveNeeded = targetDistanceInX - currentDistanceInX;
	// if circle2 is to the left, add 2 * currentDistanceInX
	if (circle2.x < circle1.x) {
		moveNeeded += 2 * currentDistanceInX;
	}
	console.log('moveNeeded', moveNeeded);
	console.log(targetDistanceInX, currentDistanceInX);
	console.log(JSON.stringify(circle1));
	console.log(JSON.stringify(circle2));
	return moveNeeded;
}
