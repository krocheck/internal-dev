var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');

var actions       = require('./actions');
var feedback      = require('./feedback');
var presets       = require('./presets');
var variables     = require('./variables');

var debug;
var log;

/**
 * Companion instance class for the Blackmagic SmartView/SmartScope Monitors.
 *
 * @extends instance_skel
 * @version 1.1.0
 * @since 1.0.0
 * @author Per Roine <per.roine@gmail.com>
 * @author Keith Rocheck <keith.rocheck@gmail.com>
 */
class instance extends instance_skel {

	/**
	 * Create an instance of a SmartView/SmartScope module.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @param {string} id - the instance ID
	 * @param {Object} config - saved user configuration parameters
	 * @since 1.0.0
	 */
	constructor(system, id, config) {
		super(system, id, config);

		this.stash      = [];
		this.command    = null;
		this.deviceName = '';
		this.monitors   = {};

		Object.assign(this, {
			...actions,
			...feedback,
			...presets,
			...variables
		});

		this.CHOICES_SCOPETYPE = [
			{id: 'Picture',       label: 'Picture'},
			{id: 'WaveformLuma',  label: 'Waveform'},
			{id: 'Vector100',     label: 'Vector - 100%'},
			{id: 'Vector75',      label: 'Vector - 75%'},
			{id: 'ParadeRGB',     label: 'RGB Parade'},
			{id: 'ParadeYUV',     label: 'YVU Parade'},
			{id: 'Histogram',     label: 'Histogram'},
			{id: 'AudioDbfs',     label: 'Audio dBFS'},
			{id: 'AudioDbvu',     label: 'Audio dBVU'}
		];

		this.CHOICES_AUDIOCHANNELS = [
			{ id: '0', label: 'Channels 1 and 2'},
			{ id: '1', label: 'Channels 3 and 4'},
			{ id: '2', label: 'Channels 5 and 6'},
			{ id: '3', label: 'Channels 7 and 8'},
			{ id: '4', label: 'Channels 9 and 10'},
			{ id: '5', label: 'Channels 11 and 12'},
			{ id: '6', label: 'Channels 13 and 14'},
			{ id: '7', label: 'Channels 15 and 16'}
		];

		this.CHOICES_COLORS = [
			{ id: 'none',   label:'None'},
			{ id: 'red',    label:'Red'},
			{ id: 'green',  label:'Green'},
			{ id: 'blue',   label:'Blue'},
			{ id: 'white',  label:'White'}
		];

		this.CHOICES_INPUTS = [
			{ id: 'SDI A',   label: 'SDI A'},
			{ id: 'SDI B',   label: 'SDI B'},
			{ id: 'OPTICAL', label: 'OPTICAL'}
		];

		this.CHOICES_LUTS = [
			{ id: '0',    label: 'LUT 1'},
			{ id: '1',    label: 'LUT 2'},
			{ id: 'NONE', label: 'DISABLE'}
		];

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

		this.setupChoices();
		this.setActions( this.getActions() );
	}

	/**
	 * Executes the provided action.
	 *
	 * @param {Object} action - the action to be executed
	 * @access public
	 * @since 1.0.0
	 */
	action(action) {
		var cmd;
		var opt = action.options

		switch (action.action) {

			case 'bright':
				cmd = opt.mon+'\nBrightness: '+ opt.val+'\n\n';
				break;
			case 'brightUp':
				cmd = opt.mon+'\nBrightness: '+ this.getValue(this.getMonitor(opt.mon).brightness, opt.val)+'\n\n';
				break;
			case 'brightDown':
				cmd = opt.mon+'\nBrightness: '+ this.getValue(this.getMonitor(opt.mon).brightness, 0-opt.val)+'\n\n';
				break;
			case 'cont':
				cmd = opt.mon+'\nContrast: '+ opt.val+'\n\n';
				break;
			case 'contUp':
				cmd = opt.mon+'\nContrast: '+ this.getValue(this.getMonitor(opt.mon).contrast, opt.val)+'\n\n';
				break;
			case 'contDown':
				cmd = opt.mon+'\nContrast: '+ this.getValue(this.getMonitor(opt.mon).contrast, 0-opt.val)+'\n\n';
				break;
			case 'sat':
				cmd = opt.mon+'\nSaturation: '+ opt.val+'\n\n';
				break;
			case 'satUp':
				cmd = opt.mon+'\nSaturation: '+ this.getValue(this.getMonitor(opt.mon).saturation, opt.val)+'\n\n';
				break;
			case 'satDown':
				cmd = opt.mon+'\nSaturation: '+ this.getValue(this.getMonitor(opt.mon).saturation, 0-opt.val)+'\n\n';
				break;
			case 'ident':
				cmd = opt.mon+'\nIdentify: true\n\n';
				break;
			case 'border':
				cmd = opt.mon+'\nBorder: '+ opt.col+'\n\n';
				break;
			case 'scopeFunc':
				cmd = opt.mon+'\nScopeMode: '+ opt.val+'\n\n';
				break;
			case 'audio':
				cmd = opt.mon+'\nAudioChannel: '+ opt.val+'\n\n';
				break;
			case 'lut':
				cmd = opt.mon+'\nLUT: '+ opt.val+'\n\n';
				break;
			case 'input':
				cmd = opt.mon+'\nMonitorInput: '+ opt.val+'\n\n';
				break;
		}

		if (cmd !== undefined) {

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
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 6,
				regex: this.REGEX_IP
			},
			{
				type: 'text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This information below will automatically populate from the device upon connection, however, can be set manually for offline programming.'
			},
			{
				type: 'dropdown',
				id: 'ver',
				label: 'Product',
				width: 6,
				choices: [
					{ id: 'smView',    label: 'SmartView HD' },
					{ id: 'smView4K',  label: 'SmartView 4K' },
					{ id: 'smViewDuo', label: 'SmartView Duo' },
					{ id: 'smScope',   label: 'SmartScope Duo 4K' }
				],
				default: 'smView'
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

		this.debug("destroy", this.id);;
	}

	/**
	 * INTERNAL: returns the desired monitor object.
	 *
	 * @param {String} id - the monitor to fetch
	 * @returns {Object} the desired monitor object
	 * @access protected
	 * @since 1.1.0
	 */
	getMonitor(id) {

		if (id.length > 1) {
			if (id.match(/ A/)) {
				id = 'A';
			}
			else if (id.match(/ B/)) {
				id = 'B';
			}
		}

		if (this.monitors[id] === undefined) {
			this.monitors[id] = {
				brightness:      255,
				contrast:        127,
				saturation:      127,
				identify:        false,
				border:          'none',
				scopeMode:       'Picture',
				audioChannel:    '0',
				lut:             'NONE',
				monitorInput:    'SDI A'
			};
		}

		return this.monitors[id];
	}

	/**
	 * INTERNAL: returns a value between 0 and 255 based on change.
	 *
	 * @param {number} base - the base value to modify
	 * @param {number} offset - the +/- value
	 * @returns {number} 0-255
	 * @access protected
	 * @since 1.1.0
	 */
	getValue(base, offset) {

		var out = base + offset;

		if (out > 255) {
			out = 255;
		}
		else if (out < 0) {
			out = 0;
		}

		return out;
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
		//this.initPresets();

		this.init_tcp();
	}

	/**
	 * INTERNAL: use setup data to initalize the tcp socket object.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	init_tcp() {
		var receivebuffer = '';

		if (this.socket !== undefined) {
			this.socket.destroy();
			delete this.socket;
		}

		if (this.config.port === undefined) {
			this.config.port = 9992;
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
			});

			// separate buffered stream into lines with responses
			this.socket.on('data', (chunk) => {
				var i = 0, line = '', offset = 0;
				receivebuffer += chunk;

				while ( (i = receivebuffer.indexOf('\n', offset)) !== -1) {
					line = receivebuffer.substr(offset, i - offset);
					offset = i + 1;
					this.socket.emit('receiveline', line.toString());
				}

				receivebuffer = receivebuffer.substr(offset);
			});

			this.socket.on('receiveline', (line) => {

				if (this.command === null && line.match(/:/) ) {
					this.command = line;
				}
				else if (this.command !== null && line.length > 0) {
					this.stash.push(line.trim());
				}
				else if (line.length === 0 && this.command !== null) {
					var cmd = this.command.trim().split(/:/)[0];

					this.processSmartviewInformation(cmd, this.stash);

					this.stash = [];
					this.command = null;
				}
				else {
					this.debug("weird response from smartview", line, line.length);
				}
			});
		}
	}

	/**
	 * INTERNAL: Routes incoming data to the appropriate function for processing.
	 *
	 * @param {string} key - the command/data type being passed
	 * @param {Object} data - the collected data
	 * @access protected
	 * @since 1.1.0
	 */
	processSmartviewInformation(key,data) {

		if (key.match(/MONITOR (A|B)/)) {
			this.updateMonitor(key,data);
			this.actions();
			this.initFeedbacks();
			//this.initPresets();
		}
		else if (key == 'SMARTVIEW DEVICE') {
			this.updateDevice(key,data);
			this.actions();
			this.initVariables();
			this.initFeedbacks();
			//this.initPresets();
		}
		else {
			// TODO: find out more about the smart view from stuff that comes in here
		}
	}

	/**
	 * INTERNAL: use model data to define the choices for the dropdowns.
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	setupChoices() {

		this.CHOICES_MONITOR = [];

		if ( this.config.modelID == 'smViewDuo' || this.config.modelID == 'smScope' ) {
			this.CHOICES_MONITOR = [
				{id: 'MONITOR A:', label: 'Monitor A'},
				{id: 'MONITOR B:', label: 'Monitor B'}
			];
		}
		else {
			this.CHOICES_MONITOR = [{ id: 'MONITOR A:', label: 'Monitor A' }];
		}
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
		//this.initPresets();

		if (resetConnection === true || this.socket === undefined) {
			this.init_tcp();
		}
	}

	/**
	 * INTERNAL: Updates device data from the SmartView
	 *
	 * @param {string} labeltype - the command/data type being passed
	 * @param {Object} object - the collected data
	 * @access protected
	 * @since 1.1.0
	 */
	updateDevice(labeltype, object) {

		for (var key in object) {
			var parsethis = object[key];
			var a = parsethis.split(/: /);
			var attribute = a.shift();
			var value = a.join(" ");

			switch (attribute) {
				case 'Model':
					if (value.match(/SmartView 4K/)) {
						this.config.ver = 'smView4K';
					}
					else if (value.match(/SmartView HD/)) {
						this.config.ver = 'smView';
					}
					else if (value.match(/SmartView Duo/)) {
						this.config.ver = 'smViewDuo';
					}
					else if (value.match(/SmartScope Duo 4K/)) {
						this.config.ver = 'smScope';
					}
					this.deviceName = value;
					this.log('info', 'Connected to a ' + this.deviceName);
					break;
			}
		}

		this.saveConfig();
	}

	/**
	 * INTERNAL: Updates monitor config based on data from the SmartView
	 *
	 * @param {string} labeltype - the command/data type being passed
	 * @param {Object} object - the collected data
	 * @access protected
	 * @since 1.1.0
	 */
	updateStatus(labeltype, object) {

		var monitor = this.getMonitor(labeltype);

		for (var key in object) {
			var parsethis = object[key];
			var a = parsethis.split(/ /);
			var num = parseInt(a.shift());
			var value = a.join(" ");

			switch (labeltype) {
				case 'Brightness':
					this.monitor.brightness = parseInt(value);
					break;
				case 'Contrast':
					this.monitor.contrast = parseInt(value);
					break;
				case 'Saturation':
					this.monitor.saturation = parseInt(value);
					break;
				case 'Border':
					this.monitor.border = value;
					break;
				case 'ScopeMode':
					this.monitor.scopeMode = value;
					break;
				case 'AudioChannel':
					this.monitor.audioChannel = value;
					break;
				case 'LUT':
					this.monitor.lut = value;
					break;
				case 'MonitorInput':
					this.monitor.monitorInput = value;
					break;
				case 'Identify':
					this.monitor.identify = (value == 'true');
					break;
			}
		}
	}
}

exports = module.exports = instance;
