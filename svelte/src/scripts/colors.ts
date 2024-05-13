import colourMap from 'colormap';
//@ts-ignore
import * as colorMapPallets from 'colormap/colorScale.js';

function invertHex(hex: string) {
	return '#' + (Number(`0x1${hex.substring(1)}`) ^ 0xffffff).toString(16).substr(1).toUpperCase();
}

/** Generates a node color pallet for DrawSettings, given the amount of layers */
export function getNodeColors(nrNodes: number, colorScheme: string) {
	if (!colorPallets.includes(colorScheme)) {
		throw new Error(
			`Invalid colorscheme passed to getColors: ${colorScheme} passed in, known schemes are ${colorPallets}`,
		);
	}
	const minimumSize: number = colorMapPallets[colorScheme].length;

	const nodeColors = colourMap({
		colormap: colorScheme,
		nshades: Math.max(nrNodes, minimumSize),
		format: 'hex',
		alpha: 1,
	});

	const nodeDefaultColor = invertHex(nodeColors[Math.floor(nodeColors.length / 2)]);
	console.log(nodeColors[Math.floor(nodeColors.length / 2)], nodeDefaultColor);

	return {
		nodeColors,
		nodeDefaultColor,
	};
}

export const colorPallets: string[] = Object.keys(colorMapPallets);
