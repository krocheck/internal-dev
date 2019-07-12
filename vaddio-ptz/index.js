var telnet = require("telnet-client");
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

		this.reconnectTimer;
		this.pollTimer;

		this.panSpeed     = 12;
		this.tiltSpeed    = 10;
		this.zoomSpeed    = 3;
		this.focusSpeed   = 5;

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
			case 'left':
				cmd = 'camera pan left ' + this.panSpeed;
				this.sendCommand(cmd);
				break;
			case 'right':
				cmd = 'camera pan right ' + this.panSpeed;
				this.sendCommand(cmd);
				break;
			case 'up':
				cmd = 'camera tilt up ' + this.tiltSpeed;
				this.sendCommand(cmd);
				break;
			case 'down':
				cmd = 'camera tilt down ' + this.tiltSpeed;
				this.sendCommand(cmd);
				break;
			case 'upLeft':
				cmd = 'camera pan left ' + this.panSpeed;
				this.sendCommand(cmd);
				cmd = 'camera tilt up ' + this.tiltSpeed;
				this.sendCommand(cmd);
				break;
			case 'upRight':
				cmd = 'camera pan right ' + this.panSpeed;
				this.sendCommand(cmd);
				cmd = 'camera tilt up ' + this.tiltSpeed;
				this.sendCommand(cmd);
				break;
			case 'downLeft':
				cmd = 'camera pan left ' + this.panSpeed;
				this.sendCommand(cmd);
				cmd = 'camera tilt down ' + this.tiltSpeed;
				this.sendCommand(cmd);
				break;
			case 'downRight':
				cmd = 'camera pan right ' + this.panSpeed;
				this.sendCommand(cmd);
				cmd = 'camera tilt down ' + this.tiltSpeed;
				this.sendCommand(cmd);
				break;
			case 'stop':
				cmd = 'camera pan stop';
				this.sendCommand(cmd);
				cmd = 'camera tilt stop';
				this.sendCommand(cmd);
				break;
			case 'home':
				cmd = 'camera home';
				this.sendCommand(cmd);
				break;

			case 'ptSpeedS':
				this.panSpeed = opt.panSpeed;
				this.tiltSpeed = opt.tiltSpeed;
				break;

			case 'zoomO':
				cmd = 'camera zoom out ' + this.zoomSpeed;
				this.sendCommand(cmd);
				break;
			case 'zoomI':
				cmd = 'camera zoom in ' + this.zoomSpeed;
				this.sendCommand(cmd);
				break;
			case 'zoomS':
				cmd = 'camera zoom stop';
				this.sendCommand(cmd);
				break;
			case 'zSpeedS':
				this.zoomSpeed = opt.speed;
				break;

			case 'focusN':
				cmd = 'camera focus near ' + this.zoomSpeed;
				this.sendCommand(cmd);
				break;
			case 'focusF':
				cmd = 'camera focus far ' + this.zoomSpeed;
				this.sendCommand(cmd);
				break;
			case 'focusS':
				cmd = 'camera focus stop';
				this.sendCommand(cmd);
				break;
			case 'zSpeedS':
				this.focusSpeed = opt.speed;
				break;
			case 'focusM':
				cmd = 'camera focus mode ' + this.mode;
				this.sendCommand(cmd);
				break;
/**
			case 'irisU':
				if (this.irisIndex == 99) {
					this.irisIndex = 99;
				}
				else if (this.irisIndex < 99) {
					this.irisIndex ++;
				}
				this.irisVal = IRIS[this.irisIndex].id;
				this.sendPTZ('I' + this.irisVal.toUpperCase());
				break;

			case 'irisD':
				if (this.irisIndex == 0) {
					this.irisIndex = 0;
				}
				else if (this.irisIndex > 0) {
					this.irisIndex--;
				}
				this.irisVal = IRIS[this.irisIndex].id;
				this.sendPTZ('I' + this.irisVal.toUpperCase());
				break;

			case 'irisS':
				this.sendPTZ('I' + opt.val);
				this.irisVal = opt.val;
				this.irisIndex = opt.val;
				break;

			case 'gainU':
				if (this.gainIndex == 49) {
					this.gainIndex = 49;
				}
				else if (this.gainIndex < 49) {
					this.gainIndex ++;
				}
				this.gainVal = GAIN[this.gainIndex].id

				var cmd = 'OGU:' + this.gainVal.toUpperCase();
				this.sendCam(cmd);
				break;

			case 'gainD':
				if (this.gainIndex == 0) {
					this.gainIndex = 0;
				}
				else if (this.gainIndex > 0) {
					this.gainIndex--;
				}
				this.gainVal = GAIN[this.gainIndex].id

				var cmd = 'OGU:' + this.gainVal.toUpperCase();
				this.sendCam(cmd);
				break;


			case 'gainS':
				var cmd = 'OGU:' + opt.val;
				this.sendCam(cmd);
				break;

			case 'shutU':
				if (this.shutIndex == 14) {
					this.shutIndex = 14;
				}
				else if (this.shutIndex < 14) {
					this.shutIndex ++;
				}
				this.shutVal = SHUTTER[this.shutIndex].id

				var cmd = 'OSH:' + this.shutVal.toUpperCase();
				this.sendCam(cmd);
				break;

			case 'shutD':
				if (this.shutIndex == 0) {
					this.shutIndex = 0;
				}
				else if (this.shutIndex > 0) {
					this.shutIndex--;
				}
				this.shutVal = SHUTTER[this.shutIndex].id

				var cmd = 'OSH:' + this.shutVal.toUpperCase();
				this.sendCam(cmd);
				break;


			case 'shutS':
				var cmd = 'OSH:' + opt.val.toUpperCase();
				this.sendCam(cmd);
				break;

			case 'filterU':
				if (this.filterIndex == 5) {
					this.filterIndex = 5;
				}
				else if (this.filterIndex < 5) {
					this.filterIndex ++;
				}
				this.filterVal = FILTER[this.filterIndex].id

				var cmd = 'OFT:' + this.filterVal;
				this.sendCam(cmd);
				debug(this.filterVal);
				break;

			case 'filterD':
				if (this.filterIndex == 0) {
					this.filterIndex = 0;
				}
				else if (this.filterIndex > 0) {
					this.filterIndex--;
				}
				this.filterVal = FILTER[this.filterIndex].id

				var cmd = 'OFT:' + this.filterVal;
				this.sendCam(cmd);
				debug(this.filterVal);
				break;


			case 'filterS':
				var cmd = 'OFT:' + opt.val;
				this.sendCam(cmd);
				break;

			case 'pedU':
				if (this.pedestalIndex == 299) {
					this.pedestalIndex = 299;
				}
				else if (this.pedestalIndex < 299) {
					this.pedestalIndex ++;
				}
				this.pedestalVal = PEDESTAL[this.pedestalIndex].id

				var cmd = 'OTP:' + this.pedestalVal.toUpperCase();
				this.sendCam(cmd);
				break;

			case 'pedD':
				if (this.pedestalIndex == 0) {
					this.pedestalIndex = 0;
				}
				else if (this.pedestalIndex > 0) {
					this.pedestalIndex--;
				}
				this.pedestalVal = PEDESTAL[this.pedestalIndex].id

				var cmd = 'OTP:' + this.pedestalVal.toUpperCase();
				this.sendCam(cmd);
				break;


			case 'pedS':
				var cmd = 'OTP:' + opt.val.toUpperCase();
				this.sendCam(cmd);
				break;

			case 'savePset':
				cmd ='M' + opt.val;
				this.sendPTZ(cmd);
				break;

			case 'recallPset':
				cmd ='R' + opt.val ;
				this.sendPTZ(cmd);
				break;

			case 'speedPset':
				cmd ='UPVS' + opt.speed
				this.sendPTZ(cmd);
				break;*/
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
			this.socket = new telnet();

			this.socket.connect({
				host: this.config.host,
				port: this.config.port,
				username: this.config.username,
				password: this.config.password,
				shellPrompt: ">",
				failedLoginMatch: 'Login incorrect'
			});

			if (this.reconnectTimer) {
				clearInterval(this.reconnectTimer);
			}

			this.socket.on("ready", function(data) {
				this.status(this.STATUS_OK, "Connected");
				this.loggedIn = true;
				this.okToSend = true;
				this.sendCommand('version');

				/*if (this.config.polling_interval > 0) {
					this.pollTimer = setInterval(
						pollActiveCuelists,
						this.config.polling_interval
					);
				}*/
			});

			this.socket.on("close", function() {
				this.status(this.STATUS_ERROR, "Disconnected");
				this.loggedIn = false;

				if (!this.reconnectTimer) {
					this.reconnectTimer = setInterval(function() {
						this.initTCP(), 5000;
					});
				}
			});

			// separate buffered stream into lines with responses
			this.socket.on('data', (chunk) => {
				var i = 0, line = '', offset = 0;
				receivebuffer += chunk;

				// Process lines
				while ( (i = receivebuffer.indexOf('\n', offset)) !== -1) {
					line = receivebuffer.substr(offset, i - offset);
					offset = i + 1;
					this.processCameraInformation(line);
				}

				receivebuffer = receivebuffer.substr(offset);
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
			this.deviceName = data.substring(data.indexOf('Robo'));
			this.log('info', 'Connected to a ' + this.deviceName);
		}
	}

	/**
	 * INTERNAL: Send a command to the camera
	 *
	 * @param {String} cmd - the command to send
	 * @access protected
	 * @since 1.0.0
	 */
	sendCommand(cmd = '') {
		if (this.okToSend === false && cmd != '') {
			this.nextCommand = cmd;
		}
		else if (this.loggedIn === true && this.okToSend === true) {
			if (cmd == '') {
				cmd = this.nextCommand;
				this.nextCommand = '';
			}

			this.okToSend = false;
			this.socket.send(cmd + '\r\n');
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