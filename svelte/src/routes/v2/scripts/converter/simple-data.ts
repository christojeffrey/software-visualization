import type { RawInputType } from '../../types/raw-data';

export const simpleData: RawInputType = {
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
					target: 'a',
					properties: {
						weight: 100
					}
				}
			},
			{
				data: {
					id: 'two',
					source: 'main',
					label: 'calls',
					target: 'b',
					properties: {
						weight: 50
					}
				}
			},
			{
				data: {
					id: 'three',
					source: 'a',
					label: 'calls',
					target: 'b',
					properties: {
						weight: 50
					}
				}
			},
			{
				data: {
					id: 'four',
					source: 'a',
					label: 'calls',
					target: 'c',
					properties: {
						weight: 1
					}
				}
			},
			{
				data: {
					id: 'five',
					source: 'a',
					label: 'calls',
					target: 'd',
					properties: {
						weight: 1
					}
				}
			},
			{
				data: {
					id: 'six',
					source: 'b',
					label: 'calls',
					target: 'd',
					properties: {
						weight: 1
					}
				}
			},
			{
				data: {
					id: 'seven',
					source: 'appl',
					label: 'contains',
					target: 'main',
					properties: {
						weight: 1
					}
				}
			},
			{
				data: {
					id: 'eight',
					source: 'appl',
					label: 'contains',
					target: 'a',
					properties: {
						weight: 1
					}
				}
			},
			{
				data: {
					id: 'nine',
					source: 'db',
					label: 'contains',
					target: 'b',
					properties: {
						weight: 1
					}
				}
			},
			{
				data: {
					id: 'ten',
					source: 'lib',
					label: 'contains',
					target: 'c',
					properties: {
						weight: 1
					}
				}
			},
			{
				data: {
					id: 'eleven',
					source: 'lib',
					label: 'contains',
					target: 'd',
					properties: {
						weight: 1
					}
				}
			}
		]
	}
};
