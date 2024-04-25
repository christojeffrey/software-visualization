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
						rs: 'Service Provider'
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
						rs: 'Information Holder'
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
						rs: 'Information Holder'
					},
					labels: ['Container'],
				},
			},
			{
				data: {
					id: 'subMain',
					properties: {
						simpleName: 'subMain',
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
						rs: 'Service Provider'
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
						weight: 50,
					},
				},
			},
			{
				data: {
					id: 'three',
					source: 'a',
					label: 'calls',
					target: 'b',
					properties: {
						weight: 50,
					},
				},
			},
			{
				data: {
					id: 'four',
					source: 'a',
					label: 'calls',
					target: 'c',
					properties: {
						weight: 1,
					},
				},
			},
			{
				data: {
					id: 'five',
					source: 'a',
					label: 'calls',
					target: 'd',
					properties: {
						weight: 1,
					},
				},
			},
			{
				data: {
					id: 'six',
					source: 'b',
					label: 'calls',
					target: 'd',
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
					target: 'subMain',
					properties: {
						weight: 20,
					},
				},
			},
			{
				data: {
					id: 'thirteen',
					source: 'subMain',
					label: 'calls',
					target: 'db',
					properties: {
						weight: 200,
					},
				},
			},
		],
	},
};
