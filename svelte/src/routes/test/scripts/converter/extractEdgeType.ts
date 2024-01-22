export function extractEdgeType(links: any) {
	const edgeTypeMap = new Map<string, boolean>();
	let firstType = true;
	links.forEach((link: any) => {
		if (link.type) {
			edgeTypeMap.set(link.type, firstType);
		}
		firstType = false;
	});
	return edgeTypeMap;
}