module.exports = {

	/**
	 * INTERNAL: initialize feedbacks.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initFeedbacks() {
		// feedbacks
		var feedbacks = {};

		feedbacks['preview_bg'] = {
			label: 'Change colors from preview',
			description: 'If the input specified is in use by preview on the M/E stage specified, change colors of the bank',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(255,255,255)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(0,255,0)
				},
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
			],
			callback: (feedback, bank) => {
				if (this.api.getME(feedback.options.mixeffect).pvwSrc == parseInt(feedback.options.input)) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};
		if (this.model.MEs >= 2) {
			feedbacks['preview_bg_2'] = {
				label: 'Change colors from two preview sources',
				description: 'If the inputs specified are in use by program on the M/E stage specified, change colors of the bank',
				options: [
					{
						type: 'colorpicker',
						label: 'Foreground color',
						id: 'fg',
						default: this.rgb(255,255,255)
					},
					{
						type: 'colorpicker',
						label: 'Background color',
						id: 'bg',
						default: this.rgb(0,255,0)
					},
					{
						type: 'dropdown',
						label: 'Input Option 1',
						id: 'input1',
						default: 1,
						choices: this.CHOICES_MESOURCES
					},
					{
						type: 'dropdown',
						id: 'mixeffect1',
						label: 'M/E Option 1',
						default: 0,
						choices: this.CHOICES_ME.slice(0, this.model.MEs)
					},
					{
						type: 'dropdown',
						label: 'Input Option 2',
						id: 'input2',
						default: 1,
						choices: this.CHOICES_MESOURCES
					},
					{
						type: 'dropdown',
						id: 'mixeffect2',
						label: 'M/E Option 2',
						default: 1,
						choices: this.CHOICES_ME.slice(1, this.model.MEs)
					}
				],
				callback: (feedback, bank) => {
					if ((this.api.getME(feedback.options.mixeffect1).pvwSrc == parseInt(feedback.options.input1)) &&
						(this.api.getME(feedback.options.mixeffect2).pvwSrc == parseInt(feedback.options.input2))){
						return {
							color: feedback.options.fg,
							bgcolor: feedback.options.bg
						};
					}
				}
			};
		};
		if (this.model.MEs >= 3) {
			feedbacks['preview_bg_3'] = {
				label: 'Change colors from three preview sources',
				description: 'If the inputs specified are in use by program on the M/E stage specified, change colors of the bank',
				options: [
					{
						type: 'colorpicker',
						label: 'Foreground color',
						id: 'fg',
						default: this.rgb(255,255,255)
					},
					{
						type: 'colorpicker',
						label: 'Background color',
						id: 'bg',
						default: this.rgb(0,255,0)
					},
					{
						type: 'dropdown',
						label: 'Input Option 1',
						id: 'input1',
						default: 1,
						choices: this.CHOICES_MESOURCES
					},
					{
						type: 'dropdown',
						id: 'mixeffect1',
						label: 'M/E Option 1',
						default: 0,
						choices: this.CHOICES_ME.slice(0, this.model.MEs)
					},
					{
						type: 'dropdown',
						label: 'Input Option 2',
						id: 'input2',
						default: 1,
						choices: this.CHOICES_MESOURCES
					},
					{
						type: 'dropdown',
						id: 'mixeffect2',
						label: 'M/E Option 2',
						default: 0,
						choices: this.CHOICES_ME.slice(0, this.model.MEs)
					},
					{
						type: 'dropdown',
						label: 'Input Option 3',
						id: 'input3',
						default: 1,
						choices: this.CHOICES_MESOURCES
					},
					{
						type: 'dropdown',
						id: 'mixeffect3',
						label: 'M/E Option 3',
						default: 0,
						choices: this.CHOICES_ME.slice(0, this.model.MEs)
					}
				],
				callback: (feedback, bank) => {
					if ((this.api.getME(feedback.options.mixeffect1).pvwSrc == parseInt(feedback.options.input1)) &&
						(this.api.getME(feedback.options.mixeffect2).pvwSrc == parseInt(feedback.options.input2)) &&
						(this.api.getME(feedback.options.mixeffect3).pvwSrc == parseInt(feedback.options.input3))){
						return {
							color: feedback.options.fg,
							bgcolor: feedback.options.bg
						};
					}
				}
			};
		};
		if (this.model.MEs >= 4) {
			feedbacks['preview_bg_4'] = {
				label: 'Change colors from four preview sources',
				description: 'If the inputs specified are in use by program on the M/E stage specified, change colors of the bank',
				options: [
					{
						type: 'colorpicker',
						label: 'Foreground color',
						id: 'fg',
						default: this.rgb(255,255,255)
					},
					{
						type: 'colorpicker',
						label: 'Background color',
						id: 'bg',
						default: this.rgb(0,255,0)
					},
					{
						type: 'dropdown',
						label: 'Input Option 1',
						id: 'input1',
						default: 1,
						choices: this.CHOICES_MESOURCES
					},
					{
						type: 'dropdown',
						id: 'mixeffect1',
						label: 'M/E Option 1',
						default: 0,
						choices: this.CHOICES_ME.slice(0, this.model.MEs)
					},
					{
						type: 'dropdown',
						label: 'Input Option 2',
						id: 'input2',
						default: 1,
						choices: this.CHOICES_MESOURCES
					},
					{
						type: 'dropdown',
						id: 'mixeffect2',
						label: 'M/E Option 2',
						default: 1,
						choices: this.CHOICES_ME.slice(1, this.model.MEs)
					},
					{
						type: 'dropdown',
						label: 'Input Option 3',
						id: 'input3',
						default: 1,
						choices: this.CHOICES_MESOURCES
					},
					{
						type: 'dropdown',
						id: 'mixeffect3',
						label: 'M/E Option 3',
						default: 2,
						choices: this.CHOICES_ME.slice(2, this.model.MEs)
					},
					{
						type: 'dropdown',
						label: 'Input Option 4',
						id: 'input4',
						default: 1,
						choices: this.CHOICES_MESOURCES
					},
					{
						type: 'dropdown',
						id: 'mixeffect4',
						label: 'M/E Option 4',
						default: 3,
						choices: this.CHOICES_ME.slice(3, this.model.MEs)
					}
				],
				callback: (feedback, bank) => {
					if ((this.api.getME(feedback.options.mixeffect1).pvwSrc == parseInt(feedback.options.input1)) &&
						(this.api.getME(feedback.options.mixeffect2).pvwSrc == parseInt(feedback.options.input2)) &&
						(this.api.getME(feedback.options.mixeffect3).pvwSrc == parseInt(feedback.options.input3)) &&
						(this.api.getME(feedback.options.mixeffect4).pvwSrc == parseInt(feedback.options.input4))){
						return {
							color: feedback.options.fg,
							bgcolor: feedback.options.bg
						};
					}
				}
			};
		};
		feedbacks['program_bg'] = {
			label: 'Change colors from program',
			description: 'If the input specified is in use by program on the M/E stage specified, change colors of the bank',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(255,255,255)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(255,0,0)
				},
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
			],
			callback: (feedback, bank) => {
				if (this.api.getME(feedback.options.mixeffect).pgmSrc == parseInt(feedback.options.input)) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};
		if (this.model.MEs >= 2) {
			feedbacks['program_bg_2'] = {
				label: 'Change colors from two program sources',
				description: 'If the inputs specified are in use by program on the M/E stage specified, change colors of the bank',
				options: [
					{
						type: 'colorpicker',
						label: 'Foreground color',
						id: 'fg',
						default: this.rgb(255,255,255)
					},
					{
						type: 'colorpicker',
						label: 'Background color',
						id: 'bg',
						default: this.rgb(255,0,0)
					},
					{
						type: 'dropdown',
						label: 'Input Option 1',
						id: 'input1',
						default: 1,
						choices: this.CHOICES_MESOURCES
					},
					{
						type: 'dropdown',
						id: 'mixeffect1',
						label: 'M/E Option 1',
						default: 0,
						choices: this.CHOICES_ME.slice(0, this.model.MEs)
					},
					{
						type: 'dropdown',
						label: 'Input Option 2',
						id: 'input2',
						default: 1,
						choices: this.CHOICES_MESOURCES
					},
					{
						type: 'dropdown',
						id: 'mixeffect2',
						label: 'M/E Option 2',
						default: 1,
						choices: this.CHOICES_ME.slice(1, this.model.MEs)
					}
				],
				callback: (feedback, bank) => {
					if ((this.api.getME(feedback.options.mixeffect1).pgmSrc == parseInt(feedback.options.input1)) &&
						(this.api.getME(feedback.options.mixeffect2).pgmSrc == parseInt(feedback.options.input2))){
						return {
							color: feedback.options.fg,
							bgcolor: feedback.options.bg
						};
					}
				}
			};
		};
		if (this.model.MEs >= 3) {
			feedbacks['program_bg_3'] = {
				label: 'Change colors from three program sources',
				description: 'If the inputs specified are in use by program on the M/E stage specified, change colors of the bank',
				options: [
					{
						type: 'colorpicker',
						label: 'Foreground color',
						id: 'fg',
						default: this.rgb(255,255,255)
					},
					{
						type: 'colorpicker',
						label: 'Background color',
						id: 'bg',
						default: this.rgb(255,0,0)
					},
					{
						type: 'dropdown',
						label: 'Input Option 1',
						id: 'input1',
						default: 1,
						choices: this.CHOICES_MESOURCES
					},
					{
						type: 'dropdown',
						id: 'mixeffect1',
						label: 'M/E Option 1',
						default: 0,
						choices: this.CHOICES_ME.slice(0, this.model.MEs)
					},
					{
						type: 'dropdown',
						label: 'Input Option 2',
						id: 'input2',
						default: 1,
						choices: this.CHOICES_MESOURCES
					},
					{
						type: 'dropdown',
						id: 'mixeffect2',
						label: 'M/E Option 2',
						default: 0,
						choices: this.CHOICES_ME.slice(0, this.model.MEs)
					},
					{
						type: 'dropdown',
						label: 'Input Option 3',
						id: 'input3',
						default: 1,
						choices: this.CHOICES_MESOURCES
					},
					{
						type: 'dropdown',
						id: 'mixeffect3',
						label: 'M/E Option 3',
						default: 0,
						choices: this.CHOICES_ME.slice(0, this.model.MEs)
					}
				],
				callback: (feedback, bank) => {
					if ((this.api.getME(feedback.options.mixeffect1).pgmSrc == parseInt(feedback.options.input1)) &&
						(this.api.getME(feedback.options.mixeffect2).pgmSrc == parseInt(feedback.options.input2)) &&
						(this.api.getME(feedback.options.mixeffect3).pgmSrc == parseInt(feedback.options.input3))){
						return {
							color: feedback.options.fg,
							bgcolor: feedback.options.bg
						};
					}
				}
			};
		};
		if (this.model.MEs >= 4) {
			feedbacks['program_bg_4'] = {
				label: 'Change colors from four program sources',
				description: 'If the inputs specified are in use by program on the M/E stage specified, change colors of the bank',
				options: [
					{
						type: 'colorpicker',
						label: 'Foreground color',
						id: 'fg',
						default: this.rgb(255,255,255)
					},
					{
						type: 'colorpicker',
						label: 'Background color',
						id: 'bg',
						default: this.rgb(255,0,0)
					},
					{
						type: 'dropdown',
						label: 'Input Option 1',
						id: 'input1',
						default: 1,
						choices: this.CHOICES_MESOURCES
					},
					{
						type: 'dropdown',
						id: 'mixeffect1',
						label: 'M/E Option 1',
						default: 0,
						choices: this.CHOICES_ME.slice(0, this.model.MEs)
					},
					{
						type: 'dropdown',
						label: 'Input Option 2',
						id: 'input2',
						default: 1,
						choices: this.CHOICES_MESOURCES
					},
					{
						type: 'dropdown',
						id: 'mixeffect2',
						label: 'M/E Option 2',
						default: 1,
						choices: this.CHOICES_ME.slice(1, this.model.MEs)
					},
					{
						type: 'dropdown',
						label: 'Input Option 3',
						id: 'input3',
						default: 1,
						choices: this.CHOICES_MESOURCES
					},
					{
						type: 'dropdown',
						id: 'mixeffect3',
						label: 'M/E Option 3',
						default: 2,
						choices: this.CHOICES_ME.slice(2, this.model.MEs)
					},
					{
						type: 'dropdown',
						label: 'Input Option 4',
						id: 'input4',
						default: 1,
						choices: this.CHOICES_MESOURCES
					},
					{
						type: 'dropdown',
						id: 'mixeffect4',
						label: 'M/E Option 4',
						default: 3,
						choices: this.CHOICES_ME.slice(3, this.model.MEs)
					}
				],
				callback: (feedback, bank) => {
					if ((this.api.getME(feedback.options.mixeffect1).pgmSrc == parseInt(feedback.options.input1)) &&
						(this.api.getME(feedback.options.mixeffect2).pgmSrc == parseInt(feedback.options.input2)) &&
						(this.api.getME(feedback.options.mixeffect3).pgmSrc == parseInt(feedback.options.input3)) &&
						(this.api.getME(feedback.options.mixeffect4).pgmSrc == parseInt(feedback.options.input4))){
						return {
							color: feedback.options.fg,
							bgcolor: feedback.options.bg
						};
					}
				}
			};
		};
		feedbacks['aux_bg'] = {
			label: 'Change colors from AUX bus',
			description: 'If the input specified is in use by the aux bus specified, change colors of the bank',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(0,0,0)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(255,255,0)
				},
				{
					type: 'dropdown',
					label: 'Input',
					id: 'input',
					default: 1,
					choices: this.CHOICES_AUXSOURCES
				},
				{
					type: 'dropdown',
					id: 'aux',
					label: 'AUX',
					default: 0,
					choices: this.CHOICES_AUXES.slice(0, this.model.auxes)
				}
			],
			callback: (feedback, bank) => {
				if (this.api.getAux(parseInt(feedback.options.aux)).source == parseInt(feedback.options.input)) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};
		feedbacks['usk_bg'] = {
			label: 'Change colors from upstream keyer state',
			description: 'If the specified upstream keyer is active, change color of the bank',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(255,255,255)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(255,0,0)
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
			],
			callback: (feedback, bank) => {
				if (this.api.getUSK(feedback.options.mixeffect, feedback.options.key).onAir) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};
		feedbacks['usk_source'] = {
			label: 'Change colors from upstream keyer fill source',
			description: 'If the input specified is in use by the USK specified, change colors of the bank',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(0,0,0)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(238,238,0)
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
				},
				{
					type: 'dropdown',
					label: 'Fill Source',
					id: 'fill',
					default: 1,
					choices: this.CHOICES_MESOURCES
				}
			],
			callback: (feedback, bank) => {
				if (this.api.getUSK(feedback.options.mixeffect, feedback.options.key).fillSource == parseInt(feedback.options.fill)) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};
		feedbacks['dsk_bg'] = {
			label: 'Change colors from downstream keyer state',
			description: 'If the specified downstream keyer is active, change color of the bank',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(255,255,255)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(255,0,0)
				},
				{
					type: 'dropdown',
					label: 'Key',
					id: 'key',
					default: '0',
					choices: this.CHOICES_DSKS.slice(0, this.model.DSKs)
				}
			],
			callback: (feedback, bank) => {
				if (this.api.getDSK(feedback.options.key).onAir) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};
		feedbacks['dsk_source'] = {
			label: 'Change colors from downstream keyer fill source',
			description: 'If the input specified is in use by the DSK specified, change colors of the bank',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(0,0,0)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(238,238,0)
				},
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
				}
			],
			callback: (feedback, bank) => {
				if (this.api.getDSK(feedback.options.key).fillSource == parseInt(feedback.options.fill)) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};
		feedbacks['macro'] = {
			label: 'Change colors from macro state',
			description: 'If the specified macro is running or waiting, change color of the bank',
			options: [
				{
					type:   'colorpicker',
					label:  'Foreground color',
					id:     'fg',
					default: this.rgb(255,255,255)
				},
				{
					type:   'colorpicker',
					label:  'Background color',
					id:     'bg',
					default: this.rgb(238,238,0)
				},
				{
					type:    'textinput',
					label:   'Macro Number (1-100)',
					id:      'macroIndex',
					default: '1',
					regex:   '/^([1-9]|[1-9][0-9]|100)$/'
				},
				{
					type:    'dropdown',
					label:   'State',
					id:      'state',
					default: 'isWaiting',
					choices: this.CHOICES_MACROSTATE
				}
			],
			callback: (feedback, bank) => {
				if ( this.api.getMacro(feedback.options.macroIndex-1)[feedback.options.state] == 1 ) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};
		feedbacks['mv_source'] = {
			label: 'Change colors from MV window',
			description: 'If the specified MV window is set to the specified source, change color of the bank',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(0,0,0)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(255,255,0)
				},
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
			],
			callback: (feedback, bank) => {
				if (this.api.getMvWindow(feedback.options.multiViewerId, feedback.options.windowIndex).source == feedback.options.source) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};
		feedbacks['ssrc_box_source'] = {
			label: 'Change colors from SuperSorce box source',
			description: 'If the specified SuperSource box is set to the specified source, change color of the bank',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(0,0,0)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(255,255,0)
				},
				{
					type:    'dropdown',
					id:      'boxIndex',
					label:   'Box #',
					default: 2,
					choices: this.CHOICES_SSRCBOXES
				},
				{
					type:    'dropdown',
					id:      'source',
					label:   'Source',
					default: 0,
					choices: this.CHOICES_MESOURCES
				}
			],
			callback: (feedback, bank) => {
				if (this.api.getSuperSourceBox(opt.boxIndex, 0).source == opt.source) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		this.setFeedbackDefinitions(feedbacks);
	}
}