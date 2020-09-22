module.exports = {

	BG_COLOR_FIELD: function(defaultColor) {
		return {
			type: 'colorpicker',
			label: 'Background color',
			id: 'bg',
			default: defaultColor
		};
	},
	FG_COLOR_FIELD: function(defaultColor) {
		return {
			type: 'colorpicker',
			label: 'Foreground color',
			id: 'fg',
			default: defaultColor
		};
	},
	BATTERY_LEVLE_FIELD: {
		type: 'number',
		label: 'Battery Bar Level',
		id: 'barlevel',
		min: 1,
		max: 5,
		default: 2,
		required: true,
		range: true
	},
	CHANNELS_FIELD: {
		type: 'dropdown',
		label: 'Channel',
		id: 'channel',
		default: '1',
		choices: this.CHOICES_CHANNELS
	},
	GAIN_INC_FIELD: function(family) {
		return {
			type: 'number',
			label: 'Gain Value (dB)',
			id: 'gain',
			min: 1,
			max: (family == 'mxw' ? 40 : 60),
			default: 3,
			required: true,
			range: true
		};
	},
	GAIN_SET_FIELD: function(family) {
		return {
			type: 'number',
			label: 'Gain Value (dB)',
			id: 'gain',
			min: (family == 'mxw' ? -25 : -18),
			max: (family == 'mxw' ? 15 : 42),
			default: 0,
			required: true,
			range: true
		};
	},
	MUTE_FIELD: {
		type: 'dropdown',
		label: 'Mute/Unmute/Toggle',
		id: 'choice',
		default: 'ON',
		choices: this.CHOICES_MUTE
	},
	NAME_FIELD: {
		type: 'textinput',
		label: 'Name (8 characters max)',
		id: 'name',
		default: '',
		regex: this.REGEX_CHAR_8
	},
	RFOUTPUT_FIELD: {
		type: 'dropdown',
		label: 'On/Off',
		id: 'onoff',
		default: 'RF_ON',
		choices: this.CHOICES_RFOUTPUT
	},
	SLOTS_FIELD: {
		type: 'dropdown',
		label: 'Slot Number',
		id: 'slot',
		default: '1:01',
		choices: this.CHOICES_SLOTS
	}
}