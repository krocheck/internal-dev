module.exports = {

	/**
	 * INTERNAL: Get the available actions.  Utilized by bmd-multiview.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	getActions() {
		var actions = {};

		actions['set_channel_name'] = {
			label: 'Set channel name',
			options: [
				this.CHANNELS_FIELD,
				this.NAME_FIELD
			]
		};

		if (this.model.family == 'ulx' || this.model.family == 'ad') {
			actions['channel_mute'] = {
				label: 'Mute or unmute channel',
				options: [
					this.CHANNELS_FIELD,
					this.MUTE_FIELD
				]
			};
		}

		actions['channel_setaudiogain'] = {
			label: 'Set audio gain of channel',
			options: [
				this.CHANNELS_FIELD,
				this.GAIN_SET_FIELD
			]
		};

		actions['channel_increasegain'] = {
			label: 'Increase audio gain of channel',
			options: [
				this.CHANNELS_FIELD,
				this.GAIN_INC_FIELD
			]
		};

		actions['channel_decreasegain'] = {
			label: 'Decrease audio gain of channel',
			options: [
				this.CHANNELS_FIELD,
				this.GAIN_INC_FIELD
			]
		};

		if (this.model.family != 'qlx') {
			actions['flash_lights'] = {
				label: 'Flash lights on receiver',
				tooltip: 'It will automatically turn off after 30 seconds'
			};
		}

		if (this.model.family == 'ad' || this.model.family == 'mxw' || this.model.family == 'slx') {
			actions['flash_channel'] = {
				label: 'Flash lights on receiver channel',
				tooltip: 'It will automatically turn off after 60 seconds',
				options: [
					this.CHANNELS_FIELD
				]
			};
		}

		if (this.model.family == 'ad') {
			actions['slot_rf_output'] = {
				label: 'Set slot RF output (ADX)',
				options: [
					this.SLOTS_FIELD,
					this.RFOUTPUT_FIELD
				]
			};
		}

		return actions;
	}
}