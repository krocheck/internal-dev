module.exports = {

	/**
	 * INTERNAL: initialize variables.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initVariables() {
		var variables = [];

		for (let i = 1; i <= this.inputCount; i++) {
			variables.push({
				label: `Label of input ${i}`,
				name: `input_${i}`
			});

			this.setVariable(`input_${i}`, this.getInput(i).name);
		}

		for (let i = 1; i <= this.outputCount; i++) {
			variables.push({
				label: `Label of output ${i}`,
				name: `output_${i}`
			});

			this.setVariable(`output_${i}`, this.getOutput(i).name);

			variables.push({
				label: `Label of input routed to output ${i}`,
				name: `output_${i}_input`
			});

			this.setVariable(`output_${i}_input`,  this.getInput(this.getOutput(i).route).name);
		}

		if (this.presetCount > 0) {
			for (let i = 1; i <= this.presetCount; i++) {
				variables.push({
					label: `Label of global preset ${i}`,
					name: `preset_${i}`
				});

				this.setVariable(`preset_${i}`, this.getPreset(i).name);
			}
		}

		if (this.roomCount > 0) {
			for (let i = 1; i <= this.roomCount; i++) {
				variables.push({
					label: `Label of room ${i}`,
					name: `room_${i}`
				});

				this.setVariable(`room_${i}`, this.getRoom(i).name);
			}
		}

		variables.push({
			label: 'Label of selected destination',
			name: 'selected_output'
		});

		this.setVariable('selected_output', this.getOutput(this.selected).name);

		variables.push({
			label: 'Label of input routed to selection',
			name: 'selected_input'
		});

		this.setVariable('selected_input', this.getInput(this.getOutput(this.selected).route).name);

		this.setVariableDefinitions(variables);
	}
}