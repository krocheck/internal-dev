var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var videohub = require('../videohub/videohub');

var actions       = require('./actions');
var feedback      = require('./feedback');
var presets       = require('./presets');
var variables     = require('./variables');

var debug;
var log;

/**
 * Companion instance class for the Blackmagic MultiView 16.
 *
 * @extends videohub
 * @version 1.0.0
 * @since 1.0.0
 * @author William Viker <william@bitfocus.io>
 * @author Keith Rocheck <keith.rocheck@gmail.com>
 */
class instance extends videohub {

	/**
	 * Create an instance of a videohub module.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @param {string} id - the instance ID
	 * @param {Object} config - saved user configuration parameters
	 * @since 1.0.0
	 */
	constructor(system, id, config) {
		super(system, id, config);

		Object.assign(this, {
			...actions,
			...feedback,
			...presets,
			...variables
		});

		this.inputCount = 16;
		this.outputCount = 16;
		this.monitoringCount = 0;
		this.serialCount = 0;

		this.CHOICES_LAYOUT = [
			{ id: '2x2', label: '2x2' },
			{ id: '3x3', label: '3x3' },
			{ id: '4x4', label: '4x4' }
		];

		this.CHOICES_OUTPUTFORMAT = [
			{ id: '50i', label: '50i' },
			{ id: '50p', label: '50p' },
			{ id: '60i', label: '60i' },
			{ id: '60p', label: '60p' }
		];

		this.CHOICES_TRUEFALSE = [
			{ id: 'true', label: 'True' },
			{ id: 'false', label: 'False' }
		];
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
		super.action(action);
		var cmd;
		var opt = action.options;

		// Note that main routing/naming actions are handled upstream in videohub
		switch (action.action) {
			case 'route_solo':
				if (this.config.take === true) {
					this.queue = "VIDEO OUTPUT ROUTING:\n"+this.outputCount+" "+opt.source+"\n\n";
					this.checkFeedbacks('take');
				}
				else {
					cmd = "VIDEO OUTPUT ROUTING:\n"+this.outputCount+" "+opt.source+"\n\n";
				}
				break;
			case 'route_audio':
				if (this.config.take === true) {
					this.queue = "VIDEO OUTPUT ROUTING:\n"+(this.outputCount+1)+" "+opt.source+"\n\n";
					this.checkFeedbacks('take');
				}
				else {
					cmd = "VIDEO OUTPUT ROUTING:\n"+(this.outputCount+1)+" "+opt.source+"\n\n";
				}
				break;
			case 'set_solo':
				cmd = "CONFIGURATION:\n"+"Solo enabled: "+opt.setting+"\n\n";
				break;
			case 'set_layout':
				cmd = "CONFIGURATION:\n"+"Layout: "+opt.setting+"\n\n";
				break;
			case 'set_format':
				cmd = "CONFIGURATION:\n"+"Output format: "+opt.setting+"\n\n";
				break;
			case 'set_border':
				cmd = "CONFIGURATION:\n"+"Display border: "+opt.setting+"\n\n";
				break;
			case 'set_labels':
				cmd = "CONFIGURATION:\n"+"Display labels: "+opt.setting+"\n\n";
				break;
			case 'set_meters':
				cmd = "CONFIGURATION:\n"+"Display audio meters: "+opt.setting+"\n\n";
				break;
			case 'set_tally':
				cmd = "CONFIGURATION:\n"+"Display SDI tally: "+opt.setting+"\n\n";
				break;
			case 'set_widescreen_sd':
				cmd = "CONFIGURATION:\n"+"Widescreen SD enable: "+opt.setting+"\n\n";
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
				type: 'text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module will connect to any Blackmagic Design MultiView 16 Device.'
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'MultiView IP',
				width: 6,
				regex: this.REGEX_IP
			},
			{
				type: 'checkbox',
				id: 'take',
				label: 'Enable Take?',
				width: 6,
				default: false,
			}
		]
	}

	/**
	 * INTERNAL: returns the device config object.
	 *
	 * @returns {Object} the device config object
	 * @access protected
	 * @since 1.1.0
	 */
	getConfig() {

		if (this.configuration === undefined) {
			this.configuration = {
				layout:        '2x2',
				outputFormat:  '60i',
				soloEnabled:   'false',
				widescreenSD:  'true',
				displayBorder: 'true',
				displayLabels: 'true',
				displayMeters: 'true',
				displayTally:  'true'
			};
		}

		return this.configuration;
	}

	/**
	 * INTERNAL: returns the desired output object.
	 *
	 * @param {number} id - the output to fetch
	 * @returns {Object} the desired output object
	 * @access protected
	 * @since 1.1.0
	 */
	getOutput(id) {

		if (this.outputs[id] === undefined) {
			this.outputs[id] = {
				label:      (id+1) + ': View ' + (id+1),
				name:       'View ' + (id+1),
				route:      id,
				status:     'BNC',
				lock:       'U'
			};
		}

		return this.outputs[id];
	}

	/**
	 * INTERNAL: initialize feedbacks.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initFeedbacks() {
		// feedbacks
		var feedbacks = this.getFeedbacks();

		this.setFeedbackDefinitions(feedbacks);
	}

	/**
	 * INTERNAL: Routes incoming data to the appropriate function for processing.
	 *
	 * @param {string} key - the command/data type being passed
	 * @param {Object} data - the collected data
	 * @access protected
	 * @since 1.0.0
	 */
	processVideohubInformation(key,data) {
		super.processVideohubInformation(key,data);

		// Note that main processing is handled upstream in videohub
		if (key == 'VIDEO OUTPUT ROUTING') {
			// Processing handled upstream
			this.checkFeedbacks('solo_source');
			this.checkFeedbacks('audio_source');
		}
		else if (key == 'CONFIGURATION') {
			this.updateDeviceConfig(key,data);
		}
		else {
			// TODO: find out more about the video hub from stuff that comes in here
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
		this.initFeedbacks();
		this.initVariables();

		if (resetConnection === true || this.socket === undefined) {
			this.init_tcp();
		}
	}

	/**
	 * INTERNAL: Updates device data from the Videohub
	 *
	 * @param {string} labeltype - the command/data type being passed
	 * @param {Object} object - the collected data
	 * @access protected
	 * @since 1.0.0
	 */
	updateDeviceConfig(labeltype, object) {

		for (var key in object) {
			var parsethis = object[key];
			var a = parsethis.split(/: /);
			var attribute = a.shift();
			var value = a.join(" ");

			switch (attribute) {
				case 'Layout':
					this.getConfig().layout = value;
					this.checkFeedbacks('layout');
					break;
				case 'Output format':
					this.getConfig().outputFormat = value;
					this.checkFeedbacks('output_format');
					break;
				case 'Solo enabled':
					this.getConfig().soloEnabled = value;
					this.checkFeedbacks('solo_enabled');
					break;
				case 'Widescreen SD enable':
					this.getConfig().widescreenSD = value;
					this.checkFeedbacks('widescreen_sd');
					break;
				case 'Display border':
					this.getConfig().displayBorder = value;
					this.checkFeedbacks('display_border');
					break;
				case 'Display labels':
					this.getConfig().displayLabels = value;
					this.checkFeedbacks('display_labels');
					break;
				case 'Display audio meters':
					this.getConfig().displayMeters = value;
					this.checkFeedbacks('display_meters');
					break;
				case 'Display SDI tally':
					this.getConfig().displayTally = value;
					this.checkFeedbacks('display_tally');
					break;
			}
		}
	}
}

exports = module.exports = instance;