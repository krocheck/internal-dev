var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');

var instance_api  = require('./internalAPI');
var actions       = require('./actions');
var feedback      = require('./feedback');
var presets       = require('./presets');
var variables     = require('./variables');

var debug;
var log;

/**
 * Companion instance class for the Vaddio PTZ cameras.
 *
 * @extends instance_skel
 * @version 1.0.0
 * @since 1.0.0
 * @author Keith Rocheck <keith.rocheck@gmail.com>
 */
class instance extends instance_skel {

	/**
	 * Create an instance of a vaddio ptz module.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @param {string} id - the instance ID
	 * @param {Object} config - saved user configuration parameters
	 * @since 1.0.0
	 */
	constructor(system, id, config) {
		super(system, id, config);

		this.deviceName   = '';
		this.loggedIn     = false;
		this.okToSend     = false;
		this.nextCommand  = '';

		Object.assign(this, {
			...actions,
			...feedback,
			...presets,
			...variables
		});

		this.api = new instance_api(this);

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
		var cmd;
		var opt = action.options;

		switch (action.action) {
			case 'route':
				if (parseInt(opt.destination) >= this.outputCount) {
					cmd = "VIDEO MONITORING OUTPUT ROUTING:\n"+(parseInt(opt.destination)-this.outputCount)+" "+opt.source+"\n\n";
				}
				else {
					cmd = "VIDEO OUTPUT ROUTING:\n"+opt.destination+" "+opt.source+"\n\n";
				}
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
				value: 'This module will connect to any Vaddio PTZ Camera via telnet.'
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Camera IP',
				width: 6,
				regex: this.REGEX_IP
			},
			{
				type: 'textinput',
				id: 'username',
				label: 'Username',
				width: 6,
				default: 'admin',
				regex: this.REGEX_SOMETHING
			},
			{
				type: 'textinput',
				id: 'password',
				label: 'Password',
				width: 6,
				default: 'password',
				regex: this.REGEX_SOMETHING
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

		this.initVariables();
		this.initFeedbacks();
		this.initPresets();

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
			this.config.port = 23;
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

			this.socket.on('disconnect', () => {
				this.debug("Disconnected");
				this.loggedIn = false;
				this.okToSend = false;
			});


			// separate buffered stream into lines with responses
			this.socket.on('data', (chunk) => {
				var i = 0, line = '', offset = 0;
				receivebuffer += chunk;

				// Process lines
				while ( (i = receivebuffer.indexOf('\n', offset)) !== -1) {
					line = receivebuffer.substr(offset, i - offset);
					offset = i + 1;
					this.socket.emit('receiveline', line.toString());
				}

				receivebuffer = receivebuffer.substr(offset);

				// Read current line
				if (receivebuffer.match(/[L|l]ogin:/)) {
					receiverbuffer = '';
					this.socket.send(this.config.username + '\n');
				}
				else if (receivebuffer.match(/[P|p]assword:/)) {
					receiverbuffer = '';
					this.socket.send(this.config.password + '\n');
				}
				else if (receivebuffer.match(/>/)) {
					if (this.deviceName == '') {
						this.socket.send('version\n');
					}
					else {
						this.okToSend = true;
						//this.sendCommand();
					}
				}
			});

			this.socket.on('receiveline', (line) => {

				if (this.loggedIn == false || line.match(/[L|l]ogin:/) || line.match(/[P|p]assword:/)) {
					this.processLogin(line);
				}
				else {
					this.processCameraInformation(line);
				}
			});
		}
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
	 * @param {Object} data - the collected data
	 * @access protected
	 * @since 1.0.0
	 */
	processCameraInformation(data) {
		if (data.match(/System Version/)) {
			this.deviceName = data.substring(data.indexOf('RoboShot'));
			this.log('info', 'Connected to a ' + this.deviceName);
		}
	}

	/**
	 * INTERNAL: Processes data from telnet and handles the login procedure.
	 *
	 * @param {Object} data - the collected data
	 * @access protected
	 * @since 1.0.0
	 */
	processLogin(data) {
		if (data.match(/[L|l]ogin:/)) {
			this.socket.send(this.config.username + '\n');
		}
		else if (data.match(/[P|p]assowrd:/)) {
			this.socket.send(this.config.password + '\n');
		}
		else if (data == ('Welcome ' + this.config.username)) {
			this.loggedIn = true;
		}
	}

	/**
	 * INTERNAL: use model data to define the choices for the dropdowns.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	setupChoices() {

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
		this.initPresets();
		this.initVariables();

		if (resetConnection === true || this.socket === undefined) {
			this.initTCP();
		}
	}
}

exports = module.exports = instance;