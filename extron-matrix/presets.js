module.exports = {

	/**
	 * INTERNAL: initialize presets.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initPresets () {
		var presets = [];

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

		for (let i = 1; i <= this.outputCount; i++) {

			presets.push({
				category: 'Select Destination (X)',
				label: `Selection destination button for ${this.getOutput(i).name}`,
				bank: {
					style: 'text',
					text: `$(videohub:output_${i})`,
					size: '18',
					color: this.rgb(255,255,255),
					bgcolor: this.rgb(0,0,0)
				},
				feedbacks: [
					{
						type: 'selected_output',
						options: {
							bg: this.rgb(255,255,0),
							fg: this.rgb(0,0,0),
							output: i
						}
					},
					{
						type: 'take_tally_output',
						options: {
							bg: this.rgb(255,0,0),
							fg: this.rgb(255,255,255),
							output: i
						}
					}
				],
				actions: [
					{
						action: 'select_output',
						options: {
							output: i
						}
					}
				]
			});
		}

		for (let i = 1; i <= this.inputCount; i++) {

			presets.push({
				category: 'Route Source (Y)',
				label: `Route ${this.getInput(i).name} to selected destination`,
				bank: {
					style: 'text',
					text: `$(videohub:input_${i})`,
					size: '18',
					color: this.rgb(255,255,255),
					bgcolor: this.rgb(0,0,0)
				},
				feedbacks: [
					{
						type: 'selected_input',
						options: {
							bg: this.rgb(255,255,255),
							fg: this.rgb(0,0,0),
							input: i
						}
					},
					{
						type: 'take_tally_input',
						options: {
							bg: this.rgb(255,0,0),
							fg: this.rgb(255,255,255),
							input: i
						}
					}
				],
				actions: [
					{
						action: 'route_input',
						options: {
							input: i
						}
					}
				]
			});
		}

		for (let out = 1; out <= this.outputCount; out++) {
			for (let i = 1; i <= this.inputCount; i++) {

				presets.push({
					category: `Output ${out}`,
					label: `Output ${out} button for ${this.getInput(i).name}`,
					bank: {
						style: 'text',
						text: `$(videohub:input_${i})`,
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
								input: i,
								output: out
							}
						}
					]
				});
			}
		}

		this.setPresetDefinitions(presets);
	}
}