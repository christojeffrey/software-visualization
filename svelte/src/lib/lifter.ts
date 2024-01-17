import type { GraphDataType, Group } from "./types";

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
function liftLinks (data: GraphDataType, liftDistance: number) {
    data.links = data.links.map((link) => {
        const sourceGroups: Group[] = data.groups.filter(group => group.leaves.includes(link.source))
            .sort(compareGroups);
        const targetGroups: Group[] = data.groups.filter(group => group.leaves.includes(link.target))
            .sort(compareGroups);

        const sourcePath = [...sourceGroups.map(s => s.id), link.source];
        const targetPath = [...targetGroups.map(s => s.id), link.target];
    
        const cp = commonPrefix(sourcePath, targetPath);

        return {
            source: sourcePath[cp + liftDistance] ?? link.source,
            target: targetPath[cp + liftDistance] ?? link.target,
        };
    });

    data.links = data.links.filter((link, index) => {
        return data.links.findIndex((link2) => {
            return link.source === link2.source && link.target === link2.target;
        }) === index;
    });
};

export {liftLinks};