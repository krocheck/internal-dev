module.exports = {

	/**
	 * Get the available actions.
	 *
	 * @returns {Object[]} the available actions
	 * @access public
	 * @since 1.0.0
	 */
	getActions() {
		var actions = super.getActions();

		// Handle some renames needed from videohub

		actions['rename_destination'].label = 'Rename view';
		actions['rename_destination'].options[0].label = 'View';
		actions['rename_destination'].options[1].default = 'View name';

		actions['route'].options[1].label = 'View';

		actions['select_destination'].label = 'Select view';
		actions['select_destination'].options[0].label = 'View';

		actions['route_source'].label = 'Route source to selected view';

		//----

		actions['route_solo'] = {
			label: 'Select SOLO source',
			options: [
				{
					type: 'dropdown',
					label: 'Source',
					id: 'source',
					default: '0',
					choices: this.CHOICES_INPUTS
				}
			]
		};
		actions['route_audio'] = {
			label: 'Select AUDIO source',
			options: [
				{
					type: 'dropdown',
					label: 'Source',
					id: 'source',
					default: '0',
					choices: this.CHOICES_INPUTS
				}
			]
		};
		actions['set_solo'] = {
			label: 'Display SOLO',
			options: [
				{
					type: 'dropdown',
					label: 'Value',
					id: 'setting',
					default: 'true',
					choices: this.CHOICES_TRUEFALSE
				}
			]
		};
		actions['set_layout'] = {
			label: 'Set layout',
			options: [
				{
					type: 'dropdown',
					label: 'Layout',
					id: 'setting',
					default: '2x2',
					choices: this.CHOICES_LAYOUT
				}
			]
		};
		actions['set_format'] = {
			label: 'Set output format',
			options: [
				{
					type: 'dropdown',
					label: 'Format',
					id: 'setting',
					default: '60p',
					choices: this.CHOICES_OUTPUTFORMAT
				}
			]
		};
		actions['set_border'] = {
			label: 'Display border',
			options: [
				{
					type: 'dropdown',
					label: 'Value',
					id: 'setting',
					default: 'true',
					choices: this.CHOICES_TRUEFALSE
				}
			]
		};
		actions['set_labels'] = {
			label: 'Display labels',
			options: [
				{
					type: 'dropdown',
					label: 'Value',
					id: 'setting',
					default: 'true',
					choices: this.CHOICES_TRUEFALSE
				}
			]
		};
		actions['set_meters'] = {
			label: 'Display audio meters',
			options: [
				{
					type: 'dropdown',
					label: 'Value',
					id: 'setting',
					default: 'true',
					choices: this.CHOICES_TRUEFALSE
				}
			]
		};
		actions['set_tally'] = {
			label: 'Display SDI tally',
			options: [
				{
					type: 'dropdown',
					label: 'Value',
					id: 'setting',
					default: 'true',
					choices: this.CHOICES_TRUEFALSE
				}
			]
		};
		actions['set_widescreen_sd'] = {
			label: 'Widescreen SD enable',
			options: [
				{
					type: 'dropdown',
					label: 'Value',
					id: 'setting',
					default: 'true',
					choices: this.CHOICES_TRUEFALSE
				}
			]
		};

		return actions;
	}
}