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
	BATTERY_LEVEL_FIELD: {
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
	CHANNELS_A_FIELD: {
		type: 'dropdown',
		label: 'Channel',
		id: 'channel',
		default: '1',
		choices: this.CHOICES_CHANNELS_A
	},
	FREQUENCY_FIELD: {
		type: 'textinput',
		label: 'Frequency (MHz)',
		id: 'value',
		default: '470.000',
		regex: '/^(4[7-9][0-9]|[5-8][0-9]{2}|9[0-2][0-9]|93[0-7])\\.\\d(00|25|50|75)$/'
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
		choices: [
			{id: 'ON',     label: 'Mute'},
			{id: 'OFF',    label: 'Unmute'},
			{id: 'TOGGLE', label: 'Toggle Mute/Unmute'}
		]
	},
	NAME_FIELD: {
		type: 'textinput',
		label: 'Name (8 characters max)',
		id: 'name',
		default: '',
		regex: '/^.{1,8}$/'
	},
	RFOUTPUT_FIELD: {
		type: 'dropdown',
		label: 'On/Off',
		id: 'onoff',
		default: 'RF_ON',
		choices: [
			{id: 'RF_ON',   label: 'RF On'},
			{id: 'RF_MUTE', label: 'RF Mute'}
		]
	},
	RFPOWER_FIELD: {
		type: 'dropdown',
		label: 'Power Level',
		id: 'power',
		default: '10',
		choices: [
			{id: '2',  label: '2 mW'},
			{id: '10', label: '10 mW'},
			{id: '20', label: '20 mW'},
			{id: '35', label: '35 mW'},
			{id: '40', label: '40 mW'},
			{id: '50', label: '50 mW'}
		]
	},
	SLOTS_FIELD: {
		type: 'dropdown',
		label: 'Slot Number',
		id: 'slot',
		default: '1:1',
		choices: this.CHOICES_SLOTS
	},
	SLOTS_A_FIELD: {
		type: 'dropdown',
		label: 'Slot Number',
		id: 'slot',
		default: '1:1',
		choices: this.CHOICES_SLOTS_A
	}
}