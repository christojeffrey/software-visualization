export const nodes = [
	{ id: '1' },
	{ id: '2' },
	{ id: '3' },
	{ id: '4' },
	{ id: '5' },
	{ id: '6' },
	{ id: '7' },
	{ id: '8' },
	{ id: '9' },
	{ id: '10' },
	{ id: '11' },
	{ id: '12' },
	{ id: '13' },
	{ id: '14' },
	{ id: '15' },
	{ id: '16' }
];
export const links = [
	{ source: '1', target: '2' },
	{ source: '1', target: '3' },
	{ source: '1', target: '4' },
	{ source: '2', target: '5' },
	{ source: '2', target: '6' },
	{ source: '3', target: '7' },
	{ source: '3', target: '8' },
	{ source: '3', target: '9' },
	{ source: '4', target: '5' },
	{ source: '4', target: '9' },
	{ source: '4', target: '10' },
	{ source: '5', target: '11' },
	{ source: '5', target: '12' },
	{ source: '7', target: '13' },
	{ source: '8', target: '14' },
	{ source: '10', target: '15' },
	{ source: '10', target: '16' },
	{ source: '9', target: '16' }
];

export const groups = [
	{
		// id: 1,
		leaves: ['1', '2', '3', '4'],
		color: '#FF8A65'
	},
	{
		// id: 2,
		leaves: ['5', '6', '7', '8', '9', '10'],
		color: '#AED581'
	},
	{
		// id: 3,
		leaves: ['11', '12', '13', '14', '15', '16'],
		color: '#FFD54F'
	}
];

export const exampleData = {
	nodes,
	links,
	groups
};
