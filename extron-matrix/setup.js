module.exports = {

	CONFIG_MODEL: {
		'generic':    { id: 'generic', label: 'Auto Detect', description: 'Auto Detect', inputs: 16, outputs: 16, video: true, audio: true, nameLen: 12, rooms: 0, roomLen: 0, roomPresets: 0, globalPresets: 32, edid: false, laser: false, hdcp: false, cec: false, xtp: false },

		'60-1091-01': { id: '60-1091-01', label: 'DMS 1600 Frame', description: '4U, 4-Slot DVI Matrix Frame', inputs: 16, outputs: 16, video: true, audio: false, nameLen: 12, rooms: 10, roomLen: 11, roomPresets: 10, globalPresets: 32, edid: true, laser: false, hdcp: false, cec: false, xtp: false },
		'60-1349-01': { id: '60-1349-01', label: 'DMS 2000 Frame', description: '3U, 5-Slot DVI Matrix Frame', inputs: 20, outputs: 20, video: true, audio: false, nameLen: 12, rooms: 10, roomLen: 11, roomPresets: 10, globalPresets: 32, edid: true, laser: false, hdcp: false, cec: false, xtp: false },
		'60-1350-01': { id: '60-1350-01', label: 'DMS 3200 Frame', description: '5U, 8-Slot DVI Matrix Frame', inputs: 32, outputs: 32, video: true, audio: false, nameLen: 12, rooms: 10, roomLen: 11, roomPresets: 10, globalPresets: 32, edid: true, laser: false, hdcp: false, cec: false, xtp: false },
		'60-1092-01': { id: '60-1092-01', label: 'DMS 3600 Frame', description: '8U, 9-Slot DVI Matrix Frame', inputs: 36, outputs: 36, video: true, audio: false, nameLen: 12, rooms: 10, roomLen: 11, roomPresets: 10, globalPresets: 32, edid: true, laser: false, hdcp: false, cec: false, xtp: false },

		'60-1678-01': { id: '60-1678-01', label: 'DXP 42 HD 4K PLUS',   description: '4x2 4K/60 HDMI with 2 Audio Outputs',   inputs: 4,  outputs: 4,  video: true, audio: true, nameLen: 16, rooms: 10, roomLen: 12, roomPresets: 10, globalPresets: 16, edid: true, laser: false, hdcp: true, cec: true, xtp: false },
		'60-1493-21': { id: '60-1493-21', label: 'DXP 44 HD 4K PLUS',   description: '4x4 4K/60 HDMI with 2 Audio Outputs',   inputs: 4,  outputs: 4,  video: true, audio: true, nameLen: 16, rooms: 10, roomLen: 12, roomPresets: 10, globalPresets: 16, edid: true, laser: false, hdcp: true, cec: true, xtp: false },
		'60-1494-21': { id: '60-1494-21', label: 'DXP 84 HD 4K PLUS',   description: '8x4 4K/60 HDMI with 2 Audio Outputs',   inputs: 8,  outputs: 4,  video: true, audio: true, nameLen: 16, rooms: 10, roomLen: 12, roomPresets: 10, globalPresets: 16, edid: true, laser: false, hdcp: true, cec: true, xtp: false },
		'60-1495-21': { id: '60-1495-21', label: 'DXP 88 HD 4K PLUS',   description: '8x8 4K/60 HDMI with 2 Audio Outputs',   inputs: 8,  outputs: 8,  video: true, audio: true, nameLen: 16, rooms: 10, roomLen: 12, roomPresets: 10, globalPresets: 16, edid: true, laser: false, hdcp: true, cec: true, xtp: false },
		'60-1496-21': { id: '60-1496-21', label: 'DXP 168 HD 4K PLUS',  description: '16x8 4K/60 HDMI with 4 Audio Outputs',  inputs: 16, outputs: 8,  video: true, audio: true, nameLen: 16, rooms: 10, roomLen: 12, roomPresets: 10, globalPresets: 16, edid: true, laser: false, hdcp: true, cec: true, xtp: false },
		'60-1497-21': { id: '60-1497-21', label: 'DXP 1616 HD 4K PLUS', description: '16x16 4K/60 HDMI with 4 Audio Outputs', inputs: 16, outputs: 16, video: true, audio: true, nameLen: 16, rooms: 10, roomLen: 12, roomPresets: 10, globalPresets: 16, edid: true, laser: false, hdcp: true, cec: true, xtp: false },

		'60-1493-01': { id: '60-1493-01', label: 'DXP 44 HD 4K',   description: '4x4 HDMI with 2 Audio Outputs',   inputs: 4,  outputs: 4,  video: true, audio: true, nameLen: 16, rooms: 10, roomLen: 12, roomPresets: 10, globalPresets: 16, edid: true, laser: false, hdcp: true, cec: false, xtp: false },
		'60-1494-01': { id: '60-1494-01', label: 'DXP 84 HD 4K',   description: '8x4 HDMI with 2 Audio Outputs',   inputs: 8,  outputs: 4,  video: true, audio: true, nameLen: 16, rooms: 10, roomLen: 12, roomPresets: 10, globalPresets: 16, edid: true, laser: false, hdcp: true, cec: false, xtp: false },
		'60-1495-01': { id: '60-1495-01', label: 'DXP 88 HD 4K',   description: '8x8 HDMI with 2 Audio Outputs',   inputs: 8,  outputs: 8,  video: true, audio: true, nameLen: 16, rooms: 10, roomLen: 12, roomPresets: 10, globalPresets: 16, edid: true, laser: false, hdcp: true, cec: false, xtp: false },
		'60-1496-01': { id: '60-1496-01', label: 'DXP 168 HD 4K',  description: '16x8 HDMI with 4 Audio Outputs',  inputs: 16, outputs: 8,  video: true, audio: true, nameLen: 16, rooms: 10, roomLen: 12, roomPresets: 10, globalPresets: 32, edid: true, laser: false, hdcp: true, cec: false, xtp: false },
		'60-1497-01': { id: '60-1497-01', label: 'DXP 1616 HD 4K', description: '16x16 HDMI with 4 Audio Outputs', inputs: 16, outputs: 16, video: true, audio: true, nameLen: 16, rooms: 10, roomLen: 12, roomPresets: 10, globalPresets: 32, edid: true, laser: false, hdcp: true, cec: false, xtp: false },

		'60-875-01':  { id: '60-875-01',  label: 'DXP 44 DVI Pro', description: '4x4 DVI Matrix Switcher',  inputs: 4, outputs: 4, video: true, audio: true, nameLen: 12, rooms: 0, roomLen: 0, roomPresets: 0, globalPresets: 32, edid: true, laser: false, hdcp: false, cec: false, xtp: false },
		'60-877-01':  { id: '60-877-01',  label: 'DXP 88 DVI Pro', description: '8x8 DVI Matrix Switcher',  inputs: 8, outputs: 8, video: true, audio: true, nameLen: 12, rooms: 0, roomLen: 0, roomPresets: 0, globalPresets: 32, edid: true, laser: false, hdcp: false, cec: false, xtp: false },
		'60-880-01':  { id: '60-880-01',  label: 'DXP 44 HDMI',    description: '4x4 HDMI Matrix Switcher', inputs: 4, outputs: 4, video: true, audio: true, nameLen: 12, rooms: 0, roomLen: 0, roomPresets: 0, globalPresets: 32, edid: true, laser: false, hdcp: false, cec: false, xtp: false },
		'60-1010-01': { id: '60-1010-01', label: 'DXP 48 HDMI',    description: '4x8 HDMI Matrix Switcher', inputs: 4, outputs: 8, video: true, audio: true, nameLen: 12, rooms: 0, roomLen: 0, roomPresets: 0, globalPresets: 32, edid: true, laser: false, hdcp: false, cec: false, xtp: false },
		'60-881-01':  { id: '60-881-01',  label: 'DXP 84 HDMI',    description: '8x4 HDMI Matrix Switcher', inputs: 8, outputs: 4, video: true, audio: true, nameLen: 12, rooms: 0, roomLen: 0, roomPresets: 0, globalPresets: 32, edid: true, laser: false, hdcp: false, cec: false, xtp: false },
		'60-882-01':  { id: '60-882-01',  label: 'DXP 88 HDMI',    description: '8x8 HDMI Matrix Switcher', inputs: 8, outputs: 8, video: true, audio: true, nameLen: 12, rooms: 0, roomLen: 0, roomPresets: 0, globalPresets: 32, edid: true, laser: false, hdcp: false, cec: false, xtp: false },

		'60-1250-01': { id: '60-1250-01', label: 'XTP CrossPoint 1600 Frame',          description: '5U, 8-Slot Matrix Frame',   inputs: 16, outputs: 16, video: true, audio: true, nameLen: 12, rooms: 0, roomLen: 0, roomPresets: 0, globalPresets: 32, edid: false, laser: false, hdcp: true, cec: false, xtp: true },
		'60-1250-11': { id: '60-1250-11', label: 'XTP CrossPoint 1600 Frame w/RPS',    description: '5U, 8-Slot Matrix Frame',   inputs: 16, outputs: 16, video: true, audio: true, nameLen: 12, rooms: 0, roomLen: 0, roomPresets: 0, globalPresets: 32, edid: false, laser: false, hdcp: true, cec: false, xtp: true },
		'60-1167-01': { id: '60-1167-01', label: 'XTP CrossPoint 3200 Frame',          description: '10U, 16-Slot Matrix Frame', inputs: 32, outputs: 32, video: true, audio: true, nameLen: 12, rooms: 0, roomLen: 0, roomPresets: 0, globalPresets: 32, edid: false, laser: false, hdcp: true, cec: false, xtp: true },
		'60-1545-01': { id: '60-1545-01', label: 'XTP II CrossPoint 1600 Frame',       description: '5U, 8-Slot Matrix Frame',   inputs: 16, outputs: 16, video: true, audio: true, nameLen: 12, rooms: 0, roomLen: 0, roomPresets: 0, globalPresets: 32, edid: false, laser: false, hdcp: true, cec: false, xtp: true },
		'60-1545-11': { id: '60-1545-11', label: 'XTP II CrossPoint 1600 Frame w/RPS', description: '5U, 8-Slot Matrix Frame',   inputs: 16, outputs: 16, video: true, audio: true, nameLen: 12, rooms: 0, roomLen: 0, roomPresets: 0, globalPresets: 32, edid: false, laser: false, hdcp: true, cec: false, xtp: true },
		'60-1546-01': { id: '60-1546-01', label: 'XTP II CrossPoint 3200 Frame',       description: '10U, 16-Slot Matrix Frame', inputs: 32, outputs: 32, video: true, audio: true, nameLen: 12, rooms: 0, roomLen: 0, roomPresets: 0, globalPresets: 32, edid: false, laser: false, hdcp: true, cec: false, xtp: true },
		'60-1386-01': { id: '60-1386-01', label: 'XTP II CrossPoint 6400 Frame',       description: '20U, 32-Slot Matrix Frame', inputs: 64, outputs: 64, video: true, audio: true, nameLen: 12, rooms: 0, roomLen: 0, roomPresets: 0, globalPresets: 32, edid: false, laser: false, hdcp: true, cec: false, xtp: true },

		'60-1257-01': { id: '60-1257-01', label: 'FOX Matrix 3200 Frame',  description: 'FOX Matrix 3200 Frame',  inputs: 32,  outputs: 32,  video: true, audio: false, nameLen: 12, rooms: 10, roomLen: 12, roomPresets: 10, globalPresets: 32, edid: false, laser: true, hdcp: false, cec: false, xtp: false },
		'60-970-01':  { id: '60-970-01',  label: 'FOX Matrix 3200 Frame',  description: 'FOX Matrix 3200 Frame',  inputs: 32,  outputs: 32,  video: true, audio: false, nameLen: 12, rooms: 10, roomLen: 12, roomPresets: 10, globalPresets: 32, edid: false, laser: true, hdcp: false, cec: false, xtp: false },
		'60-1256-01': { id: '60-1256-01', label: 'FOX Matrix 7200 Frame',  description: 'FOX Matrix 7200 Frame',  inputs: 72,  outputs: 72,  video: true, audio: false, nameLen: 12, rooms: 10, roomLen: 12, roomPresets: 10, globalPresets: 32, edid: false, laser: true, hdcp: false, cec: false, xtp: false },
		'60-1011-01': { id: '60-1011-01', label: 'FOX Matrix 7200 Frame',  description: 'FOX Matrix 7200 Frame',  inputs: 72,  outputs: 72,  video: true, audio: false, nameLen: 12, rooms: 10, roomLen: 12, roomPresets: 10, globalPresets: 32, edid: false, laser: true, hdcp: false, cec: false, xtp: false },
		'60-1255-01': { id: '60-1255-01', label: 'FOX Matrix 14400 Frame', description: 'FOX Matrix 14400 Frame', inputs: 144, outputs: 144, video: true, audio: false, nameLen: 12, rooms: 10, roomLen: 12, roomPresets: 10, globalPresets: 64, edid: false, laser: true, hdcp: false, cec: false, xtp: false },
		'60-1082-01': { id: '60-1082-01', label: 'FOX Matrix 320x Frame',  description: 'FOX Matrix 320x Frame',  inputs: 320, outputs: 320, video: true, audio: false, nameLen: 12, rooms: 10, roomLen: 12, roomPresets: 10, globalPresets: 64, edid: false, laser: true, hdcp: false, cec: false, xtp: false },
	},
	CHOICES_LAYER: [
		{ label: 'Video & Audio', id: '!' },
		{ label: 'Video only', id: '%' },
		{ label: 'Audio only', id: '$'}
	],
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
	INPUT_FIELD: {
		type: 'dropdown',
		label: 'Input',
		id: 'input',
		default: '1',
		choices: this.CHOICES_INPUTS
	},
	LAYER_FIELD: {
		type: 'dropdown',
		label: 'Layer',
		id: 'type',
		default: '!',
		choices: this.CHOICES_LAYER
	},
	NAME_FIELD: {
		type: 'textinput',
		label: 'New name',
		id: 'label',
		default: "",
		regex: '/^[A-Za-z0-9_\-]*$/'
	},
	OUTPUT_FIELD: {
		type: 'dropdown',
		label: 'Output',
		id: 'output',
		default: '1',
		choices: this.CHOICES_OUTPUTS
	},
	PRESET_FIELD: {
		type: 'dropdown',
		label: 'Preset',
		id: 'preset',
		default: '1',
		choices: this.CHOICES_PRESETS
	},
	ROOM_FIELD: {
		type: 'dropdown',
		label: 'Room',
		id: 'room',
		default: '1',
		choices: this.CHOICES_ROOMS
	}
}