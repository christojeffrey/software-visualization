export const simpleData = {
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
			},
			{
				data: {
					id: 'appl',
					properties: {
						simpleName: 'appl',
						kind: 'packages'
					},
					labels: ['Container']
				}
			},
			{
				data: {
					id: 'db',
					properties: {
						simpleName: 'db',
						kind: 'packages'
					},
					labels: ['Container']
				}
			},
			{
				data: {
					id: 'lib',
					properties: {
						simpleName: 'lib',
						kind: 'packages'
					},
					labels: ['Container']
				}
			}
		],
		edges: [
			{
				data: {
					id: 'one',
					source: 'main',
					label: 'calls',
					target: 'a'
				}
			},
			{
				data: {
					id: 'two',
					source: 'main',
					label: 'calls',
					target: 'b'
				}
			},
			{
				data: {
					id: 'three',
					source: 'a',
					label: 'calls',
					target: 'b'
				}
			},
			{
				data: {
					id: 'four',
					source: 'a',
					label: 'calls',
					target: 'c'
				}
			},
			{
				data: {
					id: 'five',
					source: 'a',
					label: 'calls',
					target: 'd'
				}
			},
			{
				data: {
					id: 'six',
					source: 'b',
					label: 'calls',
					target: 'd'
				}
			},
			{
				data: {
					id: 'seven',
					source: 'appl',
					label: 'contains',
					target: 'main'
				}
			},
			{
				data: {
					id: 'eight',
					source: 'appl',
					label: 'contains',
					target: 'a'
				}
			},
			{
				data: {
					id: 'nine',
					source: 'db',
					label: 'contains',
					target: 'b'
				}
			},
			{
				data: {
					id: 'ten',
					source: 'lib',
					label: 'contains',
					target: 'c'
				}
			},
			{
				data: {
					id: 'eleven',
					source: 'lib',
					label: 'contains',
					target: 'd'
				}
			}
		]
	}
};
