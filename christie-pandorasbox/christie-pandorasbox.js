var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	let self = this;

	//COMMAND IDs
	self.CMD_SET_SEQ_TRANSPORT_MODE = 3;
	self.CMD_MOVE_SEQ_TO_CUE = 4;
	self.CMD_MOVE_SEQ_TO_LASTNEXTCUE = 7;
	self.CMD_RESET_ALL = 9;
	self.CMD_CLEAR_ALL_ACTIVE = 13;
	self.CMD_TOGGLE_FULLSCREEN = 17;
	self.CMD_STORE_ACTIVE = 25;
	self.CMD_CLEAR_SELECTION = 48;
	self.CMD_IGNORE_NEXT_CUE = 55;
	self.CMD_SAVE_PROJECT = 62;
	self.CMD_SET_SITE_IP = 71;
	self.CMD_APPLY_VIEW = 103;
	self.CMD_SET_SEQ_SELECTION = 299;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions();

	return self;
}

/**
 * The user updated the config.
 *
 * @param config         The new config object
 */
instance.prototype.updateConfig = function(config) {
	let self = this;

	// Reconnect to Pandoras Box if the IP changed
	if (self.config.host !== config.host || self.isConnected() === false) {
		self.config.host = config.host;
		self.init_tcp();
	}

	// Keep config around
	self.config = config;

	// Build actions
	self.actions();
}

/**
 * Initialize module & connect
 */
instance.prototype.init = function() {
	let self = this;

	debug = self.debug;
	log = self.log;

	self.init_tcp();
}

instance.prototype.init_tcp = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	if (self.config.host) {
		self.socket = new tcp(self.config.host, 6211);

		self.socket.on('status_change', function(status, message) {
			self.status(status, message);
		});

		self.socket.on('error', function(err) {
			debug("Network error", err);
			self.status(self.STATE_ERROR, err);
			self.log('error',"Network error: " + err.message);
		});

		self.socket.on('connect', function() {
			self.status(self.STATE_OK);
			debug("Connected");
		})

		self.socket.on('data', function(data) {});
	}
}

/**
 *
 * @param cmd {Buffer}
 * @returns {boolean}
 */
instance.prototype.send = function(cmd) {
	let self = this;

	if (self.isConnected()) {
		debug('sending', cmd, 'to', self.config.host);
		return self.socket.send(cmd);
	} else {
		debug('Socket not connected');
	}

	return false;
}

/**
 * Returns if the socket is connected.
 *
 * @returns If the socket is connected {boolean}
 */
instance.prototype.isConnected = function() {
	let self = this;

	return self.socket !== undefined && self.socket.connected;
}

/**
 * Return config fields for web config.
 *
 * @returns      The config fields for the module {Object}
 */
instance.prototype.config_fields = function() {
	let self = this;
	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: "Christie Pandoras Box V6 Control using PBAutomation SDK"
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 6,
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'domain',
			width: 6,
			label: 'Domain',
			value: "0",
			regex: self.REGEX_NUMBER
		}
	];
}

/**
 * Cleanup when the module gets deleted.
 */
instance.prototype.destroy = function() {
	let self = this;

	debug('destroy', self.id);

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}
}

/**
 * Creates the actions for this module.
 */
instance.prototype.actions = function(system) {
	let self = this;

	self.setActions({
		'seq_transport': {
			label: 'Sequence Transport',
			options: [
				{
					type: 'dropdown',
					label: 'Transport',
					id: 'mode',
					default: '1',
					choices: [
						{id: 1, label: 'Play'},
						{id: 3, label: 'Pause'},
						{id: 2, label: 'Stop'}
					]
				},
				{
					type: 'textinput',
					label: 'Sequence ID',
					id: 'seq',
					default: '1',
					regex: self.REGEX_NUMBER
				}
			]
		},
		'seq_to_cue': {
			label: 'Goto Cue',
			options: [
				{
					type: 'textinput',
					label: 'Sequence ID',
					id: 'seq',
					default: '1',
					regex: self.REGEX_NUMBER
				},
				{
					type: 'textinput',
					label: 'Cue ID',
					id: 'cueid',
					default: '1',
					regex: self.REGEX_NUMBER
				}
			]
		},
		'seq_nextlast_cue': {
			label: 'Goto Next/Last Cue',
			options: [
				{
					type: 'textinput',
					label: 'Sequence ID',
					id: 'seq',
					default: '1',
					regex: self.REGEX_NUMBER
				},
				{
					type: 'dropdown',
					label: 'Next or Last',
					id: 'nextmode',
					default: '1',
					choices: [
						{id: 0, label: 'Last CUE'},
						{id: 1, label: 'Next CUE'}
					]
				}
			]
		},
		'seq_ignorenextcue': {
			label: 'Ignore Next CUE on Sequence',
			options: [
				{
					type: 'textinput',
					label: 'Sequence ID',
					id: 'seq',
					default: '1',
					regex: self.REGEX_NUMBER
				},
				{
					type: 'dropdown',
					label: 'Ignore / Not ignore next Cue',
					id: 'doignore',
					default: '1',
					choices: [
						{id: 0, label: 'Do not ignore next CUE'},
						{id: 1, label: 'Ignore next CUE'}
					]
				}
			]
		},
		'seq_selection': {
			label: 'Select Editing Sequence',
			options: [
				{
					type: 'textinput',
					label: 'Sequence ID',
					id: 'seq',
					default: '1',
					regex: self.REGEX_NUMBER
				}
			]
		},
		'recall_view': {
			label: 'Recall GUI View',
			options: [
				{
					type: 'textinput',
					label: 'View ID',
					id: 'view',
					default: '1',
					regex: self.REGEX_NUMBER
				}
			]
		},
		'save_project': { label: 'Save PandorasBox Project' },
		'toggle_fullscreenbyid': {
			label: 'Toggle Fullscreen by SiteID',
			options: [
				{
					type: 'textinput',
					label: 'SiteID',
					id: 'site',
					default: '1',
					regex: self.REGEX_NUMBER
				}
			]
		},
		'set_SiteIPbyid': {
			label: 'Set the IP Adress of a Site (Client) by its ID',
			options: [
				{
					type: 'textinput',
					label: 'SiteID',
					id: 'site',
					default: '1',
					regex: self.REGEX_NUMBER
				},
				{
					type: 'textinput',
					id: 'siteip',
					label: 'IP for Site',
					width: 6,
					regex: self.REGEX_IP
				}
			]
		},
		'clear_allactive': { label: 'Clear ALL Active Values' },
		'store_allactive': {
			label: 'Store ALL Active Values to Sequence',
			options: [
				{
					type: 'textinput',
					label: 'Sequence ID',
					id: 'seq',
					default: '1',
					regex: self.REGEX_NUMBER
				}
			]
		},
		'clear_selection': { label: 'Clear Device Selection' },
		'reset_all': { label: 'Reset All Values to Defaults' }
	});
}

/**
 * Executes the action and sends the TCP packet to Pandoras Box
 *
 * @param action      The action to perform
 */
instance.prototype.action = function(action) {
	let self = this;
	var opt = action.options;

	let buf = undefined;
	let message = '';

	switch (action.action) {
		case 'seq_transport':
			message = self.shortToBytes(self.CMD_SET_SEQ_TRANSPORT_MODE)
				.concat(self.intToBytes(parseInt(opt.seq)))
				.concat(self.intToBytes(parseInt(opt.mode)));
			buf = Buffer.from(self.prependHeader(message));
			break;

		case 'seq_to_cue':
			message = self.shortToBytes(self.CMD_MOVE_SEQ_TO_CUE)
				.concat(self.intToBytes(parseInt(opt.seq)))
				.concat(self.intToBytes(parseInt(opt.cueid)));
			buf = Buffer.from(self.prependHeader(message));
			break;

		case 'seq_nextlast_cue':
			message = self.shortToBytes(self.CMD_MOVE_SEQ_TO_LASTNEXTCUE)
				.concat(self.intToBytes(parseInt(opt.seq)))
				.concat([parseInt(opt.nextmode)]);
			buf = Buffer.from(self.prependHeader(message));
			break;

		case 'seq_ignorenextcue':
			message = self.shortToBytes(self.CMD_IGNORE_NEXT_CUE)
				.concat(self.intToBytes(parseInt(opt.seq)))
				.concat([parseInt(opt.doignore)]);
			buf = Buffer.from(self.prependHeader(message));
			break;

		case 'seq_selection':
			message = self.shortToBytes(self.CMD_SET_SEQ_SELECTION)
				.concat(self.intToBytes(parseInt(opt.seq)));
			buf = Buffer.from(self.prependHeader(message));
			break;

		case 'recall_view':
			message = self.shortToBytes(self.CMD_APPLY_VIEW)
				.concat(self.intToBytes(parseInt(opt.view)));
			buf = Buffer.from(self.prependHeader(message));
			break;

		case 'save_project':
			message = self.shortToBytes(self.CMD_SAVE_PROJECT);
			buf = Buffer.from(self.prependHeader(message));
			break;

		case 'toggle_fullscreenbyid':
			message = self.shortToBytes(self.CMD_TOGGLE_FULLSCREEN)
				.concat(self.intToBytes(parseInt(opt.site)));
			buf = Buffer.from(self.prependHeader(message));
			break;

		case 'set_SiteIPbyid':
			message = self.shortToBytes(self.CMD_SET_SITE_IP)
				.concat(self.intToBytes(parseInt(opt.site)))
				.concat(self.shortToBytes(opt.siteip.length))
				.concat(self.StrNarrowToBytes(opt.siteip));
			buf = Buffer.from(self.prependHeader(message));
			break;

		case 'clear_allactive':
			message = self.shortToBytes(self.CMD_CLEAR_ALL_ACTIVE);
			buf = Buffer.from(self.prependHeader(message));
			break;

		case 'store_allactive':
			message = self.shortToBytes(self.CMD_STORE_ACTIVE)
				.concat(self.intToBytes(parseInt(opt.seq)));
			buf = Buffer.from(self.prependHeader(message));
			break;

		case 'clear_selection':
			message = self.shortToBytes(self.CMD_CLEAR_SELECTION);
			buf = Buffer.from(self.prependHeader(message));
			break;

		case 'reset_all':
			message = self.shortToBytes(self.CMD_RESET_ALL);
			buf = Buffer.from(self.prependHeader(message));
			break;
		}

	if (buf !== undefined) {
		self.send(buf);
	}
}

instance.prototype.intToBytes = function(int) {
	return [
		(int & 0xFF000000) >> 24,
		(int & 0x00FF0000) >> 16,
		(int & 0x0000FF00) >>  8,
		(int & 0x000000FF),
	];
}

instance.prototype.shortToBytes = function(int) {
	return [
		(int & 0xFF00) >>  8,
		(int & 0x00FF),
	];
}

instance.prototype.StrNarrowToBytes = function(str) {
	var ch, st, re = [];

	for (var i = 0; i < str.length; i++ ) {
		ch = str.charCodeAt(i);  
		st = [];

		do {
			st.push( ch & 0xFF );  
			ch = ch >> 8;
		}
		while ( ch );

		re = re.concat( st.reverse() );
	}

	return re;
}

/**
 * Prepends TCP header and returns complete message
 *
 * @param {Array}
 * @returns {Array}
 */
instance.prototype.prependHeader = function(body) {
	let self = this;

	let magic = [80, 66, 65, 85]; // PBAU
	let preHeader = [1]; // version number

	let domain = self.intToBytes(parseInt(self.config.domain));
	let postHeader = [
		Math.floor(body.length / 256), body.length % 256, // message length
		0, 0, 0, 0, // connection id, just 0
		0, // protocol: 0 = TCP
	];

	let header = preHeader.concat(domain).concat(postHeader);

	let checksum = header.reduce((p, c) => p + c, 0) % 256;

	return magic.concat(header).concat([checksum]).concat(body);
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;
