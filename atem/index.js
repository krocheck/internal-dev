var instance_skel = require('../../instance_skel');
var Atem = require('atem-connection').Atem;
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	self.model = {};
	self.states = {};

	self.inputs = {};

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	return self;
}

instance.prototype.CONFIG_MODEL = {
	0: { id: 0, label: 'Auto Detect',          inputs: 8,  auxes: 3, MEs: 1, USKs: 1, DSKs: 2, macros: 100 },
	1: { id: 1, label: 'TV Studio',            inputs: 8,  auxes: 1, MEs: 1, USKs: 1, DSKs: 2, macros: 100 },
	2: { id: 2, label: '1 ME Production',      inputs: 8,  auxes: 3, MEs: 1, USKs: 4, DSKs: 2, macros: 100 },
	3: { id: 3, label: '2 ME Production',      inputs: 16, auxes: 6, MEs: 2, USKs: 4, DSKs: 2, macros: 100 },
	4: { id: 4, label: 'Production Studio 4K', inputs: 8,  auxes: 1, MEs: 1, USKs: 1, DSKs: 2, macros: 100 },
	5: { id: 5, label: '1 ME Production 4K',   inputs: 10, auxes: 3, MEs: 1, USKs: 4, DSKs: 2, macros: 100 },
	6: { id: 6, label: '2 ME Production 4K',   inputs: 20, auxes: 6, MEs: 2, USKs: 2, DSKs: 2, macros: 100 },
	7: { id: 7, label: '4 ME Broadcast 4K',    inputs: 20, auxes: 6, MEs: 4, USKs: 4, DSKs: 2, macros: 100 },
	8: { id: 8, label: 'TV Studio HD',         inputs: 8,  auxes: 1, MEs: 1, USKs: 1, DSKs: 2, macros: 100 },
	//9: { id: 9, label: '4ME?',                 inputs: 20, auxes: 6, MEs: 4, USKs: 4, DSKs: 2 }
};

instance.prototype.CHOICES_MACROSTATE = [
	{ id: 'isRunning', label: 'Is Running' },
	{ id: 'isWaiting', label: 'Is Waiting' }
];

instance.prototype.CHOICES_MODEL = Object.values(instance.prototype.CONFIG_MODEL);

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.model = self.CONFIG_MODEL[self.config.modelID];

	self.status(self.STATE_UNKNOWN);

	// Unfortunately this is redundant if the switcher goes
	// online right away, but necessary for offline programming
	self.init_variables();
	self.init_feedbacks();
	self.init_presets();

	self.atem = new Atem({ externalLog: self.debug.bind(self) });
	self.atem.on('connected', function () {
		self.status(self.STATE_OK);
	});
	self.atem.on('error', function (e) {
		self.status(self.STATUS_ERROR, 'Error');
	});
	self.atem.on('disconnected', function () {
		self.status(self.STATUS_UNKNOWN, 'Disconnected');
	});

	if (self.config.host !== undefined) {
		self.atem.connect(self.config.host);
	}

	self.atem.on('stateChanged', function(err, state) {

		switch (state.constructor.name) {
			case 'AuxSourceCommand':
				self.states['aux' + state.auxBus] = state.properties.source;

				self.checkFeedbacks('aux_bg');
				break;

			case 'PreviewInputCommand':
				self.states['preview' + state.mixEffect] = state.properties.source;
				if (self.inputs[state.properties.source] !== undefined) {
					self.setVariable('pvw' + (state.mixEffect + 1) + '_input', self.inputs[state.properties.source].shortName);
				}

				self.checkFeedbacks('preview_bg');
				break;

			case 'ProgramInputCommand':
				self.states['program' + state.mixEffect] = state.properties.source;
				if (self.inputs[state.properties.source] !== undefined) {
					self.setVariable('pgm' + (state.mixEffect + 1) + '_input', self.inputs[state.properties.source].shortName);
				}

				self.checkFeedbacks('program_bg');
				break;

			case 'InputPropertiesCommand':
				self.inputs[state.inputId] = state.properties;

				// resend everything, since names of routes might have changed
				self.init_variables();
				break;

			case 'InitCompleteCommand':
				debug('Init done');
				self.actions();
				self.init_variables();
				self.init_feedbacks();
				self.init_presets();
				self.log('info', 'Connected to a ' + self.deviceName);
				break;

			case 'DownstreamKeyStateCommand':
				self.states['dsk' + state.downstreamKeyerId] = state.properties.onAir;
				self.checkFeedbacks('dsk_bg');
				break;

			case 'MixEffectKeyOnAirCommand':
				self.states['usk' + state.mixEffect + '-' + state.upstreamKeyerId] = state.properties.onAir;
				self.checkFeedbacks('usk_bg');
				break;

			case 'ProductIdentifierCommand':
				// Testing we have a valid model and that instance is set for auto-detect OR is set for the same model as connected
				if (state.properties.model > 0 && (self.config.modelID == 0 || (self.config.modelID > 0 && self.config.modelID == state.properties.model))) {
					if ( self.config.modelID == 0) {
						self.model = self.CONFIG_MODEL[state.properties.model];
					}

					debug('ATEM Model: ' + self.model.id);
					self.deviceName = state.properties.deviceName;
				}
				else if (state.properties.model > 0) {
					self.log('error', 'Connected to a ' + state.properties.deviceName + ', but instance is configured for ' + this.model.label + '.  Change instance to \'Auto Detect\' or the appropriate model to ensure stability.');
					debug('ATEM Model: ' + state.properties.model);
				}
				else {
					debug('ATEM Model: ' + state.properties.model + 'NOT FOUND');
				}
				break;

			case 'MacroRunStatusCommand':
				if (state.properties.macroIndex >= 0 && self.states['macro_'+(state.properties.macroIndex+1)] !== undefined) {
					self.states['macro_'+(self.properties.macroIndex+1)] = state.properties;
					self.checkFeedbacks('macro');
				}
				break;
		}
	});
};

instance.prototype.init_feedbacks = function() {
	var self = this;

	// feedbacks
	var feedbacks = {};

	feedbacks['preview_bg'] = {
		label: 'Change colors from preview',
		description: 'If the input specified is in use by preview on the M/E stage specified, change colors of the bank',
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
				default: self.rgb(0,255,0)
			},
			{
				type: 'dropdown',
				label: 'Input',
				id: 'input',
				default: 1,
				choices: self.CHOICES_INPUTS
			},
			{
				type: 'dropdown',
				id: 'mixeffect',
				label: 'M/E',
				default: 0,
				choices: self.CHOICES_ME.slice(0, self.model.MEs)
			}
		]
	};
	feedbacks['program_bg'] = {
		label: 'Change colors from program',
		description: 'If the input specified is in use by program on the M/E stage specified, change colors of the bank',
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
				default: 1,
				choices: self.CHOICES_INPUTS
			},
			{
				type: 'dropdown',
				id: 'mixeffect',
				label: 'M/E',
				default: 0,
				choices: self.CHOICES_ME.slice(0, self.model.MEs)
			}
		]
	};
	feedbacks['aux_bg'] = {
		label: 'Change colors from AUX bus',
		description: 'If the input specified is in use by the aux bus specified, change colors of the bank',
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
				default: 1,
				choices: self.CHOICES_INPUTS
			},
			{
				type: 'dropdown',
				id: 'aux',
				label: 'AUX',
				default: 0,
				choices: self.CHOICES_AUXES.slice(0, self.model.auxes)
			}
		]
	};
	feedbacks['usk_bg'] = {
		label: 'Change background from upstream keyer state',
		description: 'If the specified upstream keyer is active, change color of the bank',
		options: [
			{
				type: 'colorpicker',
				label: 'Color',
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
				id: 'mixeffect',
				label: 'M/E',
				default: 0,
				choices: self.CHOICES_ME.slice(0, self.model.MEs)
			},
			{
				type: 'dropdown',
				label: 'Key',
				id: 'key',
				default: '0',
				choices: self.CHOICES_USKS.slice(0, self.model.USKs)
			}
		]
	};
	feedbacks['dsk_bg'] = {
		label: 'Change background from downstream keyer state',
		description: 'If the specified downstream keyer is active, change color of the bank',
		options: [
			{
				type: 'colorpicker',
				label: 'Color',
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
				label: 'Key',
				id: 'key',
				default: '0',
				choices: self.CHOICES_DSKS.slice(0, self.model.DSKs)
			}
		]
	};
	feedbacks['macro'] = {
		label: 'Change background from macro state',
		description: 'If the specified macro is running or waiting, change color of the bank',
		options: [
			{
				type:   'colorpicker',
				label:  'Color',
				id:     'fg',
				default: self.rgb(255,255,255)
			},
			{
				type:   'colorpicker',
				label:  'Background color',
				id:     'bg',
				default: self.rgb(238,238,0)
			},
			{
				type:    'textinput',
				label:   'Macro Number (1-100)',
				id:      'macroIndex',
				default: '1',
				regex:   '/^([1-9]|[1-9][0-9]|100)$/'
			},
			{
				type:    'dropdown',
				label:   'State',
				id:      'state',
				default: 'isWaiting',
				choices: self.CHOICES_MACROSTATE
			}
		]
	};
	self.setFeedbackDefinitions(feedbacks);
};

instance.prototype.init_variables = function() {
	var self = this;

	// variable_set
	var variables = [];

	// Initialize macro states (not the best spot for it, but it works)
	// Eventually will include macro name variables
	for (var i = 0; i < self.model.macros; ++i) {
		self.states['macro_'+(i+1)] = { isRunning: 0, isWaiting: 0, loop: 0, macroIndex: i };
	}

	for (var i = 0; i < self.model.MEs; ++i) {
		variables.push({
			label: 'Label of input active on program bus (M/E ' + (i+1) + ')',
			name: 'pgm' + (i+1) + '_input'
		});
		if (self.inputs[self.states['program' + i]] !== undefined) {
			self.setVariable('pgm' + (i+1) + '_input', self.inputs[self.states['program' + i]].shortName);
		}
		variables.push({
			label: 'Label of input active on preview bus (M/E ' + (i+1) + ')',
			name: 'pvw' + (i+1) + '_input'
		});
		if (self.inputs[self.states['preview' + i]] !== undefined) {
			self.setVariable('pvw' + (i+1) + '_input', self.inputs[self.states['preview' + i]].shortName);
		}
	}

	for (var key in self.inputs) {
		variables.push({
			label: 'Long name of input id ' + key,
			name: 'long_' + key
		});
		variables.push({
			label: 'Short name of input id ' + key,
			name: 'short_' + key
		});

		if (self.inputs[key] !== undefined) {
			self.setVariable('long_' + key, self.inputs[key].longName);
			self.setVariable('short_' + key, self.inputs[key].shortName);
		}
	}
	self.setVariableDefinitions(variables);
};

instance.prototype.init_presets = function () {
	var self = this;
	var presets = [];

	for (var me = 0; me < self.model.MEs; ++me) {
		for (var input in self.inputs) {
			presets.push({
				category: 'Preview (M/E ' + (me+1) + ')',
				label: 'Preview button for ' + self.inputs[input].shortName,
				bank: {
					style: 'text',
					text: '$(attem:short_' + input + ')',
					size: '18',
					color: '16777215',
					bgcolor: 0
				},
				feedbacks: [
					{
						type: 'preview_bg',
						options: {
							bg: 65280,
							fg: 16777215,
							input: input,
							mixeffect: me
						}
					}
				],
				actions: [
					{
						action: 'preview',
						options: {
							mixeffect: me,
							input: input
						}
					}
				]
			});
			presets.push({
				category: 'Program (M/E ' + (me+1) + ')',
				label: 'Program button for ' + self.inputs[input].shortName,
				bank: {
					style: 'text',
					text: '$(attem:short_' + input + ')',
					size: '18',
					color: '16777215',
					bgcolor: 0
				},
				feedbacks: [
					{
						type: 'program_bg',
						options: {
							bg: 16711680,
							fg: 16777215,
							input: input,
							mixeffect: me
						}
					}
				],
				actions: [
					{
						action: 'program',
						options: {
							mixeffect: me,
							input: input
						}
					}
				]
			});
		}
	}

	for (var i = 0; i < self.model.auxes; ++i) {
		for (var input in self.inputs) {
			presets.push({
				category: 'AUX ' + (i+1),
				label: 'AUX' + (i+1) + ' button for ' + self.inputs[input].shortName,
				bank: {
					style: 'text',
					text: '$(attem:short_' + input + ')',
					size: '18',
					color: '16777215',
					bgcolor: 0
				},
				feedbacks: [
					{
						type: 'aux_bg',
						options: {
							bg: 16776960,
							fg: 0,
							input: input,
							aux: i
						}
					}
				],
				actions: [
					{
						action: 'aux',
						options: {
							aux: i,
							input: input
						}
					}
				]
			});
		}
	}

	// Upstream keyers
	for (var me = 0; me < self.model.MEs; ++me) {
		for (var i = 0; i < self.model.USKs; ++i) {
			presets.push({
				category: 'KEYs',
				label: 'Toggle upstream KEY' + (i+1) + '(M/E ' + (me+1) + ')',
				bank: {
					style: 'text',
					text: 'KEY ' + (i+1),
					size: 'auto',
					color: self.rgb(255,255,255),
					bgcolor: 0
				},
				feedbacks: [
					{
						type: 'usk_bg',
						options: {
							bg: self.rgb(255,0,0),
							fg: self.rgb(255,255,255),
							key: i,
							mixeffect: me
						}
					}
				],
				actions: [
					{
						action: 'usk',
						options: {
							onair: 'toggle',
							key: i,
							mixeffect: me
						}
					}
				]
			});
		}
	}

	// Downstream keyers
	for (var i = 0; i < self.model.DSKs; ++i) {
		presets.push({
			category: 'KEYs',
			label: 'Toggle downstream KEY' + (i+1),
			bank: {
				style: 'text',
				text: 'DSK ' + (i+1),
				size: 'auto',
				color: self.rgb(255,255,255),
				bgcolor: 0
			},
			feedbacks: [
				{
					type: 'dsk_bg',
					options: {
						bg: self.rgb(255,0,0),
						fg: self.rgb(255,255,255),
						key: i
					}
				}
			],
			actions: [
				{
					action: 'dsk',
					options: {
						onair: 'toggle',
						key: i
					}
				}
			]
		});
	}

	// Macros
	for (var i = 0; i < self.model.macros; ++i) {
		presets.push({
			category: 'MACROS',
			label: 'Macro ' + (i+1),
			bank: {
				style:   'text',
				text:    'Macro ' + (i+1),
				size:    '18',
				color:   self.rgb(255,255,255),
				bgcolor: self.rgb(0,0,0)
			},
			feedbacks: [
				{
					type: 'macro',
					options: {
						bg:         self.rgb(238,238,0),
						fg:         self.rgb(255,255,255),
						macroIndex: (i+1),
						state:      'isWaiting'
					}
				},
				{
					type: 'macro',
					options: {
						bg:         self.rgb(0,238,0),
						fg:         self.rgb(255,255,255),
						macroIndex: (i+1),
						state:      'isRunning'
					}
				}
			],
			actions: [
				{
					action: 'macrorun',
					options: {
						macro: (i+1)
					}
				}
			]
		});
	}
	self.setPresetDefinitions(presets);
}

instance.prototype.feedback = function(feedback, bank) {
	var self = this;

	if (feedback.type == 'preview_bg') {
		if (self.states['preview' + feedback.options.mixeffect] == parseInt(feedback.options.input)) {
			return { color: feedback.options.fg, bgcolor: feedback.options.bg };
		}
	}
	else if (feedback.type == 'program_bg') {
		if (self.states['program' + feedback.options.mixeffect] == parseInt(feedback.options.input)) {
			return { color: feedback.options.fg, bgcolor: feedback.options.bg };
		}
	}
	else if (feedback.type == 'aux_bg') {
		if (self.states['aux' + feedback.options.aux] == parseInt(feedback.options.input)) {
			return { color: feedback.options.fg, bgcolor: feedback.options.bg };
		}
	}
	else if (feedback.type == 'usk_bg') {
		if (self.states['usk' + feedback.options.mixeffect + '-' + feedback.options.key]) {
			return { color: feedback.options.fg, bgcolor: feedback.options.bg };
		}
	}
	else if (feedback.type == 'dsk_bg') {
		if (self.states['dsk' + feedback.options.key]) {
			return { color: feedback.options.fg, bgcolor: feedback.options.bg };
		}
	}
	else if (feedback.type == 'macro') {
		var state = self.states['macro_' + feedback.options.macroIndex];

		if (state.macroIndex == (parseInt(feedback.options.macroIndex)-1)) {
			if (( feedback.options.state == 'isRunning' && state.isRunning == 1 ) ||
			    ( feedback.options.state == 'isWaiting' && state.isWaiting == 1 )) {
				return { color: feedback.options.fg, bgcolor: feedback.options.bg };
			}
		}
	}
	return {};
};

instance.prototype.updateConfig = function(config) {
	var self = this;
	self.config = config;

	if (self.config.host !== undefined) {
		if (self.atem !== undefined && self.atem.socket !== undefined && self.atem.socket._socket !== undefined) {
			try {
				self.atem.disconnect();
			} catch (e) {}
		}

		self.atem.connect(self.config.host);
	}
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
	return [
		{
			type:    'text',
			id:      'info',
			width:   12,
			label:   'Information',
			value:   'Should work with all models of Blackmagic Design ATEM mixers.<br />In general this should be left in \'Auto Detect\', however a specific model can be selected below for offline programming.'
		},
		{
			type:    'textinput',
			id:      'host',
			label:   'Target IP',
			width:   6,
			regex:   self.REGEX_IP
		},
		{
			type:    'dropdown',
			id:      'modelID',
			label:   'Model',
			choices: self.CHOICES_MODEL,
			default: 0
}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.atem !== undefined) {
		self.atem.disconnect();
		delete self.atem;
	}
	debug("destroy", self.id);
};

instance.prototype.actions = function(system) {
	var self = this;

	self.CHOICES_INPUTS = [
		{ label: 'Black', id: 0 }
	];
	for (var i = 1; i <= self.model.inputs; ++i) {
		self.CHOICES_INPUTS.push({
			label: 'Input ' + i,
			id: i
		});
	}
	self.CHOICES_INPUTS.push({ label: 'Bars', id: 1000 });
	self.CHOICES_INPUTS.push({ label: 'Color 1', id: 2001 });
	self.CHOICES_INPUTS.push({ label: 'Color 2', id: 2002 });

	self.CHOICES_INPUTS.push({ label: 'Mediaplayer 1', id: 3010 });
	self.CHOICES_INPUTS.push({ label: 'Mediaplayer 1 Key', id: 3011 });
	self.CHOICES_INPUTS.push({ label: 'Mediaplayer 2', id: 3020 });
	self.CHOICES_INPUTS.push({ label: 'Mediaplayer 2 Key', id: 3021 });

	if (self.model.MEs >= 4) {
		self.CHOICES_INPUTS.push({ label: 'Mediaplayer 3', id: 3030 });
		self.CHOICES_INPUTS.push({ label: 'Mediaplayer 3 Key', id: 3031 });
		self.CHOICES_INPUTS.push({ label: 'Mediaplayer 4', id: 3040 });
		self.CHOICES_INPUTS.push({ label: 'Mediaplayer 4 Key', id: 3041 });
	}

	self.CHOICES_INPUTS.push({ label: 'Super Source', id: 6000 });
	self.CHOICES_INPUTS.push({ label: 'Clean Feed 1', id: 7001 });
	self.CHOICES_INPUTS.push({ label: 'Clean Feed 2', id: 7002 });

	self.CHOICES_INPUTS.push({ label: 'ME 1 Program', id: 10010 });
	self.CHOICES_INPUTS.push({ label: 'ME 1 Preview', id: 10011 });

	if (self.model.MEs >= 2) {
		self.CHOICES_INPUTS.push({ label: 'ME 2 Program', id: 10020 });
		self.CHOICES_INPUTS.push({ label: 'ME 2 Preview', id: 10021 });
	}

	if (self.model.MEs >= 3) {
		self.CHOICES_INPUTS.push({ label: 'ME 3 Program', id: 10030 });
		self.CHOICES_INPUTS.push({ label: 'ME 3 Preview', id: 10031 });
	}

	if (self.model.MEs >= 4) {
		self.CHOICES_INPUTS.push({ label: 'ME 4 Program', id: 10040 });
		self.CHOICES_INPUTS.push({ label: 'ME 4 Preview', id: 10041 });
	}

	self.CHOICES_AUXES = [
		{ label: '1', id: 0 },
		{ label: '2', id: 1 },
		{ label: '3', id: 2 },
		{ label: '4', id: 3 },
		{ label: '5', id: 4 },
		{ label: '6', id: 5 },
	];

	self.CHOICES_USKS = [
		{ label: '1', id: 0 },
		{ label: '2', id: 1 },
		{ label: '3', id: 2 },
		{ label: '4', id: 3 },
	];

	self.CHOICES_DSKS = [
		{ label: '1', id: 0 },
		{ label: '2', id: 1 },
	];

	self.CHOICES_ME = [
		{ label: 'M/E 1', id: 0 },
		{ label: 'M/E 2', id: 1 },
		{ label: 'M/E 3', id: 2 },
		{ label: 'M/E 4', id: 3 }
	];

	self.system.emit('instance_actions', self.id, {
		'program': {
			label: 'Set input on Program',
			options: [
				{
					 type: 'dropdown',
					 label: 'Input',
					 id: 'input',
					 default: 1,
					 choices: self.CHOICES_INPUTS
				},
				{
					type: 'dropdown',
					id: 'mixeffect',
					label: 'M/E',
					default: 0,
					choices: self.CHOICES_ME.slice(0, self.model.MEs)
				}
			]
		},
		'preview': {
			label: 'Set input on Preview',
			options: [
				{
					 type: 'dropdown',
					 label: 'Input',
					 id: 'input',
					 default: 1,
					 choices: self.CHOICES_INPUTS
				},
				{
					type: 'dropdown',
					id: 'mixeffect',
					label: 'M/E',
					default: 0,
					choices: self.CHOICES_ME.slice(0, self.model.MEs)
				}
			]
		},
		'aux': {
			label: 'Set AUX bus',
			options: [
				{
					type: 'dropdown',
					id: 'aux',
					label: 'AUX Output',
					default: 0,
					choices: self.CHOICES_AUXES.slice(0, self.model.auxes)
				},
				{
					 type: 'dropdown',
					 label: 'Input',
					 id: 'input',
					 default: 1,
					 choices: self.CHOICES_INPUTS
				}
			]
		},
		'usk': {
			label: 'Set Upstream KEY OnAir',
			options: [
				{
					id: 'onair',
					type: 'dropdown',
					label: 'On Air',
					default: 'true',
					choices: [ { label: 'On Air', id: 'true' }, { label: 'Off', id: 'false' }, { label: 'Toggle', id: 'toggle' }]
				},
				{
					type: 'dropdown',
					id: 'mixeffect',
					label: 'M/E',
					default: 0,
					choices: self.CHOICES_ME.slice(0, self.model.MEs)
				},
				{
					type: 'dropdown',
					label: 'Key',
					id: 'key',
					default: '0',
					choices: self.CHOICES_USKS.slice(0, self.model.USKs)
				}
			]
		},
		'dsk': {
			label: 'Set Downstream KEY OnAir',
			options: [
				{
					id: 'onair',
					type: 'dropdown',
					label: 'On Air',
					default: 'true',
					choices: [ { label: 'On Air', id: 'true' }, { label: 'Off', id: 'false' }, { label: 'Toggle', id: 'toggle' }]
				},
				{
					type: 'dropdown',
					label: 'Key',
					id: 'key',
					default: '0',
					choices: self.CHOICES_DSKS.slice(0, self.model.DSKs)
				}
			]
		},
		'cut': {
			label: 'CUT operation',
			options: [
				{
					type: 'dropdown',
					id: 'mixeffect',
					label: 'M/E',
					default: 0,
					choices: self.CHOICES_ME.slice(0, self.model.MEs)
				}
			]
		},
		'auto': {
			label: 'AUTO transition operation',
			options: [
				{
					type: 'dropdown',
					id: 'mixeffect',
					label: 'M/E',
					default: 0,
					choices: self.CHOICES_ME.slice(0, self.model.MEs)
				}
			]
		},
		'macrorun': {
			label: 'Run MACRO',
			options: [
				{
					type: 'textinput',
					id: 'macro',
					label: 'Macro number',
					default: 1,
					regex: '/^([1-9]|[1-9][0-9]|100)$/'
				}
			]
		}
	});
};

instance.prototype.action = function(action) {
	var self = this;
	var id = action.action;
	var cmd;
	var opt = action.options;

	// avplayback port 7000
	switch (action.action) {

		case 'program':
			self.atem.changeProgramInput(parseInt(opt.input), parseInt(opt.mixeffect));
			break;

		case 'preview':
			self.atem.changePreviewInput(parseInt(opt.input), parseInt(opt.mixeffect));
			break;

		case 'aux':
			self.atem.setAuxSource(parseInt(opt.input), parseInt(opt.aux));
			break;

		case 'cut':
			self.atem.cut(parseInt(opt.mixeffect));
			break;

		case 'usk':
			if (opt.onair == 'toggle') {
				self.atem.setUpstreamKeyerOnAir(!self.states['usk' + opt.mixeffect + '-' + opt.key], parseInt(opt.mixeffect), parseInt(opt.key));
			} else {
				self.atem.setUpstreamKeyerOnAir(opt.onair == 'true', parseInt(opt.mixeffect), parseInt(opt.key));
			}
			break;

		case 'dsk':
			if (opt.onair == 'toggle') {
				self.atem.setDownstreamKeyOnAir(!self.states['dsk' + opt.key], parseInt(opt.key));
			} else {
				self.atem.setDownstreamKeyOnAir(opt.onair == 'true', parseInt(opt.key));
			}
			break;

		case 'auto':
			self.atem.autoTransition(parseInt(opt.mixeffect));
			break;

		case 'macrorun':
			self.atem.macroRun(parseInt(opt.macro) - 1);
			break;

		default:
			debug('Unknown action: ' + action.action);
	}

};

instance_skel.extendedBy(instance);

exports = module.exports = instance;
