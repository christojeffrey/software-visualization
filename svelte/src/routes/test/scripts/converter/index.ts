export function converter(rawData: any) {
	console.log('converter');
	// hardcode for now

	return {
		nodes: [
			{ id: 'node1', level: 1 },
			{ id: 'node2', level: 1 },
			{
				id: 'node3',
				level: 1,
				members: [
					{
						id: 'member1',
						level: 2,
						members: [
							{
								id: 'anak1',
								level: 3
							},
							{
								id: 'anak2',
								level: 3
							}
						]
					},
					{
						id: 'member2',
						level: 2
					},
					{
						id: 'member3',
						level: 2
					}
				]
			}
		],
		links: [
			{ source: 'node1', target: 'node2', type: 'calls' },
			{ source: 'node2', target: 'node3', type: 'calls' },
			{ source: 'member2', target: 'member1' },
			{ source: 'member2', target: 'node1' }
		]
	};
}
