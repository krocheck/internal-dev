module.exports = {

	/**
	 * INTERNAL: returns the desired input object.
	 *
	 * @param {number} id - the input to fetch
	 * @returns {Object} the desired input object
	 * @access protected
	 * @since 1.0.0
	 */
	getInput(id) {

		if (this.inputs[id] === undefined) {
			this.inputs[id] = {
				label: `${id}: Input ${id}`,
				name:  `Input ${id}`
			};
		}

		return this.inputs[id];
	},

	/**
	 * INTERNAL: returns the desired output object.
	 *
	 * @param {number} id - the output to fetch
	 * @returns {Object} the desired output object
	 * @access protected
	 * @since 1.0.0
	 */
	getOutput(id) {

		if (this.outputs[id] === undefined) {
			this.outputs[id] = {
				label:      `${id}: Output ${id}`,
				name:       `Output ${id}`,
				route:      id,
				audioRoute: id,
				videoMute:  0,
				audioMute:  0,
			};
		}

		return this.outputs[id];
	},

	/**
	 * INTERNAL: returns the desired global preset object.
	 *
	 * @param {number} id - the preset to fetch
	 * @returns {Object} the desired preset object
	 * @access protected
	 * @since 1.0.0
	 */
	getPreset(id) {

		if (this.presets[id] === undefined) {
			this.presets[id] = {
				label: `${id}: Preset ${id}`,
				name:  `Preset ${id}`
			};
		}

		return this.presets[id];
	},

	/**
	 * INTERNAL: returns the desired room object.
	 *
	 * @param {number} id - the room to fetch
	 * @returns {Object} the desired room object
	 * @access protected
	 * @since 1.0.0
	 */
	getRoom(id) {

		if (this.rooms[id] === undefined) {
			this.rooms[id] = {
				label: `${id}: Room ${id}`,
				name:  `Room ${id}`
			};
		}

		return this.rooms[id];
	},

	/**
	 * INTERNAL: Updates device data from the Videohub
	 *
	 * @param {string} labeltype - the command/data type being passed
	 * @param {Object} object - the collected data
	 * @access protected
	 * @since 1.0.0
	 */
	updateDevice(labeltype, object) {

		for (var key in object) {
			var parsethis = object[key];
			var a = parsethis.split(/: /);
			var attribute = a.shift();
			var value = a.join(" ");

			switch (attribute) {
				case 'Model name':
					this.deviceName = value;
					this.log('info', 'Connected to a ' + this.deviceName);
					break;
				case 'Video inputs':
					this.config.inputCount = value;
					break;
				case 'Video outputs':
					this.config.outputCount = value;
					break;
				case 'Video monitoring outputs':
					this.config.monitoringCount = value;
					break;
				case 'Serial ports':
					this.config.serialCount = value;
					break;
			}
		}

		this.saveConfig();
	},

	/**
	 * INTERNAL: Updates a label based on data passed
	 *
	 * @param {string} labeltype - the command/data type being passed
	 * @param {Object} object - the collected data
	 * @access protected
	 * @since 1.0.0
	 */
	updateLabel(labeltype, object) {
		var a = object.split(/,/);
		var num =parseInt(a.shift().find(labeltype, ''));
		var label = a.join(",");

		switch (labeltype) {
			case 'Nmi':
				this.getInput(num).name  = label;
				this.getInput(num).label = `${num.toString()}: ${label}`;
				this.setVariable(`input_${num}`, label);
				break;
			case 'Nmo':
				this.getOutput(num).name  = label;
				this.getOutput(num).label = `${num.toString()}: ${label}`;
				this.setVariable(`output_${num}`, label);
				break;
			case 'Nmg':
				this.getPreset(num).name  = label;
				this.getPreset(num).label = `${num.toString()}: ${label}`;
				this.setVariable(`preset_${num}`, label);
				break;
			case 'Nmr':
				this.getRoom(num).name  = label;
				this.getRoom(num).label = `${num.toString()}: ${label}`;
				this.setVariable(`room_${num}`, label);
				break;
		}

		if (labeltype == 'Nmi') {

			for (let i = 1; i <= this.outputCount; i++) {
				if (this.getOutput(i).route == num) {
					this.setVariable(`output_{$i}_input`,  this.getInput(this.getOutput(i).route).name);
				}
			}

			if (this.selected == num) {
				this.setVariable('selected_input', this.getInput(this.getOutput(this.selected).route).name);
			}
		}
	},

	/**
	 * INTERNAL: Updates a route based on data passed
	 *
	 * @param {string} labeltype - the command/data type being passed
	 * @param {Object} object - the collected data
	 * @access protected
	 * @since 1.0.0
	 */
	updateRoute(labeltype, object) {
		var a = object.split(/ /);
		var dest = parseInt(a.shift().replace('Out', ''));
		var src = parseInt(a.shift().replace('In', ''));

		switch (a.shift()) {
			case 'All':
				this.getOutput(dest).route = src;
				this.getOutput(dest).audioRoute = src;
				this.setVariable(`output_${dest}_input`,  this.getInput(src).name);
				break;
			case 'RGB':
			case 'Vid':
				this.getOutput(dest).route = src;
				this.setVariable(`output_${dest}_input`,  this.getInput(src).name);
				break;
			case 'Aud':
				this.getOutput(dest).audioRoute = src;
				break;
		}
	}
}