module.exports = {

	/**
	 * Get the available actions.
	 *
	 * @returns {Object[]} the available actions
	 * @access public
	 * @since 1.0.0
	 */
	getActions() {
		var actions = {};

		actions['left'] = { label: 'Pan Left' };
		actions['right'] = { label: 'Pan Right' };
		actions['up'] = { label: 'Tilt Up' };
		actions['down'] = { label: 'Tilt Down' };
		actions['upLeft'] = { label: 'Up Left' };
		actions['upRight'] = { label: 'Up Right' };
		actions['downLeft'] = { label: 'Down Left' };
		actions['downRight'] = { label: 'Down Right' };
		actions['stop'] = { label: 'P/T Stop' };
		actions['home'] = { label: 'P/T Home' };
		actions['ptSpeedS'] = {
			label: 'P/T Speed',
			options: [
				{
					type: 'number',
					label: 'Pan speed',
					id: 'panSpeed',
					min: 1,
					max: 24,
					default: 12,
					required: true,
					range: true
				},
				{
					type: 'number',
					label: 'Tilt speed',
					id: 'tiltSpeed',
					min: 1,
					max: 20,
					default: 10,
					required: true,
					range: true
				}
			]
		};

		actions['zoomI'] = { label: 'Zoom In' };
		actions['zoomO'] = { label: 'Zoom Out' };
		actions['zoomS'] = { label: 'Zoom Stop' };
		actions['zSpeedS'] = {
			label: 'Zoom Speed',
			options: [
				{
					type: 'number',
					label: 'speed setting',
					id: 'speed',
					min: 1,
					max: 7,
					default: 3,
					required: true,
					range: true
				}
			]
		};

		actions['focusN'] = { label: 'Focus Near' };
		actions['focusF'] = { label: 'Focus Far' };
		actions['focusS'] = { label: 'Focus Stop' };
		actions['fSpeedS'] = {
			label: 'Focus Speed',
			options: [
				{
					type: 'number',
					label: 'speed setting',
					id: 'speed',
					min: 1,
					max: 8,
					default: 4,
					required: true,
					range: true
				}
			]
		};
		actions['focusM'] = {
			label: 'Focus Mode',
			options: [
				{
					type: 'dropdown',
					label: 'Auto / Manual Focus',
					id: 'mode',
					choices: [ { id: 'auto', label: 'Auto Focus' }, { id: 'manual', label: 'Manual Focus' } ]
				}
			]
		};
/*
		actions['irisS'] = {
			label: 'Set Iris',
			options: [
				{
					type: 'dropdown',
					label: 'Iris setting',
					id: 'val',
					choices: IRIS
				}
			]
		};
		actions['gainS'] = {
			label: 'Set Gain',
			options: [
				{
					type: 'dropdown',
					label: 'Gain setting',
					id: 'val',
					choices: GAIN
				}
			]
		};
		actions['shutS'] = {
			label: 'Set Shutter',
			options: [
				{
					type: 'dropdown',
					label: 'Shutter setting',
					id: 'val',
					choices: SHUTTER
				}
			]
		};
		actions['pedU'] = { label: 'Pedestal Up' };
		actions['pedD'] = { label: 'Pedestal Down' };
		actions['pedS'] = {
			label: 'Set Pedestal',
			options: [
				{
					type: 'dropdown',
					label: 'Iris setting',
					id: 'val',
					choices: PEDESTAL
				}
			]
		};
		actions['filterU'] = { label: 'Filter Up' };
		actions['filterD'] = { label: 'Filter Down' };
		actions['filterS'] = {
			label: 'Set Filter',
			options: [
				{
					type: 'dropdown',
					label: 'Iris setting',
					id: 'val',
					choices: FILTER
				}
			]
		};
		actions['savePset'] = {
			label: 'Save Preset',
			options: [
				{
					type: 'dropdown',
					label: 'Preset Nr.',
					id: 'val',
					choices: PRESET
				}
			]
		};
		actions['recallPset'] = {
			label: 'Recall Preset',
			options: [
				{
					type: 'dropdown',
					label: 'Preset Nr.',
					id: 'val',
					choices: PRESET
				}
			]
		};
		actions['speedPset'] = {
			label: 'Preset Drive Speed',
			options: [
				{
					type: 'dropdown',
					label: 'speed setting',
					id: 'speed',
					choices: PSSPEED
				}
			]
		};
*/
		return actions;
	}
}