// place files you want to import through the `$lib` alias in this folder.




const nodes = [
	{ id: 1, level: 1 },
	{ id: 2, level: 2 },
	{ id: 3, level: 2 },
	{ id: 4, level: 2 },
	{ id: 5, level: 3 },
	{ id: 6, level: 3 },
	{ id: 7, level: 3 },
	{ id: 8, level: 3 },
	{ id: 9, level: 3 },
	{ id: 10, level: 3 },
	{ id: 10, level: 3 },
	{ id: 11, level: 4 },
	{ id: 12, level: 4 },
	{ id: 13, level: 4 },
	{ id: 14, level: 4 },
	{ id: 15, level: 4 },
	{ id: 16, level: 4 }
];
const links = [
	{ source: 1, target: 2 },
	{ source: 1, target: 3 },
	{ source: 1, target: 4 },
	{ source: 2, target: 5 },
	{ source: 2, target: 6 },
	{ source: 3, target: 7 },
	{ source: 3, target: 8 },
	{ source: 3, target: 9 },
	{ source: 4, target: 5 },
	{ source: 4, target: 9 },
	{ source: 4, target: 10 },
	{ source: 5, target: 11 },
	{ source: 5, target: 12 },
	{ source: 7, target: 13 },
	{ source: 8, target: 14 },
	{ source: 10, target: 15 },
	{ source: 10, target: 16 },
	{ source: 9, target: 16 }
];

const groups = [
	{
		id: 1,
		leaves: [1, 2, 3, 4]
	},
	{
		id: 2,
		leaves: [5, 6, 7, 8, 9, 10]
	},
	{
		id: 3,
		leaves: [11, 12, 13, 14, 15, 16]
	}
];



const data = {
	nodes,
	links,
	groups
};

export default data;
