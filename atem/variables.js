module.exports = {

	/**
	 * INTERNAL: initialize variables.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initVariables() {
		// variable_set
		var variables = [];

		// PGM/PV busses
		for (var i = 0; i < this.model.MEs; ++i) {

			variables.push({
				label: 'Label of input active on program bus (M/E ' + (i+1) + ')',
				name: 'pgm' + (i+1) + '_input'
			});

			var id = this.api.getME(i).pgmSrc;
			this.setVariable('pgm' + (i+1) + '_input', (this.config.presets == 1 ? this.api.getSource(id).longName : this.api.getSource(id).shortName));

			variables.push({
				label: 'Label of input active on preview bus (M/E ' + (i+1) + ')',
				name: 'pvw' + (i+1) + '_input'
			});

			var id = this.api.getME(i).pvwSrc;
			this.setVariable('pvw' + (i+1) + '_input', (this.config.presets == 1 ? this.api.getSource(id).longName : this.api.getSource(id).shortName));

			for (var k = 0; k < this.model.USKs; ++k) {

				variables.push({
					label: 'Label of input active on M/E ' + (i+1) + ' Key ' + (k+1),
					name: 'usk_' + (i+1) + '_' + (k+1) + '_input'
				});

				var id = this.api.getUSK(i, k).fillSource;
				this.setVariable('usk_' + (i+1) + '_' + (k+1) + '_input', (this.config.presets == 1 ? this.api.getSource(id).longName : this.api.getSource(id).shortName));

			}
		}

		// DSKs
		for (var k = 0; k < this.model.DSKs; ++k) {

			variables.push({
				label: 'Label of input active on DSK ' + (k+1),
				name: 'dsk_' + (k+1) + '_input'
			});

			var id = this.api.getDSK(k).fillSource;
			this.setVariable('dsk_' + (k+1) + '_input', (this.config.presets == 1 ? this.api.getSource(id).longName : this.api.getSource(id).shortName));

		}

		// Input names
		for (var key in this.sources) {
			variables.push({
				label: 'Long name of input id ' + key,
				name: 'long_' + key
			});
			variables.push({
				label: 'Short name of input id ' + key,
				name: 'short_' + key
			});

			this.setVariable('long_' + key,  this.api.getSource(key).longName);
			this.setVariable('short_' + key, this.api.getSource(key).shortName);
		}

		// Macros
		for (var i = 0; i < this.model.macros; i++) {
			variables.push({
				label: 'Name of macro id ' + (i+1),
				name: 'macro_' + (i+1)
			});

			this.setVariable('macro_' + (i+1), (this.api.getMacro(i).description != '' ? this.api.getMacro(i).description : this.api.getMacro(i).label));
		}

		this.setVariableDefinitions(variables);
	}
}