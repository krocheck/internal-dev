module.exports = {

	/**
	 * INTERNAL: initialize feedbacks.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initFeedbacks() {
		var feedbacks = {};

		feedbacks['input_bg'] = {
			label: 'Change background color by output',
			description: 'If the input specified is in use by the output specified, change background color of the bank',
			options: [
				this.FG_COLOR_FIELD(this.rgb(0,0,0)),
				this.BG_COLOR_FIELD(this.rgb(255,255,0)),
				this.INPUT_FIELD,
				this.OUTPUT_FIELD
			],
			callback: (feedback, bank) => {
				if (this.getOutput(parseInt(feedback.options.output)).route == parseInt(feedback.options.input)) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		feedbacks['selected_output'] = {
			label: 'Change background color by selected output',
			description: 'If the output specified is selected, change background color of the bank',
			options: [
				this.FG_COLOR_FIELD(this.rgb(0,0,0)),
				this.BG_COLOR_FIELD(this.rgb(255,255,0)),
				this.OUTPUT_FIELD
			],
			callback: (feedback, bank) => {
				if (parseInt(feedback.options.output) == this.selected) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		feedbacks['selected_input'] = {
			label: 'Change background color by route to selected output',
			description: 'If the input specified is in use by the selected output, change background color of the bank',
			options: [
				this.FG_COLOR_FIELD(this.rgb(0,0,0)),
				this.BG_COLOR_FIELD(this.rgb(255,255,255)),
				this.INPUT_FIELD
			],
			callback: (feedback, bank) => {
				if (this.getOutput(this.selected).route == parseInt(feedback.options.input)) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		feedbacks['take'] = {
			label: 'Change background color if take has a route queued',
			description: 'If a route is queued for take, change background color of the bank',
			options: [
				this.FG_COLOR_FIELD(this.rgb(255,255,255)),
				this.BG_COLOR_FIELD(this.rgb(255,0,0))
			],
			callback: (feedback, bank) => {
				if (this.queue != '') {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		feedbacks['take_tally_input'] = {
			label: 'Change background color if the selected input is queued in take',
			description: 'If the selected input is queued for take, change background color of the bank',
			options: [
				this.FG_COLOR_FIELD(this.rgb(255,255,255)),
				this.BG_COLOR_FIELD(this.rgb(255,0,0)),
				this.INPUT_FIELD
			],
			callback: (feedback, bank) => {
				if (parseInt(feedback.options.input) == this.queuedSource && this.selected == this.queuedDest) {
					return {
						color: feedback.options.fg,
						bgcolor: feedback.options.bg
					};
				}
			}
		};

		feedbacks['take_tally_output'] = {
			label: 'Change background color if the selected output is queued in take',
			description: 'If the selected output is queued for take, change background color of the bank',
			options: [
				this.FG_COLOR_FIELD(this.rgb(255,255,255)),
				this.BG_COLOR_FIELD(this.rgb(255,0,0)),
				this.OUTPUT_FIELD
			],
			callback: (feedback, bank) => {
				if (parseInt(feedback.options.output) == this.queuedDest) {
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