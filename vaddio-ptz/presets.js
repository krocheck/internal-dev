module.exports = {

	/**
	 * INTERNAL: initialize presets.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initPresets () {
		var presets = [];

		for (var pt in this.PRESETS_PT) {

			presets.push({
				category: 'Pan/Tilt',
				label: this.PRESETS_PT[pt].label,
				bank: {
					style: 'png',
					text: '',
					png64: this.ICONS[pt],
					pngalignment: 'center:center',
					size: '18',
					color: this.rgb(255,255,255),
					bgcolor: this.rgb(0,0,0)
				},
				actions: [
					{
						action: pt,
					}
				],
				release_actions: [
					{
						action: 'stop',
					}
				]
			});
		}

		presets.push({
			category: 'Pan/Tilt',
			label: 'HOME',
			bank: {
				style: 'png',
				text: 'HOME',
				size: '18',
				color: this.rgb(255,255,255),
				bgcolor: this.rgb(0,0,0)
			},
			actions: [
				{
					action: 'home',
				}
			]
		});
/*
		presets.push({
			category: 'Actions\n(XY only)',
			label: 'Take',
			bank: {
				style: 'text',
				text: 'Take',
				size: '18',
				color: this.rgb(255,255,255),
				bgcolor: this.rgb(0,0,0)
			},
			feedbacks: [
				{
					type: 'take',
					options: {
						bg: this.rgb(255,0,0),
						fg: this.rgb(255,255,255)
					}
				}
			],
			actions: [
				{
					action: 'take'
				}
			]
		});

		presets.push({
			category: 'Actions\n(XY only)',
			label: 'Clear',
			bank: {
				style: 'text',
				text: 'Clear',
				size: '18',
				color: this.rgb(128,128,128),
				bgcolor: this.rgb(0,0,0)
			},
			feedbacks: [
				{
					type: 'take',
					options: {
						bg: this.rgb(0,0,0),
						fg: this.rgb(255,255,255)
					}
				}
			],
			actions: [
				{
					action: 'clear'
				}
			]
		});

		for (var out = 0; out < (this.outputCount + this.monitoringCount); out++) {
			for (var i = 0; i < this.inputCount; i++) {

				presets.push({
					category: 'Output ' + (out+1),
					label: 'Output ' + (out+1) + ' button for ' + this.getInput(i).name,
					bank: {
						style: 'text',
						text: '$(videohub:input_' + (i+1) + ')',
						size: '18',
						color: this.rgb(255,255,255),
						bgcolor: this.rgb(0,0,0)
					},
					feedbacks: [
						{
							type: 'input_bg',
							options: {
								bg: this.rgb(255,255,0),
								fg: this.rgb(0,0,0),
								input: i,
								output: out
							}
						}
					],
					actions: [
						{
							action: 'route',
							options: {
								source: i,
								destination: out
							}
						}
					]
				});
			}
		}

		if (this.serialCount > 0) {
			for (var out = 0; out < this.serialCount; out++) {
				for (var i = 0; i < this.serialCount; i++) {
					if (i == out) {
						continue;
					}

					presets.push({
						category: 'Serial ' + (out+1),
						label: 'Route serial ' + (i+1) + ' to serial ' + (out+1),
						bank: {
							style: 'text',
							text: '$(videohub:serial_' + (i+1) + ')',
							size: '18',
							color: this.rgb(255,255,255),
							bgcolor: this.rgb(0,0,0)
						},
						feedbacks: [
							{
								type: 'serial_bg',
								options: {
									bg: this.rgb(255,255,0),
									fg: this.rgb(0,0,0),
									input: i,
									output: out
								}
							}
						],
						actions: [
							{
								action: 'route_serial',
								options: {
									source: i,
									destination: out
								}
							}
						]
					});
				}
			}
		}
*/
		this.setPresetDefinitions(presets);
	}
}