import type {RawInputType} from '$types/raw-data';

export const simpleData: RawInputType = {
	elements: {
		nodes: [
			{
				data: {
					id: 'main',
					properties: {
						simpleName: 'main',
						kind: 'class',
						description: 'main class where the program starts',
					},
					labels: ['Structure'],
				},
			},
			{
				data: {
					id: 'a',
					properties: {
						simpleName: 'a',
						kind: 'class',
						description: 'class a',
						rs: 'Service Provider',
					},
					labels: ['Structure'],
				},
			},
			{
				data: {
					id: 'b',
					properties: {
						simpleName: 'b',
						kind: 'class',
						description: 'class b',
					},
					labels: ['Structure'],
				},
			},
			{
				data: {
					id: 'c',
					properties: {
						simpleName: 'c',
						kind: 'class',
					},
					labels: ['Structure'],
				},
			},
			{
				data: {
					id: 'd',
					properties: {
						simpleName: 'd',
						kind: 'class',
					},
					labels: ['Structure'],
				},
			},
			{
				data: {
					id: 'appl',
					properties: {
						simpleName: 'appl',
						kind: 'packages',
						rs: 'Information Holder',
					},
					labels: ['Container'],
				},
			},
			{
				data: {
					id: 'db',
					properties: {
						simpleName: 'db',
						kind: 'packages',
						description: 'the database package',
						rs: 'Information Holder',
					},
					labels: ['Container'],
				},
			},
			{
				data: {
					id: 'subMain-1',
					properties: {
						simpleName: 'subMain-1',
						kind: 'packages',
					},
					labels: ['Structure'],
				},
			},
			{
				data: {
					id: 'subMain-2',
					properties: {
						simpleName: 'subMain-2',
						kind: 'packages',
					},
					labels: ['Structure'],
				},
			},
			{
				data: {
					id: 'subMain-3',
					properties: {
						simpleName: 'subMain-3',
						kind: 'packages',
					},
					labels: ['Structure'],
				},
			},
			{
				data: {
					id: 'subMain-4',
					properties: {
						simpleName: 'subMain-4',
						kind: 'packages',
					},
					labels: ['Structure'],
				},
			},
			{
				data: {
					id: 'subMain-5',
					properties: {
						simpleName: 'subMain-5',
						kind: 'packages',
					},
					labels: ['Structure'],
				},
			},
			{
				data: {
					id: 'lib',
					properties: {
						simpleName: 'lib',
						kind: 'packages',
						rs: 'Service Provider',
					},
					labels: ['Container'],
				},
			},
		],
		edges: [
			{
				data: {
					id: 'one',
					source: 'main',
					label: 'calls',
					target: 'a',
					properties: {
						weight: 100,
					},
				},
			},
			{
				data: {
					id: 'two',
					source: 'main',
					label: 'calls',
					target: 'b',
					properties: {
						weight: 1,
					},
				},
			},
			{
				data: {
					id: 'seven',
					source: 'appl',
					label: 'contains',
					target: 'main',
					properties: {
						weight: 1,
					},
				},
			},
			{
				data: {
					id: 'eight',
					source: 'appl',
					label: 'contains',
					target: 'a',
					properties: {
						weight: 1,
					},
				},
			},
			{
				data: {
					id: 'nine',
					source: 'db',
					label: 'contains',
					target: 'b',
					properties: {
						weight: 1,
					},
				},
			},
			{
				data: {
					id: 'ten',
					source: 'lib',
					label: 'contains',
					target: 'c',
					properties: {
						weight: 1,
					},
				},
			},
			{
				data: {
					id: 'eleven',
					source: 'lib',
					label: 'contains',
					target: 'd',
					properties: {
						weight: 1,
					},
				},
			},
			{
				data: {
					id: 'twelve',
					source: 'main',
					label: 'contains',
					target: 'subMain-1',
					properties: {
						weight: 20,
					},
				},
			},
			{
				data: {
					id: 'thirteen',
					source: 'subMain-1',
					label: 'calls',
					target: 'db',
					properties: {
						weight: 200,
					},
				},
			},
			{
				data: {
					id: 'fourteen',
					source: 'subMain-1',
					label: 'accesses',
					target: 'lib',
					properties: {
						weight: 200,
					},
				},
			},
			{
				data: {
					id: 'fifteen',
					source: 'main',
					label: 'contains',
					target: 'subMain-2',
					properties: {
						weight: 20,
					},
				},
			},
			{
				data: {
					id: 'sixteen',
					source: 'main',
					label: 'contains',
					target: 'subMain-3',
					properties: {
						weight: 20,
					},
				},
			},
			{
				data: {
					id: 'seventeen',
					source: 'main',
					label: 'contains',
					target: 'subMain-4',
					properties: {
						weight: 20,
					},
				},
			},
			{
				data: {
					id: 'eighteen',
					source: 'main',
					label: 'contains',
					target: 'subMain-5',
					properties: {
						weight: 20,
					},
				},
			},
			{
				data: {
					id: 'nineteen',
					source: 'subMain-1',
					label: 'constructs',
					target: 'subMain-3',
					properties: {
						weight: 1,
					},
				},
			},
			{
				data: {
					id: 'twenty',
					source: 'subMain-2',
					label: 'holds',
					target: 'subMain-3',
					properties: {
						weight: 1,
					},
				},
			},
			{
				data: {
					id: 'twenty one',
					source: 'subMain-3',
					label: 'accepts',
					target: 'subMain-4',
					properties: {
						weight: 1,
					},
				},
			},
			{
				data: {
					id: 'twenty two',
					source: 'subMain-4',
					label: 'specializes',
					target: 'subMain-5',
					properties: {
						weight: 1,
					},
				},
			},
			{
				data: {
					id: 'twenty three',
					source: 'subMain-5',
					label: 'returns',
					target: 'subMain-1',
					properties: {
						weight: 1,
					},
				},
			},
			{
				data: {
					id: 'twenty four',
					source: 'subMain-2',
					label: 'calls',
					target: 'b',
					properties: {
						weight:50,
					},
				},
			},
		],
	},
};
