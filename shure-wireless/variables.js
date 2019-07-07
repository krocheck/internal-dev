module.exports = {

	/**
	 * INTERNAL: initialize variables.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initVariables() {
		// variable_set
		var variables = [];

		for (let i = 1; i <= this.model.channels; i++) {
			variables.push({ name: 'channel_name_' + i,                 label: 'Channel ' + i + ' Name' });
			variables.push({ name: 'audio_mute_' + i,                   label: 'Channel ' + i + ' Audio Mute' });
			variables.push({ name: 'audio_gain_' + i,                   label: 'Channel ' + i + ' Audio Gain' });
			variables.push({ name: 'group_channel_' + i,                label: 'Channel ' + i + ' Group & Channel' });
			variables.push({ name: 'frequency_' + i,                    label: 'Channel ' + i + ' Frequency' });
			variables.push({ name: 'battery_cycle_' + i,                label: 'Channel ' + i + ' Battery Cycle' });
			variables.push({ name: 'battery_runtime_' + i,              label: 'Channel ' + i + ' Battery Run Time' });
			variables.push({ name: 'battery_temperature_f_' + i,        label: 'Channel ' + i + ' Battery Temperature (F)' });
			variables.push({ name: 'battery_temperature_c_' + i,        label: 'Channel ' + i + ' Battery Temperature (C)' });
			variables.push({ name: 'battery_type_' + i,                 label: 'Channel ' + i + ' Battery Type' });
			variables.push({ name: 'battery_chargestatus_' + i,         label: 'Channel ' + i + ' Battery Charge Status' });
			variables.push({ name: 'battery_bars_' + i,                 label: 'Channel ' + i + ' Battery Bars' });
			variables.push({ name: 'transmitter_type_' + i,             label: 'Channel ' + i + ' Transmitter Type' });
			variables.push({ name: 'transmitter_offset_' + i,           label: 'Channel ' + i + ' Transmitter Offset' });
			variables.push({ name: 'transmitter_rfpower_' + i,          label: 'Channel ' + i + ' Transmitter RF Power' });
			variables.push({ name: 'transmitter_powerlock_' + i,        label: 'Channel ' + i + ' Transmitter Power Lock' });
			variables.push({ name: 'transmitter_menulock_' + i,         label: 'Channel ' + i + ' Transmitter Menu Lock' });
			variables.push({ name: 'interference_detection_' + i,       label: 'Channel ' + i + ' Interference Detection' });
			variables.push({ name: 'encryption_status_' + i,            label: 'Channel ' + i + ' Encryption Status' });
			variables.push({ name: 'encryption_warning_' + i,           label: 'Channel ' + i + ' Encryption Mismatch/Warning' });
			variables.push({ name: 'transmitter_deviceid_' + i,         label: 'Channel ' + i + ' Transmitter Device ID' });
			variables.push({ name: 'transmitter_mutestatus_' + i,       label: 'Channel ' + i + ' Transmitter Mute Status' });
			variables.push({ name: 'transmitter_mutebuttonstatus_' + i, label: 'Channel ' + i + ' Transmitter Mute Button Status' });
			variables.push({ name: 'transmitter_powersource_' + i,      label: 'Channel ' + i + ' Transmitter Power Source' });
		}

		variables.push({ name: 'device_id', label: 'Device ID' });

		if (this.model.id == 'ulxd4d' || this.model.id == 'ulxd4q') {
			variables.push({ name: 'audio_summing_mode',       label: 'Audio Summing Mode' });
			variables.push({ name: 'frequency_diversity_mode', label: 'Frequency Diversity Mode' });
		}

		if (this.model.family == 'ulx' || this.model.family == 'ad') {
			variables.push({ name: 'high_density_mode', label: 'High Density Mode' });
		}

		if (this.model.family == 'ad') {
			variables.push({ name: 'model',            label: 'Receiver Model' });
			variables.push({ name: 'quadversity_mode', label: 'Quadversity Mode' });
			variables.push({ name: 'rf_band',          label: 'RF Band' });
		}

		if ( this.model.family != 'mxw') {
			variables.push({ name: 'encryption',       label: 'Encryption' });
			variables.push({ name: 'firmware_version', label: 'Firmware Version' });
		}

		if (this.model.family != 'qlx') {
			variables.push({ name: 'flash_lights', label: 'Flash Lights On/Off' });
		}

		this.setVariableDefinitions(variables);
	}
}