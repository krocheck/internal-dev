module.exports = {

	/**
	 * INTERNAL: initialize feedbacks.
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	initFeedbacks() {
		// feedbacks
		var feedbacks = {};

		feedbacks['brightness'] = {
			label: 'Change background color by monitor brightness',
			description: 'If the selected monitor has the brightness specified, change background color of the bank',
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
					label:   'Select Monitor',
					id:      'mon',
					choices: this.CHOICES_MONITOR
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
			],
			callback: (feedback, bank) => {
				if (this.getMonitor(feedback.options.mon).brightness == feedback.options.val) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		if (this.config.ver != 'smView4K') {
			feedbacks['contrast'] = {
				label: 'Change background color by monitor contrast',
				description: 'If the selected monitor has the contrast specified, change background color of the bank',
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
						label:   'Select Monitor',
						id:      'mon',
						choices: this.CHOICES_MONITOR
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
				],
				callback: (feedback, bank) => {
					if (this.getMonitor(feedback.options.mon).contrast == feedback.options.val) {
						return {
							color: feedback.options.fg,
							bgcolor: feedback.options.bg
						};
					}
				}
			};
			feedbacks['saturation'] = {
				label: 'Change background color by monitor saturation',
				description: 'If the selected monitor has the saturation specified, change background color of the bank',
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
						label:   'Select Monitor',
						id:      'mon',
						choices: this.CHOICES_MONITOR
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
				],
				callback: (feedback, bank) => {
					if (this.getMonitor(feedback.options.mon).saturation == feedback.options.val) {
						return {
							color: feedback.options.fg,
							bgcolor: feedback.options.bg
						};
					}
				}
			};
		}

		feedbacks['identify'] = {
			label: 'Change background color by monitor identify state',
			description: 'If the selected monitor is currently identifying, change background color of the bank',
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
					label:   'Select Monitor',
					id:      'mon',
					choices: this.CHOICES_MONITOR
				}
			],
			callback: (feedback, bank) => {
				if (this.getMonitor(feedback.options.mon).identify === true) {
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