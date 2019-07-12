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
				cmd = 'camera tilt down';
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
				if (self.irisIndex == 99) {
					self.irisIndex = 99;
				}
				else if (self.irisIndex < 99) {
					self.irisIndex ++;
				}
				self.irisVal = IRIS[self.irisIndex].id;
				self.sendPTZ('I' + self.irisVal.toUpperCase());
				break;

			case 'irisD':
				if (self.irisIndex == 0) {
					self.irisIndex = 0;
				}
				else if (self.irisIndex > 0) {
					self.irisIndex--;
				}
				self.irisVal = IRIS[self.irisIndex].id;
				self.sendPTZ('I' + self.irisVal.toUpperCase());
				break;

			case 'irisS':
				self.sendPTZ('I' + opt.val);
				self.irisVal = opt.val;
				self.irisIndex = opt.val;
				break;

			case 'gainU':
				if (self.gainIndex == 49) {
					self.gainIndex = 49;
				}
				else if (self.gainIndex < 49) {
					self.gainIndex ++;
				}
				self.gainVal = GAIN[self.gainIndex].id

				var cmd = 'OGU:' + self.gainVal.toUpperCase();
				self.sendCam(cmd);
				break;

			case 'gainD':
				if (self.gainIndex == 0) {
					self.gainIndex = 0;
				}
				else if (self.gainIndex > 0) {
					self.gainIndex--;
				}
				self.gainVal = GAIN[self.gainIndex].id

				var cmd = 'OGU:' + self.gainVal.toUpperCase();
				self.sendCam(cmd);
				break;


			case 'gainS':
				var cmd = 'OGU:' + opt.val;
				self.sendCam(cmd);
				break;

			case 'shutU':
				if (self.shutIndex == 14) {
					self.shutIndex = 14;
				}
				else if (self.shutIndex < 14) {
					self.shutIndex ++;
				}
				self.shutVal = SHUTTER[self.shutIndex].id

				var cmd = 'OSH:' + self.shutVal.toUpperCase();
				self.sendCam(cmd);
				break;

			case 'shutD':
				if (self.shutIndex == 0) {
					self.shutIndex = 0;
				}
				else if (self.shutIndex > 0) {
					self.shutIndex--;
				}
				self.shutVal = SHUTTER[self.shutIndex].id

				var cmd = 'OSH:' + self.shutVal.toUpperCase();
				self.sendCam(cmd);
				break;


			case 'shutS':
				var cmd = 'OSH:' + opt.val.toUpperCase();
				self.sendCam(cmd);
				break;

			case 'filterU':
				if (self.filterIndex == 5) {
					self.filterIndex = 5;
				}
				else if (self.filterIndex < 5) {
					self.filterIndex ++;
				}
				self.filterVal = FILTER[self.filterIndex].id

				var cmd = 'OFT:' + self.filterVal;
				self.sendCam(cmd);
				debug(self.filterVal);
				break;

			case 'filterD':
				if (self.filterIndex == 0) {
					self.filterIndex = 0;
				}
				else if (self.filterIndex > 0) {
					self.filterIndex--;
				}
				self.filterVal = FILTER[self.filterIndex].id

				var cmd = 'OFT:' + self.filterVal;
				self.sendCam(cmd);
				debug(self.filterVal);
				break;


			case 'filterS':
				var cmd = 'OFT:' + opt.val;
				self.sendCam(cmd);
				break;

			case 'pedU':
				if (self.pedestalIndex == 299) {
					self.pedestalIndex = 299;
				}
				else if (self.pedestalIndex < 299) {
					self.pedestalIndex ++;
				}
				self.pedestalVal = PEDESTAL[self.pedestalIndex].id

				var cmd = 'OTP:' + self.pedestalVal.toUpperCase();
				self.sendCam(cmd);
				break;

			case 'pedD':
				if (self.pedestalIndex == 0) {
					self.pedestalIndex = 0;
				}
				else if (self.pedestalIndex > 0) {
					self.pedestalIndex--;
				}
				self.pedestalVal = PEDESTAL[self.pedestalIndex].id

				var cmd = 'OTP:' + self.pedestalVal.toUpperCase();
				self.sendCam(cmd);
				break;


			case 'pedS':
				var cmd = 'OTP:' + opt.val.toUpperCase();
				self.sendCam(cmd);
				break;

			case 'savePset':
				cmd ='M' + opt.val;
				self.sendPTZ(cmd);
				break;

			case 'recallPset':
				cmd ='R' + opt.val ;
				self.sendPTZ(cmd);
				break;

			case 'speedPset':
				cmd ='UPVS' + opt.speed
				self.sendPTZ(cmd);
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
					receivebuffer = '';
					this.socket.send(this.config.username + '\n');
				}
				else if (receivebuffer.match(/[P|p]assword:/)) {
					receivebuffer = '';
					this.socket.send(this.config.password + '\n');
				}
				else if (receivebuffer.match(/>/)) {
					this.loggedIn = true;
					if (this.deviceName == '') {
						receivebuffer = '';
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
			this.deviceName = data.substring(data.indexOf('Robo'));
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
		else if (this.okToSend === true) {
			if (cmd == '') {
				cmd = this.nextCommand;
				this.nextCommand = '';
			}

			this.okToSend = false;
			this.socket.send(cmd + '\n');
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