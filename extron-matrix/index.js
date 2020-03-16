var TelnetSocket = require('../../telnet');
var instance_skel = require('../../instance_skel');

var actions       = require('./actions');
var feedback      = require('./feedback');
var internalAPI   = require('./internalAPI');
var presets       = require('./presets');
var setup         = require('./setup');
var upgrades      = require('./upgrades');
var variables     = require('./variables');
var debug;
var log;

/**
 * Companion instance class for Extron matrix frames.
 *
 * @extends instance_skel
 * @version 1.0.0
 * @since 1.0.0
 * @author Keith Rocheck <keith.rocheck@gmail.com>
 * @author Nigel Brown <eventreplay@outlook.com>
 * @author Jeffrey Davidsz <jeffrey.davidsz@vicreo.eu>
 */
class instance extends instance_skel {

	/**
	 * Create an instance of an Extron matrix module.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @param {string} id - the instance ID
	 * @param {Object} config - saved user configuration parameters
	 * @since 1.0.0
	 */
	constructor(system,id,config) {
		super(system,id,config);

		Object.assign(this, {
			...actions,
			...feedback,
			...internalAPI,
			...presets,
			...setup,
			...upgrades,
			...variables
		});

		this.addUpgradeScripts();

		this.loggedIn     = false;
		this.synced       = false;
		this.selected     = 0;
		this.deviceName   = '';
		this.version      = '';
		this.model        = '';
		this.queue        = '';
		this.queuedDest   = -1;
		this.queuedSource = -1;

		this.heartbeatInterval = null;

		this.inputs  = {};
		this.outputs = {};
		this.presets = {};
		this.rooms   = {};

		this.CHOICES_INPUTS  = [];
		this.CHOICES_OUTPUTS = [];
		this.CHOICES_PRESETS = [];
		this.CHOICES_ROOMS   = [];

		this.CHOICES_MODEL = Object.values(this.CONFIG_MODEL);

		if (this.config.modelID !== undefined){
			this.model = this.CONFIG_MODEL[this.config.modelID];
		}
		else {
			this.config.modelID = 'generic';
			this.model = this.CONFIG_MODEL['generic'];
		}

		if (config.inputCount === undefined) {
			config.inputCount = this.model.inputs;
		}
		this.inputCount = parseInt(config.inputCount);

		if (config.outputCount === undefined) {
			config.outputCount = this.model.outputs;
		}
		this.outputCount = parseInt(config.outputCount);

		if (config.presetCount === undefined) {
			config.presetCount = this.model.globalPresets;
		}
		this.presetCount = parseInt(config.presetCount);

		if (config.roomCounts === undefined) {
			config.roomCounts = this.model.rooms;
		}
		this.roomCount = parseInt(config.roomCounts);


		this.actions();
	}

	/**
	 * Setup the actions.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @access public
	 * @since 1.0.0
	 */
	actions(system) {

		this.setupChoices();
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
		let opt = action.options;
		let cmd = '';

		switch (action.action) {
			case 'route':
				cmd = opt.input +'*'+ opt.output + opt.type;
				break;
			case 'route_all':
				cmd = opt.input +'*'+ opt.type;
				break;
			case 'recall_global':
				cmd = opt.preset +'.';
				break;
			case 'save_global':
				cmd = opt.preset +',';
				break;
			case 'rename_input':
				cmd = `\x1B${opt.input},${opt.label}NI\r`;
				break;
			case 'rename_output':
				cmd = `\x1B${opt.output},${opt.label}NO\r`;
				break;
			case 'rename_preset':
				cmd = `\x1B${opt.preset},${opt.label}NG\r`;
				break;
			case 'rename_room':
				cmd = `\x1B${opt.room},${opt.label}NR\r`;
				break;
			case 'select_output':
				this.selected = opt.output;
				this.checkFeedbacks('selected_output');
				this.checkFeedbacks('take_tally_input');
				break;
			case 'route_input':
				if (this.config.take === true) {
					this.queue = `${opt.input}*${opt.output}!`;
					this.queuedDest = this.selected;
					this.queuedSource = opt.input;
					this.checkFeedbacks('take');
					this.checkFeedbacks('take_tally_input');
					this.checkFeedbacks('take_tally_output');
					this.checkFeedbacks('take_tally_route');
				}
				else {
					cmd = `${opt.input}*${opt.output}!`;
				}
				break;
			case 'take':
				cmd = this.queue; //intentional fall-though
			case 'clear':
				this.queue = '';
				this.queuedDest = -1;
				this.queuedSource = -1;
				this.checkFeedbacks('take');
				this.checkFeedbacks('take_tally_input');
				this.checkFeedbacks('take_tally_output');
				this.checkFeedbacks('take_tally_route');
				break;
		}

		if (cmd !== undefined && cmd != '') {

			if (this.socket !== undefined && this.socket.connected) {
				this.socket.send(cmd);
			}
			else {
				this.debug('Socket not connected :(');
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
				type:  'text',
				id:    'info',
				width: 12,
				label: 'Information',
				value: 'This will establish a telnet connection to the Extron matrix'
			},
			{
				type:    'dropdown',
				id:      'modelID',
				label:   'Model',
				width:   6,
				choices: this.CHOICES_MODEL,
				default: 'generic'
			},
			{
				type:  'textinput',
				id:    'host',
				label: 'Target IP',
				width: 6,
				regex: this.REGEX_IP
			},
			{
				type:  'textinput',
				id:    'password',
				label: 'Admin/User Password',
				width: 6
			},
			{
				type:    'checkbox',
				id:      'take',
				label:   'Enable Take? (XY only)',
				width:   6,
				default: false,
			},
			{
				type:  'text',
				id:    'info',
				width: 12,
				label: 'Information',
				value: 'This module will automatically issue a command on a given interval to keep its connection alive.  The default is every 60 seconds, but this can be modified if needed below.'
			},
			{
				type:     'number',
				id:       'beatPeriod',
				label:    'Heartbeat Interval (seconds)',
				default:  60,
				width:    6,
				min:      5,
				max:      3600,
				required: true,
				range:    false
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

		if (this.heartbeatInterval !== undefined) {
			clearInterval(this.heartbeatInterval);
		}

		if (this.socket !== undefined) {
			this.socket.destroy();
		}

		this.debug("destroy", this.id);;
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

		this.initVariables();
		this.initFeedbacks();
		this.initPresets();
		this.checkFeedbacks('selected_output');
		this.checkFeedbacks('selected_input');

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

			this.loggedIn = false;
			this.synced = false;
		}

		if (this.config.host) {
			this.socket = new TelnetSocket(this.config.host, 23);

			this.socket.on('status_change', function (status, message) {
				if (status !== this.STATUS_OK) {
					this.status(status, message);
				}
			});

			this.socket.on('error', function (err) {
				this.debug("Network error", err);
				this.log('error',"Network error: " + err.message);
				this.loggedIn = false;
				this.synced = false;
			});

			this.socket.on('connect', function () {
				this.debug("Connected");
				this.loggedIn = false;
				this.synced = false;
			});

			this.socket.on('disconnect', () => {
				this.debug("Disconnected");
				this.loggedIn = false;
				this.synced = false;

				if (this.heartbeatInterval !== undefined) {
					clearInterval(this.heartbeatInterval);
				}
			});

			// separate buffered stream into lines with responses
			this.socket.on('data', (chunk) => {
				var i = 0, line = '', offset = 0;
				receivebuffer += chunk;

				// Process lines
				while ( (i = receivebuffer.indexOf('\r\n', offset)) !== -1) {
					line = receivebuffer.substr(offset, i - offset);
					offset = i + 1;
					this.socket.emit('receiveline', line.toString("utf8"));
				}

				receivebuffer = receivebuffer.substr(offset);

				// Read current line
				if (receivebuffer.match(/[P|p]assword:/)) {
					this.loggedIn = false;
					this.synced = false;
					receivebuffer = '';
					this.socket.write(this.config.password + '\r');
				}
			});

			this.socket.on('receiveline', (line) => {

				if (this.loggedIn == false) {
					this.processLogin(line);
				}
				else {
					this.processInformation(line);
				}
			});

			this.socket.on("iac", function(type, info) {
				// tell remote we WONT do anything we're asked to DO
				if (type == 'DO') {
					this.socket.write(new Buffer([ 255, 252, info ]));
				}

				// tell the remote DONT do whatever they WILL offer
				if (type == 'WILL') {
					this.socket.write(new Buffer([ 255, 254, info ]));
				}
			});
		}
	}

	/**
	 * INTERNAL: Routes incoming data to the appropriate function for processing.
	 *
	 * @param {String} data - the collected data
	 * @access protected
	 * @since 1.0.0
	 */
	processInformation(data) {

		if (data.match(/60-/)) {
			this.loggedIn = true;
			this.status(this.STATUS_OK);
		}
		else if (data.match(/Sts/)) {
			this.synced = true;
			this.actions();
			this.initFeedbacks();
			this.initPresets();
		}
		else if (data.match(/Info/)) {
			//generic matrix size here
		}
		else if (data.match(/[V|A]mt/)) {
			//mutes
		}
		else if (data.match(/Out/)) {
			this.updateRoute(data.substring(0,2), data);
			this.checkFeedbacks('input_bg');
			this.checkFeedbacks('selected_input');
		}
		else if (data.match(/In/)) {
			//route all
		}
		else if (data.match(/Nm[i|o|g|r]/)) {
			this.updateLabel(data.substring(0,2), data);

			if (this.synced) {
				this.actions();
				this.initFeedbacks();
				this.initPresets();
			}
		}
	}

	/**
	 * INTERNAL: Processes data from telnet pre-login.
	 *
	 * @param {Object} data - the collected data
	 * @access protected
	 * @since 1.0.0
	 */
	processLogin(data) {

		if (data.match(/Login/)) {
			let info = data.split(" ");
			this.loggedIn = true;
			this.status(this.STATUS_OK);

			this.heartbeatInterval = setInterval(
				this.sendHeartbeatCommand.bind(this),
				(this.config.heartbeatInterval*1000)
			);

			this.socket.write("\\x1B3CVI\n"); // Set verbose mode and tagged responses
			this.socket.write("I\n"); // Matrix information request
			this.syncStates();
		}
		else if (data.match(/Extron Electronics/)) {
			this.updateDevice(data);
			this.status(this.STATUS_WARNING,'Logging in');
		}
	}

	/**
	 * INTERNAL: Send a heartbeat command to refresh status
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	sendHeartbeatCommand() {
		this.socket.write("N\n");
	}

	/**
	 * INTERNAL: Fires a bunch of setup and cleanup when we switch models.
	 *
	 * @param {number} modelID - the new model
	 * @access protected
	 * @since 1.0.0
	 */
	setModel(modelID) {

		if (this.CONFIG_MODEL[modelID] !== undefined) {

			this.model = this.CONFIG_MODEL[modelID];

			this.config.modelID = modelID;

			this.inputCount  = this.config.inputCount  = this.model.inputs;
			this.outputCount = this.config.outputCount = this.model.outputs;
			this.presetCount = this.config.presetCount = this.model.globalPresets;
			this.roomCount   = this.config.roomCount   = this.model.rooms;

			this.NAME_FIELD.regex = '/^[A-Za-z0-9_\\-\\s]{1,' + this.model.nameLen + '}*$/';

			this.saveConfig();

			this.actions();
			this.initVariables();
			this.initFeedbacks();
			this.initPresets();
		}
		else {
			this.debug('Extron Model: ' + modelID + 'NOT FOUND');
		}
	}

	/**
	 * INTERNAL: use model data to define the choices for the dropdowns.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	setupChoices() {

		this.CHOICES_INPUTS  = [];
		this.CHOICES_OUTPUTS = [];
		this.CHOICES_PRESETS = [];
		this.CHOICES_ROOMS   = [];

		if (this.model.audio === true) {
			this.CHOICES_LAYER: [
				{ label: 'Video & Audio', id: '!' },
				{ label: 'Video only', id: '%' },
				{ label: 'Audio only', id: '$'}
			];
		}
		else {
			this.CHOICES_LAYER: [
				{ label: 'Video & Audio', id: '!' }
			];
		}

		if (this.inputCount > 0) {
			for(var key = 1; key <= this.inputCount; key++) {
				if (this.getInput(key).status != 'None') {
					this.CHOICES_INPUTS.push( { id: key, label: this.getInput(key).label } );
				}
			}
		}

		if (this.outputCount > 0) {
			for(var key = 1; key <= this.outputCount; key++) {
				if (this.getOutput(key).status != 'None') {
					this.CHOICES_OUTPUTS.push( { id: key, label: this.getOutput(key).label } );
				}
			}
		}

		if (this.presetCount > 0) {
			for(var key = 1; key <= this.presetCount; key++) {
				if (this.getPreset(key).status != 'None') {
					this.CHOICES_PRESETS.push( { id: key, label: this.getPreset(key).label } );
				}
			}
		}

		if (this.roomCount > 0) {
			for(var key = 1; key <= this.roomCount; key++) {
				if (this.getRoom(key).status != 'None') {
					this.CHOICES_PRESETS.push( { id: key, label: this.getRoom(key).label } );
				}
			}
		}
	}

	/**
	 * INTERNAL: send queries for pertinent data.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	syncStates() {
		let cmd = '';

		if (this.model.video === true) {
			cmd = '';

			// Query video ties and input names
			for (let x in this.inputs) {
				cmd += `${x}%`;
				this.socket.write(`\x1B${x}NI\r`);
			}

			this.socket.write(cmd);

			cmd = '';

			// Query video output mute and output names
			for (let x in this.outputs) {
				cmd += `${x}B`;
				this.socket.write(`\x1B${x}NO\r`);
			}

			this.socket.write(cmd);
		}

		if (this.model.audio === true) {
			cmd = '';

			//Query audio ties
			for (let x in this.inputs) {
				cmd += `${x}$`;
			}

			this.socket.write(cmd);

			cmd = '';

			// Query audio output mute
			for (let x in this.outputs) {
				cmd += `${x}Z`;
			}

			this.socket.write(cmd);
		}

		if (this.presetCount > 0) {
			for (let x in this.presets) {
				this.socket.write(`\x1B${x}NG\r`);
			}
		}

		if (this.roomCount > 0) {
			for (let x in this.rooms) {
				this.socket.write(`\x1B${x}NR\r`);
			}
		}

		this.socket.write('S');
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

		if (this.config.host != config.host)
		{
			resetConnection = true;
		}

		this.config = config;

		this.actions();
		this.initVariables();
		this.initFeedbacks();
		this.initPresets();

		if (resetConnection === true || this.socket === undefined) {
			this.initTCP();
		}
	}

	/**
	 * INTERNAL: Updates device data from the HyperDeck
	 *
	 * @param {String} object - the collected data
	 * @access protected
	 * @since 1.0.0
	 */
	updateDevice(object) {

		const value = object.split(",")

		if (Array.isArray(info)) {
			this.deviceName = info[2];
			this.version = info[3];
			this.model = info[4];
			this.log('info', `Connected to a ${this.deviceName} (${this.version} - ${this.model})`);

			this.setModel(this.model);
		}
	}
}

exports = module.exports = instance;