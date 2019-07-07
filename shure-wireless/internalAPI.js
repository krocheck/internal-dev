var debug;
var log;

/**
 * Companion instance API class for Shure Wireless.
 * Utilized to track the state of the receiver and channels.
 *
 * @version 1.0.0
 * @since 1.0.0
 * @author Joseph Adams <josephdadams@gmail.com>
 * @author Keith Rocheck <keith.rocheck@gmail.com>
 */
class instance_api {

	/**
	 * Create an instance of an ATEM module.
	 *
	 * @param {instance} instance - the parent instance
	 * @since 1.0.0
	 */
	constructor(instance) {
		this.instance = instance;

		//qlx-d [FW_VER,DEVICE_ID,ENCRYPTION]
		//ulx-d [FW_VER,DEVICE_ID,ENCRYPTION,AUDIO_SUMMING_MODE,FREQUENCY_DIVERSITY_MODE,HIGH_DENSITY,FLASH]
		//ad    [FW_VER,DEVICE_ID,ENCRYPTION_MODE,MODEL,QUADVERSITY_MODE,RF_BAND,TRANSMISSION_MODE,FLASH]
		//mxw   [DEVICE_ID,FLASH]
		this.receiver  = {
			firmwareVersion:    '',    // (ULX|QLX) 18 | (AD) 24
			deviceId:           '',    // (ULX|QLX) 8 | (AD|MXW) 31
			encryption:         'OFF', // (QLX|AD:ENCRYPTION_MODE) OFF - ON | (ULX) OFF - MANUAL - AUTO
			audioSumming:       'OFF', // (ULXD4D|ULXD4Q only) OFF - 1+2 - 3+4 - 1+2/3+4 - 1+2+3+4
			frequencyDiversity: 'OFF', // (ULXD4D|ULXD4Q only) OFF - 1+2 - 3+4 - 1+2/3+4
			highDensity:        'OFF', // (ULX) OFF - ON | (AD:TRANSMISSION_MODE) STANDARD = OFF - HIGH_DENSITY = ON
			flash:              'OFF', // (ULX|AD|MXW) OFF - ON
			quadversityMode:    'OFF', // (AD) OFF - ON
			model:              '',    // (AD) 32
			rfBand:             ''     // (AD) 8
		};
		this.channels  = [];
	}

	/**
	 * Returns the desired channel state object.
	 *
	 * @param {number} id - the channel to fetch
	 * @returns {Object} the desired channel object
	 * @access public
	 * @since 1.0.0
	 */
	getChannel(id) {

		if (this.channels[id] === undefined) {
			//qlx-d rx [CHAN_NAME,METER_RATE,AUDIO_GAIN,GROUP_CHAN,FREQUENCY,ENCRYPTION_WARNING]
			//ulx-d rx [CHAN_NAME,METER_RATE,AUDIO_GAIN,AUDIO_MUTE,GROUP_CHAN,FREQUENCY,ENCRYPTION_WARNING,RF_INT_DET]
			//ad    rx [CHAN_NAME,METER_RATE,AUDIO_GAIN,AUDIO_MUTE,GROUP_CHANNEL,FREQUENCY,FLASH,ENCRYPTION_STATUS,INTERFERENCE_STATUS,UNREGISTERED_TX_STATUS]
			//         [FD_MODE,GROUP_CHANNEL2,FREQUENCY2,INTERFERENCE_STATUS2]
			//mxw   rx [CHAN_NAME,METER_RATE,AUDIO_GAIN,FLASH]
			//qlx-d tx [TX_TYPE,TX_DEVICE_ID,TX_OFFSET,TX_RF_PWR,TX_MUTE_STATUS,TX_PWR_LOCK,TX_MENU_LOCK,TX_MUTE_BUTTON_STATUS,TX_POWER_SOURCE]
			//         [BATT_BARS,BATT_CHARGE,BATT_CYCLE,BATT_RUN_TIME,BATT_TEMP_F,BATT_TEMP_C,BATT_TYPE]
			//ulx-d tx [TX_TYPE,TX_DEVICE_ID,TX_OFFSET,TX_RF_PWR,TX_MUTE_STATUS,TX_PWR_LOCK,TX_MENU_LOCK,TX_MUTE_BUTTON_STATUS,TX_POWER_SOURCE]
			//         [BATT_BARS,BATT_CHARGE,BATT_CYCLE,BATT_RUN_TIME,BATT_TEMP_F,BATT_TEMP_C,BATT_TYPE]
			//ad    tx [TX_MODEL,TX_DEVICE_ID,TX_OFFSET,TX_INPUT_PAD,TX_POWER_LEVEL,TX_MUTE_MODE_STATUS,TX_POLARITY,TX_LOCK,TX_TALK_SWITCH]
			//         [TX_BATT_BARS,TX_BATT_CHARGE_PERCENT,TX_BATT_CYCLE_COUNT,TX_BATT_HEALTH_PERCENT,TX_BATT_MINS,TX_BATT_TEMP_F,TX_BATT_TEMP_C,TX_BATT_TYPE]
			//mxw   tx [TX_TYPE,TX_AVAILABLE,TX_STATUS,BUTTON_STS,LED_STATUS,BATT_CHARGE,BATT_HEALTH,BATT_RUN_TIME,BATT_TIME_TO_FULL]
			this.channels[id] = {
				slots:                [],        // AD TX Slots
				//rx
				name:                 '',        // (ULX|QLX) 8 | (AD|MXW) 31
				meterRate:            0,         // 0=disabled, 100-99999 [in ms]
				audioGain:            0,         // (ULX|QLX|AD) 0-60,-18dB | (MXW) 0-40,-25dB
				audioMute:            'OFF',     // (ULX|AD) OFF - ON - TOGGLE[set]
				group:                0,         // (ULX|QLX|AD:GROUP_CHANNEL) xx,yy (xx)
				channel:              0,         // (ULX|QLX|AD:GROUP_CHANNEL) xx,yy (yy)
				frequency:            '000.000', // (ULX|QLX|AD) 6, xxx[.]yyy
				flash:                'OFF',     // (AD|MXW) OFF - ON
				encryptionStatus:     'OK',      // (AD) OK - ERROR | (ULX+QLD:ENCRYPTION_WARNING) OFF=OK - ON=ERROR
				interferenceStatus:   'NONE',    // (AD) NONE - DETECTED | (ULX:RF_INT_DET) NONE - CRITICAL=DETECTED
				unregisteredTxStatus: 'OK',      // (AD) OK - ERROR
				fdMode:               'OFF',     // (AD) OFF - FD-C - FD-S
				group2:               0,         // (AD) xx,yy (xx)
				channel2:             0,         // (AD) xx,yy (yy)
				frequency2:           '000.000', // (AD) 6, xxx[.]yyy
				interferenceStatus2:  'NONE',    // (AD) NONE - DETECTED

				//sample
				antennaA:             'OFF',     // (ULX|QLX) OFF - ON=BLUE | (AD) OFF - RED - BLUE
				antennaB:             'OFF',     // (ULX|QLX) OFF - ON=BLUE | (AD) OFF - RED - BLUE
				antennaC:             'OFF',     // (AD:QUADVERITY ON) OFF - RED - BLUE
				antennaD:             'OFF',     // (AD:QUADVERITY ON) OFF - RED - BLUE
				rfLevel:              -120,      // (ULX|QLX) 0-115,-120dBm | (MXW) 0-96?
				audioLevel:           -50,       // (ULX|QLX) 0-50,-50dB | (AD) 0-120,-120dB | (MXW) 0-98,-98dB?
				audioLevelPeak:       -120,      // (AD) 0-120,-120dB
				audioLED:             0,         // (AD) 0-255 binary, 1-7=level, 8=OL
				channelQuality:       255,       // (AD) 0-5,255=UNKN
				adSample:             {},        // (AD) extended sample data

				//tx
				txType:               'Unknown', // (ULX|QLX) QLXD1 - QLXD2 - ULXD1 - ULXD2 - ULXD6 - ULXD8 - UNKN
				                                 // (AD:TX_MODEL) AD1 - AD2 - ADX1 - ADX1M - ADX2 - ADX2FD - UNKNOWN
				                                 // (MXW) MXW1 - MXW2 - MXW6 - MXW8 - UNKNOWN
				txAvailable:          'NO',      // (MXW) YES - NO
				txStatus:             'Unknown', // (MXW) ACTIVE[set] - MUTE[set] - STANDBY[set] - ON_CHARGER - UNKNOWN - OFF[set-only]
				txDeviceId:           '',        // (ULX+QLX:ULXD6/ULXD8 only) 8 | (AD) 31
				txOffset:             255,       // (ULX|QLX) 0,3,6,9,12,15,18,21 255=UNKN | (AD) 0-32,-12 255=UNKN
				txInputPad:           255,       // (AD) 0=ON(-12), 12=OFF(0), 255=UNKN
				txPowerLevel:         255,       // (AD) 0-50mW 255=UNKN | (ULX|QLX:TX_RF_PWR) LOW=1 NORMAL=10 HIGH=20 UNKN=255
				txMuteStatus:         'Unknown', // (ULX|QLX) OFF - ON - UNKN | (AD:TX_MUTE_MODE_STATUS) OFF - MUTE=ON - UNKNOWN
				txPolarity:           'Unknown', // (AD) POSITIVE - NEGATIVE - UNKNOWN
				txPowerLock:          'Unknown', // (ULX|QLX) OFF - ON - UNKN | (AD:TX_LOCK) POWER|BOTH=ON - MENU=OFF - UNKNOWN
				txMenuLock:           'Unknown', // (ULX|QLX) OFF - ON - UNKN | (AD:TX_LOCK) MENU|BOTH=ON - POWER=OFF - UNKNOWN
				txTalkSwitch:         'Unknown', // (ULX+QLX:TX_MUTE_BUTTON_STATUS) PRESSED - RELEASED - UNKN | (AD|MWX:BUTTON_STS) OFF=RELEASED - ON=PRESSED - UNKNOWN
				txPowerSource:        'Unknown', // (ULX|QLX) BATTERY - EXTERNAL - UNKN | (MXW) SEE batteryRuntime
				ledStatusRed:         'Off',     // (MXW) rr gg (rr) ON=On,OF=Off,ST=Strobe,FL=Flash,PU=Pulse,NC=No Change
				ledStatusGreen:       'Off',     // (MXW) rr gg (gg) ON=On,OF=Off,ST=Strobe,FL=Flash,PU=Pulse,NC=No Change
				batteryBars:          255,       // (ULX|QLX|AD:TX_BATT_BARS) 0-5, 255=UNKN
				batteryCharge:        255,       // (ULX|QLX|MXW|AD:TX_BATT_CHARGE_PERCENT) 0-100, 255=UNKN
				batteryCycle:         65535,     // (ULX|QLX|AD:TX_BATT_CYCLE_COUNT) 0+, 65535=UNKN
				batteryHealth:        255,       // (MXW|AD:TX_BATT_HEALTH_PERCENT) 0-100, 255=UNKN
				batteryRuntime:       65535,     // (ULX|QLX) 0+, 65535=UNKN
				                                 // (AD:TX_BATT_MINS) 0+, 65535=UNKN 65534=calcuating 65533=comm warning
				                                 // (MXW) 0+, 65535=UNKN 65534=calcuating 65533=charging 65532=wall power
				batteryTempF:         255,       // (ULX|QLX|AD:TX_BATT_TEMP_F) +40 255=UNKN
				batteryTempC:         255,       // (ULX|QLX|AD:TX_BATT_TEMP_C)  +40 255=UNKN
				batteryType:          'Unknown', // (ULX|QLX|AD:TX_BATT_TYPE) ALKA - LION - LITH - NIMH - UNKN
				batteryTimeToFull:    65535,     // (MXW) 0+, 65535=UNKN (not charging), 65534=charged
			};
		}

		return this.channels[id];
	}

	/**
	 * Returns the receiver state object.
	 *
	 * @returns {Object} the receiver state object
	 * @access public
	 * @since 1.0.0
	 */
	getReceiver() {

		return this.receiver;
	}

	/**
	 * Returns the desired slot state object.
	 *
	 * @param {number} channel - the channel to fetch
	 * @param {number} id - the slot to fetch
	 * @returns {Object} the desired slot object
	 * @access public
	 * @since 1.0.0
	 */
	getSlot(channel, id) {

		if (this.getChannel(channel).slots[id] === undefined) {
			this.getChannel(channel).slots[id] = {
				status:               'EMPTY',   // SLOT_STATUS EMPTY - STANDARD - LINKED.INACTIVE - LINKED.ACTIVE
				showLinkStatus:       255,       // SLOT_SHOWLINK_STATUS 1-5,255=UNKN
				txType:               'Unknown', // SLOT_TX_MODEL AD1 - AD2 - ADX1 - ADX1M - ADX2 - ADX2FD - UNKNOWN
				txDeviceId:           '',        // SLOT_TX_DEVICE_ID 31
				txOffset:             255,       // SLOT_OFFSET 0-32,-12 255=UNKN
				txInputPad:           255,       // SLOT_INPUT_PAD 0=ON(-12), 12=OFF(0), 255=UNKN
				txPowerLevel:         255,       // SLOT_RF_POWER 0-50mW 255=UNKN
				txPowerMode:          'Unknown', // SLOT_RF_POWER_MODE UNKNOWN - LOW - NORMAL - HIGH
				txPolarity:           'Unknown', // SLOT_POLARITY POSITIVE - NEGATIVE - UNKNOWN
				txRfOutput:           'Unknown', // SLOT_RF_OUTPUT UNKNOWN - RF_ON - RF_MUTE
				batteryBars:          255,       // SLOT_BATT_BARS 0-5, 255=UNKN
				batteryCharge:        255,       // SLOT_BATT_CHARGE_PERCENT 0-100, 255=UNKN
				batteryCycle:         65535,     // SLOT_BATT_CYCLE_COUNT 0+, 65535=UNKN
				batteryHealth:        255,       // SLOT_BATT_HEALTH_PERCENT 0-100, 255=UNKN
				batteryRuntime:       65535,     // SLOT_BATT_MINS 0+, 65535=UNKN 65534=calcuating 65533=comm warning
				batteryType:          'Unknown', // SLOT_BATT_TYPE ALKA - LION - LITH - NIMH - UNKN
			};
		}

		return this.getChannel(channel).slots[id];
	}

	/**
	 * Update a channel property.
	 *
	 * @param {number} id - the channel id
	 * @param {String} key - the command id
	 * @param {String} value - the new value
	 * @access public
	 * @since 1.0.0
	 */
	updateChannel(id, key, value) {
		var channel = this.getChannel(id);
		var prefix = 'ch_' + channel + '_';
		var mode = this.instance.model;
		var variable;

		if (value == 'UNKN' || value == 'UNKNOWN') {
			value = 'Unknown';
		}

		if (value == 'CHAN_NAME') {
			this.updateVariable('channel_name_' + commandNum, commandVal.replace('{',''));
			this.actions();
			this.initFeedbacks();
		}
		else if (value == 'METER_RATE') {
			this.updateVariable('meter_rate_' + commandNum, commandVal);
		}
		else if (value == 'AUDIO_GAIN') {
			this.updateVariable('audio_gain_' + commandNum, commandVal);
		}
		else if (value == 'AUDIO_MUTE') {
			this.updateVariable('audio_mute_' + commandNum, commandVal);
			this.checkFeedbacks('channelmuted');
		}
		else if (value == 'AUDIO_LVL') {
			this.updateVariable('audio_lvl_' + commandNum, commandVal);
		}
		else if (value == 'GROUP_CHAN') {
			this.updateVariable('group_channel_' + commandNum, commandVal);
		}
		else if (value == 'FREQUENCY') {
			let frequency = commandVal.substr(0,3) + '.' + commandVal.substr(3,3) + ' MHz';
			this.updateVariable('frequency_' + commandNum, frequency);
		}
		else if (value == 'RF_INT_DET') {
			this.updateVariable('interference_detection_' + commandNum, commandVal);
			this.checkFeedbacks('interferenc_edetection');
		}
		else if (value == 'RX_RF_LVL') {
			this.updateVariable('RX_RF_LVL_' + commandNum, commandVal);
		}
		else if (value == 'RF_ANTENNA') {
			this.updateVariable('RF_ANTENNA_' + commandNum, commandVal);
		}
		else if (value == 'BATT_BARS') {
			this.updateVariable('battery_bars_' + commandNum, commandVal);
			this.checkFeedbacks('battery_level');
			this.checkFeedbacks('transmitter_turned_off');
		}
		else if (value == 'TX_OFFSET') {
			this.updateVariable('transmitter_offset_' + commandNum, commandVal);
		}
		else if (value == 'TX_RF_PWR') {
			this.updateVariable('transmitter_rfpower_' + commandNum, commandVal);
		}
		else if (value == 'TX_TYPE') {
			this.updateVariable('transmitter_type_' + commandNum, commandVal);
			this.checkFeedbacks('transmitter_turned_off');
		}
		else if (value == 'BATT_TYPE') {
			this.updateVariable('battery_type_' + commandNum, commandVal);
		}
		else if (value == 'BATT_RUN_TIME') {
			this.updateVariable('battery_runtime_' + commandNum, commandVal);
		}
		else if (value == 'BATT_CHARGE') {
			this.updateVariable('battery_chargestatus_' + commandNum, commandVal);
		}
		else if (value == 'BATT_CYCLE') {
			this.updateVariable('battery_cycle_' + commandNum, commandVal);
		}
		else if (value == 'BATT_TEMP_C') {
			this.updateVariable('battery_temperature_c_' + commandNum, commandVal);
		}
		else if (value == 'BATT_TEMP_F') {
			this.updateVariable('battery_temperature_f_' + commandNum, commandVal);
		}
		else if (value == 'TX_PWR_LOCK') {
			this.updateVariable('tramsmitter_powerlock_' + commandNum, commandVal);
		}
		else if (value == 'TX_MENU_LOCK') {
			this.updateVariable('transmitter_menulock_' + commandNum, commandVal);
		}
		else if (value == 'ENCRYPTION_WARNING') {
			this.updateVariable('encryption_warning_' + commandNum, commandVal);
		}
		else if (value == 'SLOT_STATUS') {
			slot.status = value;
			this.instance.setVariable(prefix + 'status', value);
		}
		else if (value == 'SLOT_SHOWLINK_STATUS') {
			slot.showLinkStatus = parseInt(value);
			if (value == 255){
				variable = 'Unknown';
			}
			else {
				variable = value;
			}
			this.instance.setVariable(prefix + 'link_status', variable);
		}
		else if (value == 'SLOT_TX_MODEL') {
			slot.txType = value;
			this.instance.setVariable(prefix + 'tx_model', value);
		}
		else if (value == 'SLOT_TX_DEVICE_ID') {
			slot.txDeviceId = value;
			this.instance.setVariable(prefix + 'tx_device_id', value);
		}
		else if (value == 'SLOT_OFFSET') {
			slot.txOffset = parseInt(value);
			if (slot.txOffset == 255){
				variable = 'Unknown';
			}
			else {
				variable = (slot.txOffset - 12).toString() + ' dB';
			}
			this.instance.setVariable(prefix + 'tx_offset', variable);
		}
		else if (value == 'SLOT_INPUT_PAD') {
			slot.txInputPad = parseInt(value);
			if (slot.txInputPad == 255){
				variable = 'Unknown';
			}
			else {
				variable = (slot.txInputPad - 12).toString() + ' dB';
			}
			this.instance.setVariable(prefix + 'tx_input_pad', variable);
		}
		else if (value == 'SLOT_RF_POWER') {
			slot.txPowerLevel = parseInt(value);
			if (slot.txPowerLevel == 255){
				variable = 'Unknown';
			}
			else {
				variable = value + ' mW';
			}
			this.instance.setVariable(prefix + 'tx_rf_power', variable);
		}
		else if (value == 'SLOT_RF_POWER_MODE') {
			slot.txPowerMode = value;
			this.instance.setVariable(prefix + 'tx_power_mode', value);
		}
		else if (value == 'SLOT_POLARITY') {
			slot.txPolarity = value;
			this.instance.setVariable(prefix + 'tx_polarity', value);
		}
		else if (value == 'SLOT_RF_OUTPUT') {
			slot.txRfOutput = value;
			if (value == 'RF_ON') {
				variable = 'ON';
			}
			else if (value == 'RF_MUTE') {
				variable = 'MUTE';
			}
			else {
				variable = value;
			}
			this.instance.setVariable(prefix + 'rf_output', variable);
		}
		else if (value == 'SLOT_BATT_BARS') {
			slot.batteryBars = parseInt(value);
			if (slot.batteryBars == 255){
				variable = 'Unknown';
			}
			else {
				variable = value;
			}
			this.instance.setVariable(prefix + 'battery_bars', variable);
		}
		else if (value == 'SLOT_BATT_CHARGE_PERCENT') {
			slot.batteryCharge = parseInt(value);
			if (slot.batteryCharge == 255){
				variable = 'Unknown';
			}
			else {
				variable = value + '%';
			}
			this.instance.setVariable(prefix + 'battery_charge', variable);
		}
		else if (value == 'SLOT_BATT_CYCLE_COUNT') {
			slot.batteryCycle = parseInt(value);
			if (slot.batteryCycle == 65535){
				variable = 'Unknown';
			}
			else {
				variable = value;
			}
			this.instance.setVariable(prefix + 'battery_cycle', variable);
		}
		else if (value == 'SLOT_BATT_HEALTH_PERCENT') {
			slot.batteryHealth = parseInt(value);
			if (slot.batteryHealth == 255){
				variable = 'Unknown';
			}
			else {
				variable = value + '%';
			}
			this.instance.setVariable(prefix + 'battery_health', variable);
		}
		else if (value == 'SLOT_BATT_MINS') {
			slot.batteryRuntime = parseInt(value);
			if (slot.batteryRuntime == 65535){
				variable = 'Unknown';
			}
			else if (slot.batteryRuntime == 65534) {
				variable = 'Calculating';
			}
			else if (slot.batteryRuntime == 65533) {
				variable = 'Error';
			}
			else {
				let mins = slot.batteryRuntime;
				let h = Math.floor(mins / 60);
				let m = mins % 60;
				m = m < 10 ? '0' + m : m;
				variable = `${h}:${m}`;
			}
			this.instance.setVariable(prefix + 'battery_runtime', variable);
		}
		else if (value == 'SLOT_BATT_TYPE') {
			slot.batteryType = value;
			this.instance.setVariable(prefix + 'battery_type', value);
		}
	}

	/**
	 * Update a receiver property.
	 *
	 * @param {String} key - the command id
	 * @param {String} value - the new value
	 * @access public
	 * @since 1.0.0
	 */
	updateReceiver(key, value) {

		if (value == 'UNKN' || value == 'UNKNOWN') {
			value = 'Unknown';
		}

		if (key == 'FW_VER') {
			this.receiver.firmwareVersion = value;
			this.instance.setVariable('firmware_version', value.replace('{',''));
		}
		else if (key == 'DEVICE_ID') {
			this.receiver.deviceId = value;
			this.instance.setVariable('device_id', value.replace('{',''));
		}
		else if (key == 'FREQUENCY_DIVERSITY_MODE') {
			this.receiver.frequencyDiversity = value;
			this.instance.setVariable('frequency_diversity_mode', value);
		}
		else if (key == 'AUDIO_SUMMING_MODE') {
			this.receiver.audioSumming = value;
			this.instance.setVariable('audio_summing_mode', value);
		}
		else if (key =='HIGH_DENSITY' || id == 'TRANSMISSION_MODE') {

			if (value == 'STANDARD') {
				value = 'OFF';
			}
			else if (value == 'HIGH_DENSITY') {
				value = 'ON';
			}

			this.receiver.highDensity = value;
			this.instance.setVariable('high_density_mode', value);
		}
		else if (key.match(/ENCRYPTION/)) {
			this.receiver.encryption = value;
			this.instance.setVariable('encryption', value);
		}
		else if (key == 'FLASH') {
			this.receiver.flash = value;
			this.instance.setVariable('flash', value);
		}
		else if (key == 'QUADVERSITY_MODE') {
			this.receiver.quadversityMode = value;
			this.instance.setVariable('quadversity_mode', value);
		}
		else if (key == 'MODEL') {
			this.receiver.model = value;
			this.instance.setVariable('model', value);
		}
		else if (key == 'RF_BAND') {
			this.receiver.rfBand = value;
			this.instance.setVariable('rf_band', value);
		}
	}

	/**
	 * Update a slot property.
	 *
	 * @param {number} channel - the channel id
	 * @param {number} id - the slot id
	 * @param {String} key - the command id
	 * @param {String} value - the new value
	 * @access public
	 * @since 1.0.0
	 */
	updateSlot(channel, id, key, value) {
		var slot = this.getSlot(channel, id);
		var prefix = 'ch_' + channel + '_slot_' + id + '_';
		var variable;

		if (value == 'UNKN' || value == 'UNKNOWN') {
			value = 'Unknown';
		}

		switch(key) {
			case 'SLOT_STATUS':
				slot.status = value;
				this.instance.setVariable(prefix + 'status', value);
				break;
			case 'SLOT_SHOWLINK_STATUS':
				slot.showLinkStatus = parseInt(value);
				if (value == 255){
					variable = 'Unknown';
				}
				else {
					variable = value;
				}
				this.instance.setVariable(prefix + 'link_status', variable);
				break;
			case 'SLOT_TX_MODEL':
				slot.txType = value;
				this.instance.setVariable(prefix + 'tx_model', value);
				break;
			case 'SLOT_TX_DEVICE_ID':
				slot.txDeviceId = value;
				this.instance.setVariable(prefix + 'tx_device_id', value);
				break;
			case 'SLOT_OFFSET':
				slot.txOffset = parseInt(value);
				if (slot.txOffset == 255){
					variable = 'Unknown';
				}
				else {
					variable = (slot.txOffset - 12).toString() + ' dB';
				}
				this.instance.setVariable(prefix + 'tx_offset', variable);
				break;
			case 'SLOT_INPUT_PAD':
				slot.txInputPad = parseInt(value);
				if (slot.txInputPad == 255){
					variable = 'Unknown';
				}
				else {
					variable = (slot.txInputPad - 12).toString() + ' dB';
				}
				this.instance.setVariable(prefix + 'tx_input_pad', variable);
				break;
			case 'SLOT_RF_POWER':
				slot.txPowerLevel = parseInt(value);
				if (slot.txPowerLevel == 255){
					variable = 'Unknown';
				}
				else {
					variable = value + ' mW';
				}
				this.instance.setVariable(prefix + 'tx_rf_power', variable);
				break;
			case 'SLOT_RF_POWER_MODE':
				slot.txPowerMode = value;
				this.instance.setVariable(prefix + 'tx_power_mode', value);
				break;
			case 'SLOT_POLARITY':
				slot.txPolarity = value;
				this.instance.setVariable(prefix + 'tx_polarity', value);
				break;
			case 'SLOT_RF_OUTPUT':
				slot.txRfOutput = value;
				if (value == 'RF_ON') {
					variable = 'ON';
				}
				else if (value == 'RF_MUTE') {
					variable = 'MUTE';
				}
				else {
					variable = value;
				}
				this.instance.setVariable(prefix + 'rf_output', variable);
				break;
			case 'SLOT_BATT_BARS':
				slot.batteryBars = parseInt(value);
				if (slot.batteryBars == 255){
					variable = 'Unknown';
				}
				else {
					variable = value;
				}
				this.instance.setVariable(prefix + 'battery_bars', variable);
				break;
			case 'SLOT_BATT_CHARGE_PERCENT':
				slot.batteryCharge = parseInt(value);
				if (slot.batteryCharge == 255){
					variable = 'Unknown';
				}
				else {
					variable = value + '%';
				}
				this.instance.setVariable(prefix + 'battery_charge', variable);
				break;
			case 'SLOT_BATT_CYCLE_COUNT':
				slot.batteryCycle = parseInt(value);
				if (slot.batteryCycle == 65535){
					variable = 'Unknown';
				}
				else {
					variable = value;
				}
				this.instance.setVariable(prefix + 'battery_cycle', variable);
				break;
			case 'SLOT_BATT_HEALTH_PERCENT':
				slot.batteryHealth = parseInt(value);
				if (slot.batteryHealth == 255){
					variable = 'Unknown';
				}
				else {
					variable = value + '%';
				}
				this.instance.setVariable(prefix + 'battery_health', variable);
				break;
			case 'SLOT_BATT_MINS':
				slot.batteryRuntime = parseInt(value);
				if (slot.batteryRuntime == 65535){
					variable = 'Unknown';
				}
				else if (slot.batteryRuntime == 65534) {
					variable = 'Calculating';
				}
				else if (slot.batteryRuntime == 65533) {
					variable = 'Error';
				}
				else {
					let mins = slot.batteryRuntime;
					let h = Math.floor(mins / 60);
					let m = mins % 60;
					m = m < 10 ? '0' + m : m;
					variable = `${h}:${m}`;
				}
				this.instance.setVariable(prefix + 'battery_runtime', variable);
				break;
			case 'SLOT_BATT_TYPE':
				slot.batteryType = value;
				this.instance.setVariable(prefix + 'battery_type', value);
				break;
		}
	}
}

exports = module.exports = instance_api;