var instance_skel = require('../../instance_skel');
var debug;
var log;

/**
 * Create an instance of a JustMacros module.
 *
 * @param {EventEmitter} system - the brains of the operation
 * @param {string} id - the instance ID
 * @param {array} config - saved user configuration parameters
 * @since 1.0.0
 */
function instance(system, id, config) {
	var self = this;
	self.port = 39812;
	// super-constructor
	instance_skel.apply(this, arguments);
	self.actions(); // export actions
	return self;
}

/**
 * Setup the actions.
 *
 * @param {EventEmitter} system - the brains of the operation
 * @public
 * @since 1.0.0
 */
instance.prototype.actions = function(system) {
	var self = this;
	self.system.emit('instance_actions', self.id, {
		'post': {
			label: 'luaFunc',
			options: [
				{
					type:  'textinput',
					label: 'Function Name',
					id:    'func',
					regex: '/^[A-Za-z0-9]*$/'
				},
				{
					type:  'textinput',
					label: 'Parameters (comma separated)',
					id:    'params'
				}
			]
		},
		'get': {
			label: 'luaScript',
			options: [
				{
					type:  'textinput',
					label: 'Script Name',
					id:    'script',
					regex: '/^[A-Za-z0-9]*$/'
				}
			]
		}
	});
}

/**
 * Executes the provided action.
 *
 * @param {Array} action - the action to be executed
 * @public
 * @since 1.0.0
 */
instance.prototype.action = function(action) {
	var self = this;
	var cmd  = "";
	var base = 'http://' + self.config.host + ':' + self.port + '/EXECUTELUA:';

	if (action.action == 'luaFunc') {
		if ( action.options.func instanceof String && action.options.func.length > 0 ) {
			cmd = base + action.options.func + '(' + action.options.params + ');';
		}
	}
	else if (action.action == 'luaScript') {
		if ( action.options.script instanceof String && action.options.script.length > 0 ) {
			cmd = base + 'ScriptExecute(' + action.options.script + ');';
		}
	}

	if (cmd.length > 0) {
		self.system.emit('rest_get', action.options.url, function (err, result) {
			if (err !== null) {
				self.log('error', 'LUA Request failed');
			}
		});
	}
	else {
		self.log('error', 'LUA request not sent.  Script/Function field is incomplete.');
	}
}

/**
 * Creates the configuration fields for web config.
 *
 * @returns {Array} the config fields
 * @public
 * @since 1.0.0
 */
instance.prototype.config_fields = function () {
	var self = this;
	return [
		{
			type:    'textinput',
			id:      'host',
			label:   'Target IP',
			tooltip: 'The IP of the JustMacros instance',
			width:   6,
			regex:   self.REGEX_IP
		}
	]
}

/**
 * Clean up the instance before it is destroyed.
 *
 * @public
 * @since 1.0.0
 */
instance.prototype.destroy = function() {
	var self = this;
	debug("destroy");
}

/**
 * Main initialization function called once the module
 * is OK to start doing things.
 *
 * @public
 * @since 1.0.0
 */
instance.prototype.init = function() {
	var self = this;

	self.status(self.STATE_OK);

	debug = self.debug;
	log = self.log;
}

/**
 * Process an updated configuration array
 *
 * @param {Array} config - the new configuration
 * @public
 * @since 1.0.0
 */
instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;
}

instance_skel.extendedBy(instance);

exports = module.exports = instance;
