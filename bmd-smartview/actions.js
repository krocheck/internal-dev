module.exports = {

	/**
	 * INTERNAL: Get the available actions.  Utilized by bmd-multiview.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @returns {Object[]} the available actions
	 * @access protected
	 * @since 1.1.0
	 */
	getActions(system) {
		var actions = {};

		actions['bright'] = {
			label: 'Brightness',
			options: [
				{
					type:    'dropdown',
					label:   'Select Monitor',
					id:      'mon',
					choices: this.CHOICES_MONITOR,
					default: 'MONITOR A:'
				},
				{
					type:    'number',
					label:   'Set the level 0-255',
					id:      'val',
					min:      0,
					max:      255,
					default:  255,
					required: true,
					range:    true
				}
			]
		};
		actions['brightUp'] = {
			label: 'Brightness (Inc)',
			options: [
				{
					type:    'dropdown',
					label:   'Select Monitor',
					id:      'mon',
					choices: this.CHOICES_MONITOR,
					default: 'MONITOR A:'
				},
				{
					type:    'number',
					label:   'Set the level 1-255',
					id:      'val',
					min:      1,
					max:      255,
					default:  5,
					required: true,
					range:    false
				}
			]
		};
		actions['brightDown'] = {
			label: 'Brightness (Dec)',
			options: [
				{
					type:    'dropdown',
					label:   'Select Monitor',
					id:      'mon',
					choices: this.CHOICES_MONITOR,
					default: 'MONITOR A:'
				},
				{
					type:    'number',
					label:   'Increment Amount (1-255)',
					id:      'val',
					min:      1,
					max:      255,
					default:  5,
					required: true,
					range:    false
				}
			]
		};

		if (this.config.ver != 'smView4K') {
			actions['cont'] = {
				label: 'Contrast',
				options: [
					{
						type:    'dropdown',
						label:   'Select Monitor',
						id:      'mon',
						choices: this.CHOICES_MONITOR,
						default: 'MONITOR A:'
					},
					{
						type:    'number',
						label:   'Set the level 0-255',
						id:      'val',
						min:      0,
						max:      255,
						default:  127,
						required: true,
						range:    true
					}
				]
			};
			actions['contUp'] = {
				label: 'Contrast (Inc)',
				options: [
					{
						type:    'dropdown',
						label:   'Select Monitor',
						id:      'mon',
						choices: this.CHOICES_MONITOR,
						default: 'MONITOR A:'
					},
					{
						type:    'number',
						label:   'Increment Amount (1-255)',
						id:      'val',
						min:      1,
						max:      255,
						default:  5,
						required: true,
						range:    false
					}
				]
			};
			actions['contDown'] = {
				label: 'Contrast (Dec)',
				options: [
					{
						type:    'dropdown',
						label:   'Select Monitor',
						id:      'mon',
						choices: this.CHOICES_MONITOR,
						default: 'MONITOR A:'
					},
					{
						type:    'number',
						label:   'Decrement Amount (1-255)',
						id:      'val',
						min:      1,
						max:      255,
						default:  5,
						required: true,
						range:    false
					}
				]
			};

			actions['sat'] = {
				label: 'Saturation',
				options: [
					{
						type:    'dropdown',
						label:   'Select Monitor',
						id:      'mon',
						choices: this.CHOICES_MONITOR,
						default: 'MONITOR A:'
					},
					{
						type:     'number',
						label:    'Set the level 0-255',
						id:       'val',
						min:      0,
						max:      255,
						default:  127,
						required: true,
						range:    true
					}
				]
			};
			actions['satUp'] = {
				label: 'Saturation (Inc)',
				options: [
					{
						type:    'dropdown',
						label:   'Select Monitor',
						id:      'mon',
						choices: this.CHOICES_MONITOR,
						default: 'MONITOR A:'
					},
					{
						type:    'number',
						label:   'Increment Amount (1-255)',
						id:      'val',
						min:      1,
						max:      255,
						default:  5,
						required: true,
						range:    false
					}
				]
			};
			actions['satDown'] = {
				label: 'Saturation (Dec)',
				options: [
					{
						type:    'dropdown',
						label:   'Select Monitor',
						id:      'mon',
						choices: this.CHOICES_MONITOR,
						default: 'MONITOR A:'
					},
					{
						type:    'number',
						label:   'Decrement Amount (1-255)',
						id:      'val',
						min:      1,
						max:      255,
						default:  5,
						required: true,
						range:    false
					}
				]
			};
		}

		actions['ident'] = {
			label: 'Identify 15 Sec',
			options: [
				{
					type:    'dropdown',
					label:   'Select Monitor',
					id:      'mon',
					choices: this.CHOICES_MONITOR,
					default: 'MONITOR A:'
				}
			]
		};

		actions['border'] = {
			label: 'Border',
			options: [
				{
					type:    'dropdown',
					label:   'Select Monitor',
					id:      'mon',
					choices: this.CHOICES_MONITOR,
					default: 'MONITOR A:'
				},
				{
					type:    'dropdown',
					label:   'Color',
					id:      'col',
					choices: this.CHOICES_COLORS
				}
			]
		};

		if (this.config.ver == 'smScope') {
			actions['scopeFunc'] = {
				label: 'Scope Function',
				options: [
					{
						type:    'dropdown',
						label:   'Select Monitor',
						id:      'mon',
						choices: this.CHOICES_MONITOR,
						default: 'MONITOR A:'
					},
					{
						type:    'dropdown',
						label:   'Function',
						id:      'val',
						choices: this.CHOICES_SCOPETYPE
					}
				]
			};

			actions['audio'] = {
				label: 'Audio Channels',
				options: [
					{
						type:    'dropdown',
						label:   'Select Monitor',
						id:      'mon',
						choices: this.CHOICES_MONITOR,
						default: 'MONITOR A:'
					},
					{
						type:    'dropdown',
						label:   'Channels',
						id:      'val',
						choices: this.CHOICES_AUDIOCHANNELS
					}
				]
			};
		}

		if (this.config.ver == 'smView4K') {
			actions['lut'] = {
				label: 'Set LUT',
				options: [
					{
						type:    'dropdown',
						label:   'Select Monitor',
						id:      'mon',
						choices: this.CHOICES_MONITOR,
						default: 'MONITOR A:'
					},
					{
						type:    'dropdown',
						label:   'LUT',
						id:      'val',
						choices: this.CHOICES_LUTS
					}
				]
			};
			actions['input'] = {
				label: 'Select Input',
				options: [
					{
						type:    'dropdown',
						label:   'Select Monitor',
						id:      'mon',
						choices: this.CHOICES_MONITOR,
						default: 'MONITOR A:'
					},
					{
						type:    'dropdown',
						label:   'Input',
						id:      'val',
						choices: this.CHOICES_INPUTS
					}
				]
			};
		}

		return actions;
	}
}