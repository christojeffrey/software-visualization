import type { GraphDataType, Group, LiftDependencyType } from "./types";

// Define function to compare 2 groups, by nesting level 
// (intended for Array.prototype.sort(), largest group sorts to the start of the array)
// TODO: parsing seems insufficient (amount of leaves might be equal for 2 classes)
function compareGroups(a: Group, b: Group) {
    if (b.leaves.every((s) => a.leaves.includes(s)))  return -1;
    if (a.leaves.every((s) => b.leaves.includes(s)))  return 1;
    console.error('Invalid input data', {a, b}); return 0;
}

// Find length of common prefix of 2 string arrays
function commonPrefix(a: string[], b: string[]) {
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) {i++}
    return i;
}

// Lifts dependency for links.
function liftLinks (data: GraphDataType, liftDependencies: LiftDependencyType[]) {
    data.links = data.links.map((link) => {
        // Get a list of relevant nodes
        const sourceGroups: Group[] = data.groups.filter(group => group.leaves.includes(link.source))
            .sort(compareGroups);
        const targetGroups: Group[] = data.groups.filter(group => group.leaves.includes(link.target))
            .sort(compareGroups);

        const sourcePath = [...sourceGroups.map(s => s.id), link.source];
        const targetPath = [...targetGroups.map(s => s.id), link.target];

        // Find the desired maximum allowed distance between 2 node paths
        // Use infinity as default, since an index out of bounds will return the original edge later
        const liftingDistance: number = [...sourceGroups, ...targetGroups].reduce<number>((a: number, c: Group) => {
            const tmp = liftDependencies.find((group) => group.id === c.id);
            const b = tmp?.level ?? Infinity;
            return Math.min(a, b);
        }, Infinity as number);

    
        // Finally, calculate the actual lift
        const cp = commonPrefix(sourcePath, targetPath);
        return {
            source: sourcePath[cp + liftingDistance] ?? link.source,
            target: targetPath[cp + liftingDistance] ?? link.target,
        };
    });

    // Filter out double edges
    data.links = data.links.filter((link, index) => {
        return data.links.findIndex((link2) => {
            return link.source === link2.source && link.target === link2.target;
        }) === index;
    });
};

export {liftLinks};