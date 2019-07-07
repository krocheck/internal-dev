module.exports = {

	/**
	 * INTERNAL: initialize presets.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initPresets () {
		var presets = [
		{
			category: 'Multiview',
			label: 'VIDEO \\n1',
			bank: {
				style: 'text',
				text: 'Video \\n1',
				size: '18',
				color: this.rgb(255,255,255),
				bgcolor: this.rgb(0,0,0),

			},
			actions: [
				{
					action: 'solo',
					options: {
						inp: 0,
					}
				}
			]
		},
		{
			category: 'Multiview',
			label: 'VIDEO \\n2',
			bank: {
				style: 'text',
				text: 'Video \\n2',
				size: '18',
				color: this.rgb(255,255,255),
				bgcolor: this.rgb(0,0,0),
			},
			actions: [
				{
					action: 'solo',
					options: {
						inp: 1,
					}
				}
			]
		},
		{
			category: 'Multiview',
			label: 'VIDEO \\n3',
			bank: {
				style: 'text',
				text: 'Video \\n3',
				size: '18',
				color: this.rgb(255,255,255),
				bgcolor: this.rgb(0,0,0),
			},
			actions: [
				{
					action: 'solo',
					options: {
						inp: 2,
					}
				}
			]
		},
		{
			category: 'Multiview',
			label: 'VIDEO \\n4',
			bank: {
				style: 'text',
				text: 'Video \\n4',
				size: '18',
				color: this.rgb(255,255,255),
				bgcolor: this.rgb(0,0,0),
			},
			actions: [
				{
					action: 'solo',
					options: {
						inp: 3,
					}
				}
			]
		},
		{
			category: 'Multiview',
			label: 'Audio \\n1',
			bank: {
				style: 'text',
				text: 'Audio \\n1',
				size: '18',
				color: this.rgb(255,255,255),
				bgcolor: this.rgb(0,0,0),
			},
			actions: [
				{
					action: 'audio',
					options: {
						inp: 0,
					}
				}
			]
		},
		{
			category: 'Multiview',
			label: 'Audio \\n2',
			bank: {
				style: 'text',
				text: 'Audio \\n2',
				size: '18',
				color: this.rgb(255,255,255),
				bgcolor: this.rgb(0,0,0),
			},
			actions: [
				{
					action: 'audio',
					options: {
						inp: 1,
					}
				}
			]
		},
		{
			category: 'Multiview',
			label: 'Audio \\n3',
			bank: {
				style: 'text',
				text: 'Audio \\n3',
				size: '18',
				color: this.rgb(255,255,255),
				bgcolor: this.rgb(0,0,0),
			},
			actions: [
				{
					action: 'audio',
					options: {
						inp: 2,
					}
				}
			]
		},
		{
			category: 'Multiview',
			label: 'Audio \\n4',
			bank: {
				style: 'text',
				text: 'Audio \\n4',
				size: '18',
				color: this.rgb(255,255,255),
				bgcolor: this.rgb(0,0,0),
			},
			actions: [
				{
					action: 'audio',
					options: {
						inp: 3,
					}
				}
			]
		}
		];

		for (var type in this.PRESETS_SETTIGS) {
			for (var choice in this.PRESETS_SETTIGS[type].choices) {

				presets.push({
					category: 'Settings',
					label: this.PRESETS_SETTIGS[type].label + this.PRESETS_SETTIGS[type].choices[choice].preset,
					bank: {
						style: 'text',
						text: this.PRESETS_SETTIGS[type].label + this.PRESETS_SETTIGS[type].choices[choice].preset,
						size: '14',
						color: this.rgb(255,255,255),
						bgcolor: this.rgb(0,0,0)
					},
					feedbacks: [
						{
							type: this.PRESETS_SETTIGS[type].feedback,
							options: {
								bg: this.rgb(255,255,0),
								fg: this.rgb(0,0,0),
								setting: this.PRESETS_SETTIGS[type].choices[choice].id
							}
						}
					],
					actions: [
						{
							action: this.PRESETS_SETTIGS[type].action,
							options: {
								setting: this.PRESETS_SETTIGS[type].choices[choice].id
							}
						}
					]
				});
			}
		}

		this.setPresetDefinitions(presets);
	}
}