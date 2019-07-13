module.exports = {

	/**
	 * INTERNAL: initialize variables.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initVariables() {
		var variables = [];
/*
		variables.push({
			label: 'Label of selected destination',
			name: 'selected_destination'
		});

		this.setVariable('selected_destination', this.getOutput(this.selected).name);

		variables.push({
			label: 'Label of input routed to selection',
			name: 'selected_source'
		});

		this.setVariable('selected_source', this.getInput(this.getOutput(this.selected).route).name);
*/
		this.setVariableDefinitions(variables);
	}
}