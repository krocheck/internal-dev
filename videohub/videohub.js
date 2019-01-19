// BlackMagic Design VideoHub

var tcp = require('../../tcp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// Request id counter
	self.request_id = 0;
	self.stash = [];
	self.command = null;

	self.input_labels = {};
	self.output_labels = {};
	self.routing = {};
	self.has_data = false;
	self.selected = 0;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.updateRouting = function(labeltype, object) {
	var self = this;

	for (var key in object) {

		var parsethis = object[key];
		var a = parsethis.split(/ /);
		var dest = a.shift();
		var src = a.join(" ");

		// TODO: update feedback with info from here.

		self.routing[dest] = src;

	}

};

instance.prototype.updateLabels = function(labeltype, object) {
	var self = this;

	if (labeltype == 'INPUT LABELS') {
		for (var key in object) {
			var parsethis = object[key];
			var a = parsethis.split(/ /);
			var num = a.shift();
			var label = a.join(" ");
			self.input_labels[num] = label;

			self.setVariable('input_' + (parseInt(num) + 1), label);
		}
	}
	else if (labeltype == 'OUTPUT LABELS') {
		for (var key in object) {
			var parsethis = object[key];
			var a = parsethis.split(/ /);
			var num = a.shift();
			var label = a.join(" ");
			self.output_labels[num] = label;

			self.setVariable('output_' + (parseInt(num) + 1), label);
		}
	}

	self.actions();
	// TODO: update labels in action selection!

};

instance.prototype.videohubInformation = function(key,data) {
	var self = this;

	if (key.match(/(INPUT|OUTPUT) LABELS/)) {
		self.updateLabels(key,data);
		self.has_data = true;
		self.update_variables()
	}
	else if (key == 'VIDEO OUTPUT ROUTING') {
		self.updateRouting(key,data);
		self.has_data = true;
		self.update_variables()

		self.checkFeedbacks('input_bg');
		self.checkFeedbacks('selected_source');
	}

	else {
		// TODO: find out more about the video hub from stuff that comes in here
	}

};

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;
	self.init_tcp();
};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.videohub_sources = [];
	self.videohub_destinations = [];

	self.init_tcp();

	self.update_variables(); // export variables
};

instance.prototype.init_tcp = function() {
	var self = this;
	var receivebuffer = '';

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	if (self.config.port === undefined) {
		self.config.port = 9990;
	}

	if (self.config.host) {
		self.socket = new tcp(self.config.host, self.config.port);

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.socket.on('error', function (err) {
			debug("Network error", err);
			self.log('error',"Network error: " + err.message);
		});

		self.socket.on('connect', function () {
			debug("Connected");
		});

		// separate buffered stream into lines with responses
		self.socket.on('data', function (chunk) {
			var i = 0, line = '', offset = 0;
			receivebuffer += chunk;
			while ( (i = receivebuffer.indexOf('\n', offset)) !== -1) {
				line = receivebuffer.substr(offset, i - offset);
				offset = i + 1;
				self.socket.emit('receiveline', line.toString());
			}
			receivebuffer = receivebuffer.substr(offset);
		});

		self.socket.on('receiveline', function (line) {

			if (self.command === null && line.match(/:/) ) {
				self.command = line;
			}
			else if (self.command !== null && line.length > 0) {
				self.stash.push(line.trim());
			}
			else if (line.length === 0 && self.command !== null) {
				var cmd = self.command.trim().split(/:/)[0];

				self.videohubInformation(cmd, self.stash);

				self.stash = [];
				self.command = null;
			}
			else {
				debug("weird response from videohub", line, line.length);
			}

		});

	}
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;

	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'This module will connect to any BlackmagicDesign VideoHub Device.'
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Videohub IP',
			width: 6,
			default: '192.168.10.150',
			regex: self.REGEX_IP
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
	}

	debug("destroy", self.id);;
};

instance.prototype.update_variables = function (system) {
	var self = this;
	var variables = [];

	for (var input_index in self.input_labels) {
		var inp = parseInt(input_index)+1;

		variables.push({
			label: 'Label of input ' + inp,
			name: 'input_' + inp
		});

		if (self.has_data) {
			self.setVariable('input_' + inp, self.input_labels[input_index]);
		}
	}

	for (var output_index in self.output_labels) {
		var outp = parseInt(output_index)+1;

		variables.push({
			label: 'Label of output ' + outp,
			name: 'output_' + outp
		});

		if (self.has_data) {
			self.setVariable('output_' + outp, self.output_labels[output_index]);
		}
	}

	for (var output_index in self.output_labels) {
		var outp = parseInt(output_index)+1;

		variables.push({
			label: 'Label of input routed to output ' + outp,
			name: 'output_' + outp + '_input'
		});

		if (self.has_data) {
			self.setVariable('output_' + outp + '_input', self.input_labels[self.routing[output_index]]);
		}
	}

	variables.push({
		label: 'Label of selected destination',
		name: 'selected_destination'
	});

	if (self.has_data) {
		self.setVariable('selected_destination', self.input_labels[self.selected]);
	}

	variables.push({
		label: 'Label of input routed to selection',
		name: 'selected_source'
	});

	if (self.has_data) {
		self.setVariable('selected_source', self.input_labels[self.routing[self.selected]]);
	}

	self.setVariableDefinitions(variables);

	self.videohub_sources.length = 0;
	self.videohub_destinations.length = 0;

	for (var input_index in self.input_labels) {
		var inp = parseInt(input_index)+1;
		self.videohub_sources.push({ id: input_index, label: inp + ": " + self.input_labels[input_index] });
	}

	for (var output_index in self.output_labels) {
		var outp = parseInt(output_index)+1;
		self.videohub_destinations.push({ id: output_index, label: outp + ": " + self.output_labels[output_index] });
	}

	// feedbacks
	var feedbacks = {};

	feedbacks['input_bg'] = {
		label: 'Change background color by destination',
		description: 'If the input specified is in use by the output specified, change background color of the bank',
		options: [
			{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: self.rgb(255,255,255)
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: self.rgb(255,0,0)
			},
			{
				type: 'dropdown',
				label: 'Input',
				id: 'input',
				default: '0',
				choices: self.videohub_sources
			},
			{
				type: 'dropdown',
				label: 'Output',
				id: 'output',
				default: '0',
				choices: self.videohub_destinations
			}
		]
	};

	feedbacks['selected_destination'] = {
		label: 'Change background color by selected destination',
		description: 'If the input specified is in use by the selected output specified, change background color of the bank',
		options: [
			{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: self.rgb(0,0,0)
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: self.rgb(255,255,0)
			},
			{
				type: 'dropdown',
				label: 'Output',
				id: 'output',
				default: '0',
				choices: self.videohub_destinations
			}
		]
	};

	feedbacks['selected_source'] = {
		label: 'Change background color by route to selected destination',
		description: 'If the input specified is in use by the selected output specified, change background color of the bank',
		options: [
			{
				type: 'colorpicker',
				label: 'Foreground color',
				id: 'fg',
				default: self.rgb(0,0,0)
			},
			{
				type: 'colorpicker',
				label: 'Background color',
				id: 'bg',
				default: self.rgb(255,255,0)
			},
			{
				type: 'dropdown',
				label: 'Input',
				id: 'input',
				default: '0',
				choices: self.videohub_sources
			}
		]
	};

	self.setFeedbackDefinitions(feedbacks);
};

instance.prototype.feedback = function(feedback, bank) {
	var self = this;

	if (feedback.type = 'input_bg') {
		if (self.routing[parseInt(feedback.options.output)] == parseInt(feedback.options.input)) {
			return {
				color: feedback.options.fg,
				bgcolor: feedback.options.bg
			};
		}
	}
};

instance.prototype.actions = function() {
	var self = this;

	self.system.emit('instance_actions', self.id, {

		'rename_destination': {
			label: 'Rename destination',
			options: [
				{
					type: 'textinput',
					label: 'New label',
					id: 'label',
					default: "Dest name"
				},
				{
					type: 'dropdown',
					label: 'Destination',
					id: 'destination',
					default: '0',
					choices: self.videohub_destinations
				}
			]
		},

		'rename_source': {
			label: 'Rename source',
			options: [
				{
					type: 'dropdown',
					label: 'Source',
					id: 'source',
					default: '0',
					choices: self.videohub_sources
				},
				{
					type: 'textinput',
					label: 'New label',
					id: 'label',
					default: "Src name"
				},
			]
		},

		'route': {
			label: 'Route',
			options: [
				{
					type: 'dropdown',
					label: 'Source',
					id: 'source',
					default: '0',
					choices: self.videohub_sources
				},
				{
					type: 'dropdown',
					label: 'Destination',
					id: 'destination',
					default: '0',
					choices: self.videohub_destinations
				}
			]
		},

		'select_destination': {
			label: 'Select destination',
			options: [
				{
					type: 'dropdown',
					label: 'Destination',
					id: 'destination',
					default: '0',
					choices: self.videohub_destinations
				}
			]
		},

		'route_source': {
			label: 'Route source to selected destination',
			options: [
				{
					type: 'dropdown',
					label: 'Source',
					id: 'source',
					default: '0',
					choices: self.videohub_sources
				}
			]
		}

	});
}

instance.prototype.action = function(action) {

	var self = this;
	var cmd;

	if (action.action === 'route') {
		cmd = "VIDEO OUTPUT ROUTING:\n"+action.options.destination+" "+action.options.source+"\n\n";
	}
	else if (action.action === 'rename_source') {
		cmd = "INPUT LABELS:\n"+action.options.source+" "+action.options.label+"\n\n";
	}
	else if (action.action === 'rename_destination') {
		cmd = "OUTPUT LABELS:\n"+action.options.destination+" "+action.options.label+"\n\n";
	}
	else if ( action.action === 'select_destination') {
		this.selected = action.options.destination;
		self.checkFeedbacks('selected_destination');
		self.checkFeedbacks('selected_source');
	}
	else if ( action.action === 'route_source') {
		cmd = "VIDEO OUTPUT ROUTING:\n"+this.selected+" "+action.options.source+"\n\n";
	}

	if (cmd !== undefined) {

		if (self.socket !== undefined && self.socket.connected) {
			self.socket.send(cmd);
		} else {
			debug('Socket not connected :(');
		}
	}
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
