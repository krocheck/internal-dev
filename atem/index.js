var instance_skel = require('../../instance_skel');
var Atem = require('atem-connection').Atem;
var debug;
var log;

/**
 * Companion instance class for the Blackmagic ATEM Switchers.
 *
 * @extends instance_skel
 * @since 1.0.0
 * @author Håkon Nessjøen <haakon@bitfocus.io>
 * @author Keith Rocheck <keith.rocheck@gmail.com>
 */
class instance extends instance_skel {

	/**
	 * Create an instance of an ATEM module.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @param {string} id - the instance ID
	 * @param {Object} config - saved user configuration parameters
	 * @since 1.0.0
	 */
	constructor(system, id, config) {
		super(system, id, config);
		var self = this;

		self.model       = {};
		self.states      = {};
		self.inputs      = {};
		self.deviceName  = '';
		self.deviceModel = 0;

		self.CONFIG_MODEL = {
			0: { id: 0, label: 'Auto Detect',          inputs: 8,  auxes: 3, MEs: 1, USKs: 1, DSKs: 2, MPs: 2, MVs: 1, macros: 100 },
			1: { id: 1, label: 'TV Studio',            inputs: 8,  auxes: 1, MEs: 1, USKs: 1, DSKs: 2, MPs: 2, MVs: 1, macros: 100 },
			2: { id: 2, label: '1 ME Production',      inputs: 8,  auxes: 3, MEs: 1, USKs: 4, DSKs: 2, MPs: 2, MVs: 1, macros: 100 },
			3: { id: 3, label: '2 ME Production',      inputs: 16, auxes: 6, MEs: 2, USKs: 4, DSKs: 2, MPs: 2, MVs: 2, macros: 100 },
			4: { id: 4, label: 'Production Studio 4K', inputs: 8,  auxes: 1, MEs: 1, USKs: 1, DSKs: 2, MPs: 2, MVs: 1, macros: 100 },
			5: { id: 5, label: '1 ME Production 4K',   inputs: 10, auxes: 3, MEs: 1, USKs: 4, DSKs: 2, MPs: 2, MVs: 1, macros: 100 },
			6: { id: 6, label: '2 ME Production 4K',   inputs: 20, auxes: 6, MEs: 2, USKs: 2, DSKs: 2, MPs: 2, MVs: 2, macros: 100 },
			7: { id: 7, label: '4 ME Broadcast 4K',    inputs: 20, auxes: 6, MEs: 4, USKs: 4, DSKs: 2, MPs: 4, MVs: 2, macros: 100 },
			8: { id: 8, label: 'TV Studio HD',         inputs: 8,  auxes: 1, MEs: 1, USKs: 1, DSKs: 2, MPs: 2, MVs: 1, macros: 100 },
			//9: { id: 9, label: '4ME?',                 inputs: 20, auxes: 6, MEs: 4, USKs: 4, DSKs: 2, macros: 100 }
		};

		self.CHOICES_AUXES = [
			{ id: 0, label: '1' },
			{ id: 1, label: '2' },
			{ id: 2, label: '3' },
			{ id: 3, label: '4' },
			{ id: 4, label: '5' },
			{ id: 5, label: '6' }
		];

		self.CHOICES_DSKS = [
			{ id: 0, label: '1' },
			{ id: 1, label: '2' }
		];

		self.CHOICES_KEYTRANS = [
			{ id: 'true',   label: 'On Air', },
			{ id: 'false',  label: 'Off', },
			{ id: 'toggle', label: 'Toggle', }
		];

		self.CHOICES_MACRORUN = [
			{ id: 'run',         label: 'Run' },
			{ id: 'runContinue', label: 'Run/Continue' }
		];

		self.CHOICES_MACROSTATE = [
			{ id: 'isRunning',   label: 'Is Running' },
			{ id: 'isWaiting',   label: 'Is Waiting' },
			{ id: 'isRecording', label: 'Is Recording' },
			{ id: 'isUsed'   ,   label: 'Is Used' }
		];

		self.CHOICES_ME = [
			{ id: 0, label: 'M/E 1' },
			{ id: 1, label: 'M/E 2' },
			{ id: 2, label: 'M/E 3' },
			{ id: 3, label: 'M/E 4' }
		];

		self.CHOICES_MODEL = Object.values(self.CONFIG_MODEL);

		self.CHOICES_MV = [
			{ id: 0, label: 'MV 1' },
			{ id: 1, label: 'MV 2' }
		];

		self.CHOICES_MVLAYOUT = [
			{ id: 0, label: 'Top' },
			{ id: 1, label: 'Bottom' },
			{ id: 2, label: 'Left' },
			{ id: 3, label: 'Right' }
		];

		self.setupMvWindowChoices();

		self.CHOICES_USKS = [
			{ id: 0, label: '1' },
			{ id: 1, label: '2' },
			{ id: 2, label: '3' },
			{ id: 3, label: '4' }
		];

		if (self.config.modelID !== undefined){
			self.model = self.CONFIG_MODEL[self.config.modelID];
		}
		else {
			self.model = self.CONFIG_MODEL[0];
		}

		// super-constructor
		//instance_skel.apply(this, arguments);
		self.actions(); // export actions
		//return self;
	}

	/**
	 * Setup the actions.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @access public
	 * @since 1.0.0
	 */
	actions(system) {
		var self = this;

		self.setupSourceChoices();

		self.system.emit('instance_actions', self.id, {
			'program': {
				label: 'Set input on Program',
				options: [
					{
						 type: 'dropdown',
						 label: 'Input',
						 id: 'input',
						 default: 1,
						 choices: self.CHOICES_MESOURCES
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
						 choices: self.CHOICES_MESOURCES
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
						 choices: self.CHOICES_AUXSOURCES
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
						choices: self.CHOICES_KEYTRANS
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
						choices: self.CHOICES_KEYTRANS
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
						type:    'textinput',
						id:      'macro',
						label:   'Macro number',
						default: 1,
						regex:   '/^([1-9]|[1-9][0-9]|100)$/'
					},
					{
						type:    'dropdown',
						id:      'action',
						label:   'Action',
						default: 'run',
						choices: self.CHOICES_MACRORUN
					}
				]
			},
			'macrocontinue': { label: 'Continue MACRO' },
			'macrostop':     { label: 'Stop MACROS' },
			'setMvLayout': {
				label: 'Change MV Layout',
				options: [
					{
						type:    'dropdown',
						id:      'mvId',
						label:   'MV',
						default: 0,
						choices: self.CHOICES_MV.slice(0, self.model.MVs)
					},
					{
						type:    'dropdown',
						id:      'layout',
						label:   'Layout',
						default: 0,
						choices: self.CHOICES_MVLAYOUT
					}
				]
			},
			'setMvWindow': {
				label: 'Change MV Window Source',
				options: [
					{
						type:    'dropdown',
						id:      'mvId',
						label:   'MV',
						default: 0,
						choices: self.CHOICES_MV.slice(0, self.model.MVs)
					},
					{
						type:    'dropdown',
						id:      'windowIndex',
						label:   'Window #',
						default: 2,
						choices: self.CHOICES_MVWINDOW
					},
					{
						type:    'dropdown',
						id:      'source',
						label:   'Source',
						default: 0,
						choices: self.CHOICES_MVSOURCES
					}
				]
			}
		});
	}

	/**
	 * Executes the provided action.
	 *
	 * @param {Object} action - the action to be executed
	 * @access public
	 * @since 1.0.0
	 */
	action(action) {
		var self = this;
		var id = action.action;
		var cmd;
		var opt = action.options;

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
				if (opt.action == 'runContinue' && self.states['macro_' + opt.macro].isWaiting == 1) {
					self.atem.macroContinue();
				}
				else if (self.states['macro_' + opt.macro].isRecording == 1) {
					self.atem.macroStopRecord()
				}
				else {
					self.atem.macroRun(parseInt(opt.macro) - 1);
				}
				break;
			case 'macrocontinue':
				self.atem.macroContinue();
				break;
			case 'macrostop':
				self.atem.macroStop();
				break;
			default:
				debug('Unknown action: ' + action.action);
		}
	}

	/**
	 * Creates the configuration fields for web config.
	 *
	 * @returns {Array} the config fields
	 * @access public
	 * @since 1.0.0
	 */
	config_fields () {
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
			},
			{
				type:    'text',
				id:      'info',
				width:   12,
				label:   'Information',
				value:   'Companion is able to re-route the Program and Preview multi viewer windows via the ATEM API.  By default this is disabled since there is no way through the ATEM software to change them back to their defaults.  These windows can be unlocked below, <b>but do so with caution!</b>'
			},
			{
				type:    'dropdown',
				id:      'mvUnlock',
				label:   'Unlock PGM / PV Multi Viewer Windows?',
				choices: self.CHOICES_YESNO_BOOLEAN,
				default: false
			}
		]
	};

	/**
	 * Clean up the instance before it is destroyed.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	destroy() {
		var self = this;

		if (self.atem !== undefined) {
			self.atem.disconnect();
			delete self.atem;
		}
		debug("destroy", self.id);
	};

	/**
	 * Processes a feedback state.
	 *
	 * @param {Object} feedback - the feedback type to process
	 * @param {Object} bank - the bank this feedback is associated with
	 * @returns {Object} feedback information for the bank
	 * @access public
	 * @since 1.0.0
	 */
	feedback(feedback, bank) {
		var self = this;
		var out  = {};

		if (feedback.type == 'preview_bg') {
			if (self.states['preview' + feedback.options.mixeffect] == parseInt(feedback.options.input)) {
				out = { color: feedback.options.fg, bgcolor: feedback.options.bg };
			}
		}
		else if (feedback.type == 'program_bg') {
			if (self.states['program' + feedback.options.mixeffect] == parseInt(feedback.options.input)) {
				out = { color: feedback.options.fg, bgcolor: feedback.options.bg };
			}
		}
		else if (feedback.type == 'aux_bg') {
			if (self.states['aux' + feedback.options.aux] == parseInt(feedback.options.input)) {
				out = { color: feedback.options.fg, bgcolor: feedback.options.bg };
			}
		}
		else if (feedback.type == 'usk_bg') {
			if (self.states['usk' + feedback.options.mixeffect + '-' + feedback.options.key]) {
				out = { color: feedback.options.fg, bgcolor: feedback.options.bg };
			}
		}
		else if (feedback.type == 'dsk_bg') {
			if (self.states['dsk' + feedback.options.key]) {
				out = { color: feedback.options.fg, bgcolor: feedback.options.bg };
			}
		}
		else if (feedback.type == 'macro') {
			var state = self.states['macro_' + feedback.options.macroIndex];

			if (state.macroIndex == (parseInt(feedback.options.macroIndex))) {
				if (( feedback.options.state == 'isRunning' && state.isRunning == 1 ) ||
					( feedback.options.state == 'isWaiting' && state.isWaiting == 1 ) ||
					( feedback.options.state == 'isRecording' && state.isRecording == 1 ) ||
					( feedback.options.state == 'isUsed' && state.isUsed == 1 )) {
					out = { color: feedback.options.fg, bgcolor: feedback.options.bg };
				}
			}
		}
		else if (feedback.type == 'mv_layout') {
			var state = self.states['mv_layout_' + feedback.mvId];

			if (state.mvId == (parseInt(feedback.mvId)) && state.layout == (parseInt(feedback.layout))) {
				out = { color: feedback.options.fg, bgcolor: feedback.options.bg };
			}
		}
		else if (feedback.type == 'mv_source') {
			var index = (parseInt(feedback.options.mvId)) & (parseInt(feedback.options.windowIndex));
			var state = self.states['mv_source_' + index];

			if (state.mvId == (parseInt(feedback.options.mvId)) && 
				state.windowIndex == (parseInt(feedback.options.windowIndex)) &&
				state.source == (parseInt(feedback.options.source))) {
					out = { color: feedback.options.fg, bgcolor: feedback.options.bg };
			}
		}

		return out;
	};

	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	init() {
		var self = this;

		debug = self.debug;
		log = self.log;

		self.status(self.STATE_UNKNOWN);

		// Unfortunately this is redundant if the switcher goes
		// online right away, but necessary for offline programming
		self.initVariables();
		self.initFeedbacks();
		self.initPresets();

		self.setupAtemConnection();
	};

	/**
	 * INTERNAL: initialize feedbacks.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initFeedbacks() {
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
					choices: self.CHOICES_SOURCES
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
					choices: self.CHOICES_SOURCES
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
					choices: self.CHOICES_SOURCES
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
			label: 'Change colors from upstream keyer state',
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
			label: 'Change colors from downstream keyer state',
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
			label: 'Change colors from macro state',
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

	/**
	 * INTERNAL: initialize presets.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initPresets () {
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
		for (var i = 1; i <= self.model.macros; i++) {
			presets.push({
				category: 'MACROS',
				label: 'Macro ' + i,
				bank: {
					style:   'text',
					text:    'Macro ' + i,
					size:    'auto',
					color:   self.rgb(255,255,255),
					bgcolor: self.rgb(0,0,0)
				},
				feedbacks: [
					{
						type: 'macro',
						options: {
							bg:         self.rgb(0,0,238),
							fg:         self.rgb(255,255,255),
							macroIndex: i,
							state:      'isUsed'
						}
					},
					{
						type: 'macro',
						options: {
							bg:         self.rgb(0,238,0),
							fg:         self.rgb(255,255,255),
							macroIndex: i,
							state:      'isRunning'
						}
					},
					{
						type: 'macro',
						options: {
							bg:         self.rgb(238,238,0),
							fg:         self.rgb(255,255,255),
							macroIndex: i,
							state:      'isWaiting'
						}
					},
					{
						type: 'macro',
						options: {
							bg:         self.rgb(238,0,0),
							fg:         self.rgb(255,255,255),
							macroIndex: i,
							state:      'isRecording'
						}
					}
				],
				actions: [
					{
						action: 'macrorun',
						options: {
							macro:  i,
							action: 'runContinue'
						}
					}
				]
			});
		}
		self.setPresetDefinitions(presets);
	}

	/**
	 * INTERNAL: initialize variables.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initVariables() {
		var self = this;

		// variable_set
		var variables = [];

		// PGM/PV busses
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

		// Input names
		for (var key in self.sources) {
			variables.push({
				label: 'Long name of input id ' + key,
				name: 'long_' + key
			});
			variables.push({
				label: 'Short name of input id ' + key,
				name: 'short_' + key
			});

			if (self.inputs[key] !== undefined) {
				self.setVariable('long_' + key,  self.inputs[key].longName);
				self.setVariable('short_' + key, self.inputs[key].shortName);
			}
			else {
				self.setVariable('long_' + key,  self.sources[key].label);
				self.setVariable('short_' + key, self.sources[key].shortName);
			}
		}

		// Macros
		for (var i = 1; i <= self.model.macros; i++) {

			if (self.states['macro_' + i] === undefined) {
				self.states['macro_' + i] = {
					macroIndex:  i,
					isRunning:   0,
					isWaiting:   0,
					isUsed:      0,
					isRecording: 0,
					loop:        0,
					name:        'Macro ' + i,
					description: ''
				};
			}

			variables.push({
				label: 'Name of macro id ' + i,
				name: 'macro_' + i
			});

			self.setVariable('macro_' + i, self.states['macro_' + i].name);
		}

		self.setVariableDefinitions(variables);
	};

	/**
	 * INTERNAL: Callback for ATEM connection to state change responses.
	 *
	 * @param {?boolean} err - null if a normal result, true if there was an error
	 * @param {Object} state - state details in object array
	 * @access protected
	 * @since 1.1.0
	 */
	processStateChange(err, state) {
		var self = this;

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
				self.initVariables();
				break;

			case 'InitCompleteCommand':
				debug('Init done');
				self.setAtemModel(self.deviceModel, true);
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
				self.deviceModel = sate.properties.model;
				self.deviceName  = state.properties.deviceName;
				break;

			case 'MacroPropertiesCommand':
				if (state.properties.macroIndex >= 0 && self.states['macro_'+(state.properties.macroIndex+1)] !== undefined) {
					var macroIndex = self.properties.macroIndex+1;
					//self.states['macro_'+macroIndex].macroIndex  = macroIndex;
					self.states['macro_'+macroIndex].description = state.properties.description;
					self.states['macro_'+macroIndex].isUsed      = state.properties.isUsed;
					self.states['macro_'+macroIndex].name        = state.properties.name;
					self.checkFeedbacks('macro');
				}
				break;

			case 'MacroRunStatusCommand':
				if (state.properties.macroIndex >= 0 && self.states['macro_'+(state.properties.macroIndex+1)] !== undefined) {
					var macroIndex = self.properties.macroIndex+1;
					//self.states['macro_'+macroIndex].macroIndex = macroIndex;
					self.states['macro_'+macroIndex].isRunning  = state.properties.isRunning;
					self.states['macro_'+macroIndex].isWaiting  = state.properties.isWaiting;
					self.states['macro_'+macroIndex].loop       = state.properties.loop;
					self.checkFeedbacks('macro');
				}
				break;

			case 'MacroRecordStatusCommand':
				if (state.properties.macroIndex >= 0 && self.states['macro_'+(state.properties.macroIndex+1)] !== undefined) {
					var macroIndex = self.properties.macroIndex+1;
					//self.states['macro_'+macroIndex].macroIndex  = macroIndex;
					self.states['macro_'+macroIndex].isRecording = state.properties.isRecording;
					self.checkFeedbacks('macro');
				}
				break;

			case 'MultiViewerPropertiesCommand':
				break;

			case 'MultiViewerSourceCommand':
				break;
		}
	}

	/**
	 * INTERNAL: Does a bunch of setup and cleanup then we switch models.
	 * This is a tricky function because both Config and Atem use this.
	 * Logic has to track who's who and make sure we don't init over a live switcher.
	 *
	 * @param {number} modelID - the new model
	 * @param {boolean} [live] - optional, true if this is the live switcher model; defaults to false
	 * @access protected
	 * @since 1.1.0
	 */
	setAtemModel(modelID, live) {
		var self = this;

		if ( !live ) {
			live = false;
		}

		if (self.CONFIG_MODEL[modelID] !== undefined) {

			// Still need to setup this to deal with overrides
			self.model = self.CONFIG_MODEL[modelID];
			// End note

			debug('ATEM Model: ' + self.model.id);

			// This is a funky test, but necessary
			if ((!live && self.deviceModel > 0 && modelID > 0 && modelID != self.deviceModel) || (live === true && self.config.modelID > 0 && self.deviceModel != self.config.modelID)) {
				self.log('error', 'Connected to a ' + self.deviceName + ', but instance is configured for ' + self.model.label + '.  Change instance to \'Auto Detect\' or the appropriate model to ensure stability.');
			}

			self.actions();
			self.initVariables();
			self.initFeedbacks();
			self.initPresets();
		}
		else {
			debug('ATEM Model: ' + modelID + 'NOT FOUND');
		}
	}

	/**
	 * INTERNAL: use setup data to initalize the atem-connection object.
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	setupAtemConnection() {
		var self = this;

		if (self.config.host !== undefined) {

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

			self.atem.connect(self.config.host);

			self.atem.on('stateChanged', self.processStateChange.bind(self));
		}
	}

	/**
	 * INTERNAL: use config data to define the choices for the MV Window dropdowns.
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	setupMvWindowChoices() {
		var self = this;

		self.CHOICES_MVWINDOW = [];

		if (self.config.mvUnlock == 'true') {
			self.CHOICES_MVWINDOW.push({ id: 0, label: 'Window 1' });
			self.CHOICES_MVWINDOW.push({ id: 1, label: 'Window 2' });
		}

		for (var i = 2; i < 10; i++) {
			self.CHOICES_MVWINDOW.push({ id: i, label: 'Window '+ (i+1) });
		}
	}

	/**
	 * INTERNAL: use model data to define the choices for the source dropdowns.
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	setupSourceChoices() {
		var self = this;

		self.sources = [];
		self.sources[0] =    { id: 0,    label: 'Black',        useME: 1, useAux: 1, useMV: 1, shortName: 'Blck' };
		self.sources[1000] = { id: 1000, label: 'Bars',         useME: 1, useAux: 1, useMV: 1, shortName: 'Bars' };
		self.sources[2001] = { id: 2001, label: 'Color 1',      useME: 1, useAux: 1, useMV: 1, shortName: 'Col1' };
		self.sources[2002] = { id: 2002, label: 'Color 2',      useME: 1, useAux: 1, useMV: 1, shortName: 'Col2' };
		self.sources[6000] = { id: 6000, label: 'Super Source', useME: 1, useAux: 1, useMV: 1, shortName: 'SSrc' };
		self.sources[7001] = { id: 7001, label: 'Clean Feed 1', useME: 0, useAux: 1, useMV: 1, shortName: 'Cln1' };
		self.sources[7002] = { id: 7002, label: 'Clean Feed 2', useME: 0, useAux: 1, useMV: 1, shortName: 'Cln2' };

		for(var i = 1; i <= self.model.inputs; i++) {
			self.sources[i] = { id: i, label: 'Input ' + i, useME: 1, useAux: 1, useMV: 1, shortName: (i<10 ? 'In '+i : 'In'+i) };
		}

		for(var i = 1; i <= self.model.MPs; i++) {
			self.sources[(3000+i*10)]   = { id: (3000+i*10),   label: 'Mediaplayer '+i,        useME: 1, useAux: 1, useMV: 1, shortName: 'MP '+i };
			self.sources[(3000+i*10+1)] = { id: (3000+i*10+1), label: 'Mediaplayer '+i+' Key', useME: 1, useAux: 1, useMV: 1, shortName: 'MP'+i+'K' };
		}

		for(var i = 1; i <= self.model.MEs; i++) {
			self.sources[(10000+i*10)]   = { id: (10000+i*10),   label: 'ME '+i+' Program', useME: (i>0 ? 1 : 0), useAux: 1, useMV: 1, shortName: 'M'+i+'PG' };
			self.sources[(10000+i*10+1)] = { id: (10000+i*10+1), label: 'ME '+i+' Preview', useME: (i>0 ? 1 : 0), useAux: 1, useMV: 1, shortName: 'M'+i+'PV' };
		}

		for(var i = 1; i <= self.model.auxes; i++) {
			self.sources[(8000+i)] = { id: (8000+i),   label: 'Auxilary '+i, useME: 0, useAux: 0, useMV: 1, shortName: 'Aux'+i };
		}

		self.sources.sort(function(a, b){return a.id - b.id});

		self.CHOICES_AUXSOURCES = [];
		self.CHOICES_MESOURCES = [];
		self.CHOICES_MVSOURCES = [];

		for(var key in self.sources) {

			if (self.inputs[key] === undefined) {
				self.inputs[key] = {
					longName:  self.sources[key].label,
					shortName: self.sources[key].shortName
				};
			}

			if (self.sources[key].useAux === 1) {
				self.CHOICES_AUXSOURCES.push( { id: key, label: self.sources[key].label } );
			}

			if (self.sources[key].useME === 1) {
				self.CHOICES_MESOURCES.push( { id: key, label: self.sources[key].label } );
			}

			if (self.sources[key].useMV === 1) {
				self.CHOICES_MVSOURCES.push( { id: key, label: self.sources[key].label } );
			}
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
		var self = this;
		self.config = config;

		self.setupMvWindowChoices();
		self.setAtemModel(config.modelID);

		if (self.config.host !== undefined) {
			if (self.atem !== undefined && self.atem.socket !== undefined && self.atem.socket._socket !== undefined) {
				try {
					self.atem.disconnect();
				} catch (e) {}
			}

			self.atem.connect(self.config.host);
		}
	};
}

//instance_skel.extendedBy(instance);
exports = module.exports = instance;
