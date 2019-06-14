module.exports = {

	/**
	 * INTERNAL: initialize variables.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initVariables() {
		var variables = [];

		for (var i = 0; i < this.inputCount; i++) {

			if (this.getInput(i).status != 'None') {
				variables.push({
					label: 'Label of input ' + (i+1),
					name: 'input_' + (i+1)
				});

				this.setVariable('input_' + (i+1), this.getInput(i).name);
			}
		}

		for (var i = 0; i < this.outputCount; i++) {

			if (this.getOutput(i).status != 'None') {

				variables.push({
					label: 'Label of view ' + (i+1),
					name: 'output_' + (i+1)
				});

				this.setVariable('output_' + (i+1), this.getOutput(i).name);

				variables.push({
					label: 'Label of input routed to view ' + (i+1),
					name: 'output_' + (i+1) + '_input'
				});

				this.setVariable('output_' + (i+1) + '_input',  this.getInput(this.getOutput(i).route).name);
			}
		}

		variables.push({
			label: 'Label of SOLO',
			name: 'solo'
		});

		this.setVariable('solo', this.getOutput(this.outputCount).name);

		variables.push({
			label: 'Label of input routed to SOLO',
			name: 'solo_input'
		});

		this.setVariable('solo_input',  this.getInput(this.getOutput(this.outputCount).route).name);

		variables.push({
			label: 'Label of AUDIO',
			name: 'audio'
		});

		this.setVariable('audio', this.getOutput(this.outputCount+1).name);

		variables.push({
			label: 'Label of input routed to AUDIO',
			name: 'solo_audio'
		});

		this.setVariable('solo_audio',  this.getInput(this.getOutput(this.outputCount+1).route).name);

		variables.push({
			label: 'Label of selected view',
			name: 'selected_destination'
		});

		this.setVariable('selected_destination', this.getOutput(this.selected).name);

		variables.push({
			label: 'Label of input routed to selection',
			name: 'selected_source'
		});

		this.setVariable('selected_source', this.getInput(this.getOutput(this.selected).route).name);

		this.setVariableDefinitions(variables);
	}
}