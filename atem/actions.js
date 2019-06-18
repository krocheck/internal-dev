module.exports = {

	/**
	 * Get the available actions.  Utilized by bmd-multiview.
	 *
	 * @returns {Object[]} the available actions
	 * @access public
	 * @since 1.2.0
	 */
	getActions() {
		var actions = {};

		actions['program'] = {
			label: 'Set input on Program',
			options: [
				{
					 type: 'dropdown',
					 label: 'Input',
					 id: 'input',
					 default: 1,
					 choices: this.CHOICES_MESOURCES
				},
				{
					type: 'dropdown',
					id: 'mixeffect',
					label: 'M/E',
					default: 0,
					choices: this.CHOICES_ME.slice(0, this.model.MEs)
				}
			]
		};
		actions['preview'] = {
			label: 'Set input on Preview',
			options: [
				{
					 type: 'dropdown',
					 label: 'Input',
					 id: 'input',
					 default: 1,
					 choices: this.CHOICES_MESOURCES
				},
				{
					type: 'dropdown',
					id: 'mixeffect',
					label: 'M/E',
					default: 0,
					choices: this.CHOICES_ME.slice(0, this.model.MEs)
				}
			]
		};
		actions['uskSource'] = {
			label: 'Set inputs on Upstream KEY',
			options: [
				{
					type: 'dropdown',
					id: 'mixeffect',
					label: 'M/E',
					default: 0,
					choices: this.CHOICES_ME.slice(0, this.model.MEs)
				},
				{
					type: 'dropdown',
					label: 'Key',
					id: 'key',
					default: '0',
					choices: this.CHOICES_USKS.slice(0, this.model.USKs)
				},
				{
					 type: 'dropdown',
					 label: 'Fill Source',
					 id: 'fill',
					 default: 1,
					 choices: this.CHOICES_MESOURCES
				},
				{
					 type: 'dropdown',
					 label: 'Key Source',
					 id: 'cut',
					 default: 0,
					 choices: this.CHOICES_MESOURCES
				}
			]
		};
		actions['dskSource'] = {
			label: 'Set inputs on Downstream KEY',
			options: [
				{
					type: 'dropdown',
					label: 'Key',
					id: 'key',
					default: '0',
					choices: this.CHOICES_DSKS.slice(0, this.model.DSKs)
				},
				{
					 type: 'dropdown',
					 label: 'Fill Source',
					 id: 'fill',
					 default: 1,
					 choices: this.CHOICES_MESOURCES
				},
				{
					 type: 'dropdown',
					 label: 'Key Source',
					 id: 'cut',
					 default: 0,
					 choices: this.CHOICES_MESOURCES
				}
			]
		};
		actions['aux'] = {
			label: 'Set AUX bus',
			options: [
				{
					type: 'dropdown',
					id: 'aux',
					label: 'AUX Output',
					default: 0,
					choices: this.CHOICES_AUXES.slice(0, this.model.auxes)
				},
				{
					 type: 'dropdown',
					 label: 'Input',
					 id: 'input',
					 default: 1,
					 choices: this.CHOICES_AUXSOURCES
				}
			]
		};
		actions['usk'] = {
			label: 'Set Upstream KEY OnAir',
			options: [
				{
					id: 'onair',
					type: 'dropdown',
					label: 'On Air',
					default: 'true',
					choices: this.CHOICES_KEYTRANS
				},
				{
					type: 'dropdown',
					id: 'mixeffect',
					label: 'M/E',
					default: 0,
					choices: this.CHOICES_ME.slice(0, this.model.MEs)
				},
				{
					type: 'dropdown',
					label: 'Key',
					id: 'key',
					default: '0',
					choices: this.CHOICES_USKS.slice(0, this.model.USKs)
				}
			]
		};
		actions['dsk'] = {
			label: 'Set Downstream KEY OnAir',
			options: [
				{
					id: 'onair',
					type: 'dropdown',
					label: 'On Air',
					default: 'true',
					choices: this.CHOICES_KEYTRANS
				},
				{
					type: 'dropdown',
					label: 'Key',
					id: 'key',
					default: '0',
					choices: this.CHOICES_DSKS.slice(0, this.model.DSKs)
				}
			]
		};
		actions['cut'] = {
			label: 'CUT operation',
			options: [
				{
					type: 'dropdown',
					id: 'mixeffect',
					label: 'M/E',
					default: 0,
					choices: this.CHOICES_ME.slice(0, this.model.MEs)
				}
			]
		};
		actions['auto'] = {
			label: 'AUTO transition operation',
			options: [
				{
					type: 'dropdown',
					id: 'mixeffect',
					label: 'M/E',
					default: 0,
					choices: this.CHOICES_ME.slice(0, this.model.MEs)
				}
			]
		};
		actions['macrorun'] = {
			label: 'Run MACRO',
			options: [
				{
					type:    'textinput',
					id:      'macro',
					label:   'Macro number',
					default: 1,
					regex:   '/^([1-9]|[1-9][0-9]|100)$/'
				},
				{
					type:    'dropdown',
					id:      'action',
					label:   'Action',
					default: 'run',
					choices: this.CHOICES_MACRORUN
				}
			]
		};
		actions['macrocontinue'] = { label: 'Continue MACRO' };
		actions['macrostop']     = { label: 'Stop MACROS' };
		actions['setMvSource']   = {
			label: 'Change MV window source',
			options: [
				{
					type:    'dropdown',
					id:      'multiViewerId',
					label:   'MV',
					default: 0,
					choices: this.CHOICES_MV.slice(0, this.model.MVs)
				},
				{
					type:    'dropdown',
					id:      'windowIndex',
					label:   'Window #',
					default: 2,
					choices: this.CHOICES_MVWINDOW
				},
				{
					type:    'dropdown',
					id:      'source',
					label:   'Source',
					default: 0,
					choices: this.CHOICES_MVSOURCES
				}
			]
		};

		if (this.model.SSrc > 1) {
			actions['setSsrcCascade'] = {
				label: 'Set SuperSource cascade',
				options: [
					{
						type:    'checkbox',
						id:      'enable',
						label:   'Enable cascade?',
						default: false
					}
				]
			};
		}

		if (this.model.SSrc > 0) {
			actions['setSsrcBoxSource'] = {
				label: 'Change SuperSource box source',
				options: [
					{
						type: 'dropdown',
						id: 'ssrc',
						label: 'SuperSource',
						default: 0,
						choices: this.CHOICES_SUPERSOURCES.slice(0, this.model.SSrc)
					},
					{
						type:    'dropdown',
						id:      'boxIndex',
						label:   'Box #',
						default: 0,
						choices: this.CHOICES_SSRCBOXES
					},
					{
						type:    'dropdown',
						id:      'source',
						label:   'Source',
						default: 0,
						choices: this.CHOICES_MESOURCES
					}
				]
			};
			actions['setSsrcBoxEnabled'] = {
				label: 'Set SuperSource box enable',
				options: [
					{
						type: 'dropdown',
						id: 'ssrc',
						label: 'SuperSource',
						default: 0,
						choices: this.CHOICES_SUPERSOURCES.slice(0, this.model.SSrc)
					},
					{
						type:    'dropdown',
						id:      'boxIndex',
						label:   'Box #',
						default: 0,
						choices: this.CHOICES_SSRCBOXES
					},
					{
						type:    'checkbox',
						id:      'enable',
						label:   'Enable box?',
						default: false
					}
				]
			};
		}

		return actions;
	}
}