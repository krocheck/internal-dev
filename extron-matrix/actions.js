module.exports = {

	/**
	 * INTERNAL: Get the available actions.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	getActions() {
		var actions = {};

		actions['rename_output'] = {
			label: 'Rename output',
			options: [
				this.OUTPUT_FIELD,
				this.NAME_FIELD
			]
		};

		actions['rename_input'] ={
			label: 'Rename input',
			options: [
				this.INPUT_FIELD,
				this.NAME_FIELD
			]
		};

		if (this.presetCount > 0) {
			actions['rename_preset'] ={
				label: 'Rename preset',
				options: [
					this.PRESET_FIELD,
					this.NAME_FIELD
				]
			};
		}

		if (this.roomCount > 0) {
			actions['rename_room'] ={
				label: 'Rename room',
				options: [
					this.ROOM_FIELD,
					this.NAME_FIELD
				]
			};
		}

		actions['route'] = {
			label: 'Route',
			options: [
				this.LAYER_FIELD,
				this.INPUT_FIELD,
				this.OUTPUT_FIELD
			]
		};

		actions['route_to_all'] = {
			label: 'Route input to all outputs',
			options: [
				this.LAYER_FIELD,
				this.INPUT_FIELD
			]
		};

		if (this.presetCount > 0) {
			actions['recall_global'] ={
				label: 'Recall global preset',
				options: [
					this.PRESET_FIELD
				]
			};
			actions['save_global'] ={
				label: 'Save global preset',
				options: [
					this.PRESET_FIELD
				]
			};
		}

		actions['select_output'] = {
			label: 'Select output',
			options: [
				this.LAYER_FIELD,
				this.OUTPUT_FIELD
			]
		};
		actions['route_input'] = {
			label: 'Route intput to selected output',
			options: [
				this.INPUT_FIELD
			]
		};

		actions['take']  = { label: 'Take' };
		actions['clear'] = { label: 'Clear' };

		return actions;
	}
}