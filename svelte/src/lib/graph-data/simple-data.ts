export const rawData = {
	elements: {
		nodes: [
			{
				data: {
					id: 'main',
					properties: {
						simpleName: 'main',
						kind: 'class'
					},
					labels: ['Structure']
				}
			},
			{
				data: {
					id: 'a',
					properties: {
						simpleName: 'a',
						kind: 'class'
					},
					labels: ['Structure']
				}
			},
			{
				data: {
					id: 'b',
					properties: {
						simpleName: 'b',
						kind: 'class'
					},
					labels: ['Structure']
				}
			},
			{
				data: {
					id: 'c',
					properties: {
						simpleName: 'c',
						kind: 'class'
					},
					labels: ['Structure']
				}
			},
			{
				data: {
					id: 'd',
					properties: {
						simpleName: 'd',
						kind: 'class'
					},
					labels: ['Structure']
				}
			}
		],
		edges: [
			{
				data: {
					id: 'one',
					source: 'main',
					label: 'call',
					target: 'a'
				}
			},
			{
				data: {
					id: 'two',
					source: 'main',
					label: 'call',
					target: 'b'
				}
			},
			{
				data: {
					id: 'three',
					source: 'a',
					label: 'call',
					target: 'b'
				}
			},
			{
				data: {
					id: 'four',
					source: 'a',
					label: 'call',
					target: 'c'
				}
			},
			{
				data: {
					id: 'five',
					source: 'a',
					label: 'call',
					target: 'd'
				}
			},
			{
				data: {
					id: 'six',
					source: 'b',
					label: 'call',
					target: 'd'
				}
			}
		]
	}
};
