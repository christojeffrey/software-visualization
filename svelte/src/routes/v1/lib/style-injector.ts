import type { LINK_COLOR_MAP } from './constants';

// TODO: Change d type into Link
export function linkStrokeValue(
	d: any,
	colorMap: { [key in keyof typeof LINK_COLOR_MAP]: string[] }
) {
    const linkTypes = Object.keys(colorMap)
    if (!linkTypes.includes(d.label)) return '#aaa'
    return colorMap[d.label as keyof typeof LINK_COLOR_MAP][0]
}
