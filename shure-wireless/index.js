var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');

var debug;
var log;

/**
 * Companion instance class for the Shure Wireless Microphones.
 *
 * @extends instance_skel
 * @version 1.0.0
 * @since 1.0.0
 * @author Joseph Adams <josephdadams@gmail.com>
 * @author Keith Rocheck <keith.rocheck@gmail.com>
 */
class instance extends instance_skel {

	/**
	 * Create an instance of a shure WX module.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @param {string} id - the instance ID
	 * @param {Object} config - saved user configuration parameters
	 * @since 1.0.0
	 */
	constructor(system, id, config) {
		super(system, id, config);

		this.model       = {};
		this.deviceName  = '';
		this.initDone    = false;

		let instance_api   = require('./internalAPI');
		let actions        = require('./actions');
		let feedback       = require('./feedback');
		let variables      = require('./variables');

		Object.assign(this, {
			...actions,
			...feedback,
			...variables
		});

		this.api   = new instance_api(this);

		this.CONFIG_MODEL = {
			ulxd4:   {id: 'ulxd4',   family: 'ulx', label: 'ULXD4 Single Receiver', channels: 1, slots: 0},
			ulxd4d:  {id: 'ulxd4d',  family: 'ulx', label: 'ULXD4D Dual Receiver',  channels: 2, slots: 0},
			ulxd4q:  {id: 'ulxd4q',  family: 'ulx', label: 'ULXD4Q Quad Receiver',  channels: 4, slots: 0},
			qlxd4:   {id: 'qlxd4',   family: 'qlx', label: 'QLXD4 Single Receiver', channels: 1, slots: 0},
			ad4d:    {id: 'ad4d',    family: 'ad',  label: 'AD4D Dual Receiver',    channels: 2, slots: 8},
			ad4q:    {id: 'ad4q',    family: 'ad',  label: 'AD4Q Quad Receiver',    channels: 4, slots: 8},
			mxwani4: {id: 'mxwani4', family: 'mxw', label: 'MXWANI4 Quad Receiver', channels: 4, slots: 0},
			mxwani8: {id: 'mxwani8', family: 'mxw', label: 'MXWANI8 Octo Receiver', channels: 8, slots: 0},
			slxd4:   {id: 'slxd4',   family: 'slx', label: 'SLXD4 Single Receiver', channels: 1, slots: 0},
			slxd4d:  {id: 'slxd4d',  family: 'slx', label: 'SLXD4D Dual Receiver',  channels: 2, slots: 0}  
		};

		this.CHOICES_CHANNELS   = [];
		this.CHOICES_CHANNELS_A = [];
		this.CHOICES_SLOTS      = [];
		this.CHOICES_SLOTS_A    = [];

		this.CHOICES_MODEL = Object.values(this.CONFIG_MODEL);
		// Sort alphabetical
		this.CHOICES_MODEL.sort(function(a, b){
			var x = a.label.toLowerCase();
			var y = b.label.toLowerCase();
			if (x < y) {return -1;}
			if (x > y) {return 1;}
			return 0;
		});

		if (this.config.modelID !== undefined){
			this.model = this.CONFIG_MODEL[this.config.modelID];
		}
		else {
			this.config.modelID = 'ulxd4';
			this.model = this.CONFIG_MODEL['ulxd4'];
		}

		this.setupFields();

		this.actions(); // export actions
	}

	/**
	 * Setup the actions.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @access public
	 * @since 1.0.0
	 */
	actions(system) {

		this.setupChannelChoices();
		this.setActions(this.getActions());
	}

	/**
	 * Executes the provided action.
	 *
	 * @param {Object} action - the action to be executed
	 * @access public
	 * @since 1.0.0
	 */
	action(action) {
		let options = action.options;
		let cmd;
		let slot, value;

		switch (action.action) {
			case 'set_channel_name':
				cmd = 'SET ' + options.channel + ' CHAN_NAME {' + options.name.substr(0,8) + '}';
				break;
			case 'channel_mute':
				cmd = 'SET ' + options.channel + ' AUDIO_MUTE ' + options.choice;
				break;
			case 'channel_setaudiogain':
				value = options.gain;
				if (this.model.family == 'mxw') {
					value += 25;
				}
				else {
					value += 18;
				}
				cmd = 'SET ' + options.channel + ' AUDIO_GAIN ' + value;
				break;
			case 'channel_increasegain':
				cmd = 'SET ' + options.channel + ' AUDIO_GAIN INC ' + options.gain;
				break;
			case 'channel_decreasegain':
				cmd = 'SET ' + options.channel + ' AUDIO_GAIN DEC ' + options.gain;
				break;
			case 'channel_frequency':
				cmd = 'SET ' + options.channel + ' FREQUENCY ' + options.value.replace('.','');
				break;
			case 'flash_lights':
				cmd = 'SET FLASH ON';
				break;
			case 'flash_channel':
				cmd = 'SET ' + options.channel + ' FLASH ON';
				break;
			case 'slot_rf_output':
				slot = options.slot.split(':');
				cmd = 'SET ' + slot[0] + ' SLOT_RF_OUTPUT ' + slot[1] + ' ' + options.onoff;
				break;
			case 'slot_rf_power':
				slot = options.slot.split(':');
				cmd = 'SET ' + slot[0] + ' SLOT_RF_POWER ' + slot[1] + ' ' + options.power;
				break;
		}

		if (cmd !== undefined) {
			if (this.socket !== undefined && this.socket.connected) {
				this.socket.send('< ' + cmd + ' >');
			} else {
				debug('Socket not connected :(');
			}
		}
	}

	/**
	 * Creates the configuration fields for web config.
	 *
	 * @returns {Array} the config fields
	 * @access public
	 * @since 1.0.0
	 */
	config_fields() {

		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 6,
				regex: this.REGEX_IP
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target Port',
				default: 2202,
				width: 2,
				regex: this.REGEX_PORT
			},
			{
				type: 'dropdown',
				id: 'modelID',
				label: 'Model Type',
				choices: this.CHOICES_MODEL,
				width: 6,
				default: 'ulxd4'
			},
			{
				type: 'checkbox',
				id: 'meteringOn',
				label: 'Enable Metering?',
				width: 2,
				default: true
			},
			{
				type: 'number',
				id: 'meteringInterval',
				label: 'Metering Interval (in ms)',
				width: 4,
				min: 500,
				max: 99999,
				default: 5000,
				required: true
			}
		]
	}

	/**
	 * Clean up the instance before it is destroyed.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	destroy() {
		if (this.socket !== undefined) {
			this.socket.destroy();
		}

		this.debug("destroy", this.id);
	}

	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	init() {
		debug = this.debug;
		log = this.log;

		this.status(this.STATUS_WARNING, 'Connecting');

		this.initVariables();
		this.initFeedbacks();
		this.checkFeedbacks('sample');

		this.initTCP();
	}

	/**
	 * INTERNAL: use setup data to initalize the tcp socket object.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initTCP() {
		var receivebuffer = '';

		if (this.socket !== undefined) {
			this.socket.destroy();
			delete this.socket;
		}

		if (this.config.port === undefined) {
			this.config.port = 2202;
		}

		if (this.config.host) {
			this.socket = new tcp(this.config.host, this.config.port);

			this.socket.on('status_change', (status, message) => {
				this.status(status, message);
			});

			this.socket.on('error', (err) => {
				this.debug("Network error", err);
				this.log('error',"Network error: " + err.message);
			});

			this.socket.on('connect', () => {
				this.debug("Connected");
				let cmd = '< GET 0 ALL >';
				this.socket.send(cmd);

				if (this.config.meteringOn === true) {
					cmd = '< SET 0 METER_RATE ' + this.config.meteringInterval + ' >';
					this.socket.send(cmd);
				}

				this.actions(); // export actions
			});

			// separate buffered stream into lines with responses
			this.socket.on('data', (chunk) => {
				var i = 0, line = '', offset = 0;
				receivebuffer += chunk;

				while ( (i = receivebuffer.indexOf('>', offset)) !== -1) {
					line = receivebuffer.substr(offset, i - offset);
					offset = i + 1;
					this.socket.emit('receiveline', line.toString());
				}

				receivebuffer = receivebuffer.substr(offset);
			});

			this.socket.on('receiveline', (line) => {
				this.processShureCommand(line.replace('< ','').trim());
			});
		}
	}

	/**
	 * INTERNAL: Routes incoming data to the appropriate function for processing.
	 *
	 * @param {string} command - the command/data type being passed
	 * @access protected
	 * @since 1.0.0
	 */
	processShureCommand(command) {

		if ( ( typeof command === 'string' || command instanceof String ) && command.length > 0 ) {

			let commandArr = command.split(' ');
			let commandType = commandArr.shift();
			let commandNum = parseInt( commandArr[0] );

			let joinData = function(commands, start) {
				let out = '';
				if (commands.length > 0) {
					for (let i = start; i < commands.length; i++) {
						out += commands[i] + ' ';
					}
				}
				return out.trim();
			}

			if (commandType == 'REP') {
				//this is a report command

				if ( isNaN(commandNum) && commandArr[0] != 'PRI' && commandArr[0] != 'SEC' ) {
					//this command isn't about a specific channel
					this.api.updateReceiver(commandArr[0], joinData(commandArr, 1));
				}
				else if (commandArr[1].startsWith('SLOT')) {
					//this command is about a specific SLOT in AD
					this.api.updateSlot(commandNum, parseInt(commandArr[2]), commandArr[1], joinData(commandArr, 3));
				}
				else if (commandArr[0] == 'PRI' || commandArr[0] == 'SEC') {
					//ignore pri/sec commands in MXW
				}
				else if (commandArr[1] == 'LED_STATUS') {
					//this command is led status for a MXW channel
					this.api.updateChannel(commandNum, commandArr[1], commandArr[2]+','+commandArr[3]);
				}
				else {
					//this command is about a specific channel
					this.api.updateChannel(commandNum, commandArr[1], joinData(commandArr, 2));
				}
			}
			else if (commandType == 'SAMPLE') {
				//this is a sample command

				switch(this.model.family) {
					case 'ulx':
					case 'qlx':
						this.api.parseULXSample(commandNum, command);
						break;
					case 'ad':
						this.api.parseADSample(commandNum, command);
						break;
					case 'mxw':
						this.api.parseMXWSample(commandNum, command);
						break;
					case 'slx':
						this.api.parseSLXSample(commandNum, command);
						break;
				}

				this.checkFeedbacks('sample');
			}
		}
	}

	/**
	 * INTERNAL: use model data to define the channel and slot choicess.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	setupChannelChoices() {

		this.CHOICES_CHANNELS   = [];
		this.CHOICES_CHANNELS_A = [];
		this.CHOICES_SLOTS      = [];
		this.CHOICES_SLOTS_A    = [];

		if (this.model.channels > 1) {
			this.CHOICES_CHANNELS_A.push({ id: '0', label: 'All Channels' });
		}

		if (this.model.slots > 0) {
			this.CHOICES_SLOTS_A.push({ id: '0:0', label: 'All Channels & Slots' });
		}

		for (var i = 1; i <= this.model.channels; i++) {
			var data = 'Channel ' + i;

			if ( this.api.getChannel(i).name != '' ) {
				data += ' (' + this.api.getChannel(i).name + ')';
			}

			this.CHOICES_CHANNELS.push({ id: i, label: data });
			this.CHOICES_CHANNELS_A.push({ id: i, label: data });

			if (this.model.slots > 0) {
				this.CHOICES_SLOTS_A.push({ id: `${i}:0`, label: data + ', All Slots' });

				for (var j = 1; j <= this.model.slots; j++) {
					let id = `${i}:${j}`;
					data = id;

					if ( this.api.getSlot(i,j).txDeviceId != '' ) {
						data += ' (' + this.api.getSlot(i,j).txDeviceId + ')';
					}

					this.CHOICES_SLOTS.push({ id: id, label: data });
					this.CHOICES_SLOTS_A.push({ id: id, label: data });
				}
			}
		}

		this.CHANNELS_FIELD.choices   = this.CHOICES_CHANNELS;
		this.CHANNELS_A_FIELD.choices = this.CHOICES_CHANNELS_A;
		this.SLOTS_FIELD.choices      = this.CHOICES_SLOTS;
		this.SLOTS_A_FIELD.choices    = this.CHOICES_SLOTS_A;
	}

	/**
	 * Set up the fields used in actions and feedbacks
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	setupFields() {
		this.BG_COLOR_FIELD = function(defaultColor) {
			return {
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: defaultColor
			};
		};
		this.FG_COLOR_FIELD = function(defaultColor) {
			return {
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: defaultColor
			};
		};
		this.BATTERY_LEVEL_FIELD = {
			type: 'number',
			label: 'Battery Alert Level',
			id: 'barlevel',
			min: 1,
			max: 5,
			default: 2,
			required: true,
			range: true
		};
		this.CHANNELS_FIELD = {
			type: 'dropdown',
			label: 'Channel',
			id: 'channel',
			default: '1',
			choices: this.CHOICES_CHANNELS
		};
		this.CHANNELS_A_FIELD = {
			type: 'dropdown',
			label: 'Channel',
			id: 'channel',
			default: '1',
			choices: this.CHOICES_CHANNELS_A
		};
		this.FREQUENCY_FIELD = {
			type: 'textinput',
			label: 'Frequency (MHz)',
			id: 'value',
			default: '470.000',
			regex: '/^(4[7-9][0-9]|[5-8][0-9]{2}|9[0-2][0-9]|93[0-7])\\.\\d(00|25|50|75)$/'
		};
		this.GAIN_INC_FIELD = function(family) {
			return {
				type: 'number',
				label: 'Gain Value (dB)',
				id: 'gain',
				min: 1,
				max: (family == 'mxw' ? 40 : 60),
				default: 3,
				required: true,
				range: true
			};
		};
		this.GAIN_SET_FIELD = function(family) {
			return {
				type: 'number',
				label: 'Gain Value (dB)',
				id: 'gain',
				min: (family == 'mxw' ? -25 : -18),
				max: (family == 'mxw' ? 15 : 42),
				default: 0,
				required: true,
				range: true
			};
		};
		this.MUTE_FIELD = {
			type: 'dropdown',
			label: 'Mute/Unmute/Toggle',
			id: 'choice',
			default: 'ON',
			choices: [
				{id: 'ON',     label: 'Mute'},
				{id: 'OFF',    label: 'Unmute'},
				{id: 'TOGGLE', label: 'Toggle Mute/Unmute'}
			]
		};
		this.NAME_FIELD = {
			type: 'textinput',
			label: 'Name (8 characters max)',
			id: 'name',
			default: '',
			regex: '/^.{1,8}$/'
		};
		this.RFOUTPUT_FIELD = {
			type: 'dropdown',
			label: 'On/Off',
			id: 'onoff',
			default: 'RF_ON',
			choices: [
				{id: 'RF_ON',   label: 'RF On'},
				{id: 'RF_MUTE', label: 'RF Mute'}
			]
		};
		this.RFPOWER_FIELD = {
			type: 'dropdown',
			label: 'Power Level',
			id: 'power',
			default: '10',
			choices: [
				{id: '2',  label: '2 mW'},
				{id: '10', label: '10 mW'},
				{id: '20', label: '20 mW'},
				{id: '35', label: '35 mW'},
				{id: '40', label: '40 mW'},
				{id: '50', label: '50 mW'}
			]
		};
		this.SLOTS_FIELD = {
			type: 'dropdown',
			label: 'Slot Number',
			id: 'slot',
			default: '1:1',
			choices: this.CHOICES_SLOTS
		};
		this.SLOTS_A_FIELD = {
			type: 'dropdown',
			label: 'Slot Number',
			id: 'slot',
			default: '1:1',
			choices: this.CHOICES_SLOTS_A
		};
		this.SLOT_STATUS_FIELD = {
			type: 'dropdown',
			label: 'Status',
			id: 'value',
			default: 'LINKED.ACTIVE',
			choices: [
				{id: 'EMPTY',           label: 'Empty'},
				{id: 'STANDARD',        label: 'Standard'},
				{id: 'LINKED.INACTIVE', label: 'Linked - Inactive'},
				{id: 'LINKED.ACTIVE',   label: 'Linked - Active'}
			]
		};
	}

	/**
	 * Process an updated configuration array.
	 *
	 * @param {Object} config - the new configuration
	 * @access public
	 * @since 1.0.0
	 */
	updateConfig(config) {
		var resetConnection = false;
		var cmd;

		if (this.config.host != config.host)
		{
			resetConnection = true;
		}

		if (this.config.meteringOn !== config.meteringOn) {

			if (config.meteringOn === true) {
				cmd = '< SET 0 METER_RATE ' + this.config.meteringInterval + ' >';
			}
			else {
				cmd = '< SET 0 METER_RATE 0 >';
			}
		}
		else if (this.config.meteringRate != config.meteringRate && this.config.meteringOn === true) {
			cmd = '< SET 0 METER_RATE ' + config.meteringInterval + ' >';
		}

		this.config = config;

		if (this.CONFIG_MODEL[this.config.modelID] !== undefined) {
			this.model = this.CONFIG_MODEL[this.config.modelID];
		}
		else {
			this.debug('Shure Model: ' + this.config.modelID + 'NOT FOUND');
		}

		this.actions();
		this.initFeedbacks();
		this.initVariables();

		if (resetConnection === true || this.socket === undefined) {
			this.initTCP();
		}
		else if (cmd !== undefined) {
			this.socket.send(cmd);
		}
	}
}

exports = module.exports = instance;