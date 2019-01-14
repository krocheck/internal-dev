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

		this.model       = {};
		this.states      = {};
		this.inputs      = {};
		this.deviceName  = '';
		this.deviceModel = 0;
		this.initDone    = false;

		this.CONFIG_MODEL = {
			0: { id: 0, label: 'Auto Detect',          inputs: 8,  auxes: 3, MEs: 1, USKs: 1, DSKs: 2, MPs: 2, MVs: 1, SSrc: 1, macros: 100 },
			1: { id: 1, label: 'TV Studio',            inputs: 8,  auxes: 1, MEs: 1, USKs: 1, DSKs: 2, MPs: 2, MVs: 1, SSrc: 0, macros: 100 },
			2: { id: 2, label: '1 ME Production',      inputs: 8,  auxes: 3, MEs: 1, USKs: 4, DSKs: 2, MPs: 2, MVs: 1, SSrc: 1, macros: 100 },
			3: { id: 3, label: '2 ME Production',      inputs: 16, auxes: 6, MEs: 2, USKs: 4, DSKs: 2, MPs: 2, MVs: 2, SSrc: 1, macros: 100 },
			4: { id: 4, label: 'Production Studio 4K', inputs: 8,  auxes: 1, MEs: 1, USKs: 1, DSKs: 2, MPs: 2, MVs: 1, SSrc: 0, macros: 100 },
			5: { id: 5, label: '1 ME Production 4K',   inputs: 10, auxes: 3, MEs: 1, USKs: 4, DSKs: 2, MPs: 2, MVs: 1, SSrc: 1, macros: 100 },
			6: { id: 6, label: '2 ME Production 4K',   inputs: 20, auxes: 6, MEs: 2, USKs: 2, DSKs: 2, MPs: 2, MVs: 2, SSrc: 1, macros: 100 },
			7: { id: 7, label: '4 ME Broadcast 4K',    inputs: 20, auxes: 6, MEs: 4, USKs: 4, DSKs: 2, MPs: 4, MVs: 2, SSrc: 1, macros: 100 },
			8: { id: 8, label: 'TV Studio HD',         inputs: 8,  auxes: 1, MEs: 1, USKs: 1, DSKs: 2, MPs: 2, MVs: 1, SSrc: 0, macros: 100 },
			//9: { id: 9, label: '4ME?',                 inputs: 20, auxes: 6, MEs: 4, USKs: 4, DSKs: 2, MPs: 4, MVs: 2, macros: 100 }
		};

		this.CHOICES_AUXES = [
			{ id: 0, label: '1' },
			{ id: 1, label: '2' },
			{ id: 2, label: '3' },
			{ id: 3, label: '4' },
			{ id: 4, label: '5' },
			{ id: 5, label: '6' }
		];

		this.CHOICES_DSKS = [
			{ id: 0, label: '1' },
			{ id: 1, label: '2' }
		];

		this.CHOICES_KEYTRANS = [
			{ id: 'true',   label: 'On Air', },
			{ id: 'false',  label: 'Off', },
			{ id: 'toggle', label: 'Toggle', }
		];

		this.CHOICES_MACRORUN = [
			{ id: 'run',         label: 'Run' },
			{ id: 'runContinue', label: 'Run/Continue' }
		];

		this.CHOICES_MACROSTATE = [
			{ id: 'isRunning',   label: 'Is Running' },
			{ id: 'isWaiting',   label: 'Is Waiting' },
			{ id: 'isRecording', label: 'Is Recording' },
			{ id: 'isUsed'   ,   label: 'Is Used' }
		];

		this.CHOICES_ME = [
			{ id: 0, label: 'M/E 1' },
			{ id: 1, label: 'M/E 2' },
			{ id: 2, label: 'M/E 3' },
			{ id: 3, label: 'M/E 4' }
		];

		this.CHOICES_MODEL = Object.values(this.CONFIG_MODEL);
		this.CHOICES_MODEL.sort(function(a, b){
			var x = a.label.toLowerCase();
			var y = b.label.toLowerCase();
			if (a.id == 0) {return -1;}
			if (b.id == 0) {return 1;}
			if (x < y) {return -1;}
			if (x > y) {return 1;}
			return 0;
		});

		this.CHOICES_MV = [
			{ id: 0, label: 'MV 1' },
			{ id: 1, label: 'MV 2' }
		];

		this.CHOICES_MVLAYOUT = [
			{ id: 0, label: 'Top' },
			{ id: 1, label: 'Bottom' },
			{ id: 2, label: 'Left' },
			{ id: 3, label: 'Right' }
		];

		this.setupMvWindowChoices();

		this.CHOICES_PRESETSTYLE = [
			{ id: 0, label: 'Short Names' },
			{ id: 1, label: 'Long Names' }
		];

		this.CHOICES_USKS = [
			{ id: 0, label: '1' },
			{ id: 1, label: '2' },
			{ id: 2, label: '3' },
			{ id: 3, label: '4' }
		];

		if (this.config.modelID !== undefined){
			this.model = this.CONFIG_MODEL[this.config.modelID];
		}
		else {
			this.model = this.CONFIG_MODEL[0];
		}

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
		this.setupSourceChoices();

		this.system.emit('instance_actions', this.id, {
			'program': {
				label: 'Set input on Program',
				options: [
					{
						 type: 'dropdown',
						 label: 'Input',
						 id: 'input',
						 default: 1,
						 choices: this.CHOICES_MESOURCES
					},
					{
						type: 'dropdown',
						id: 'mixeffect',
						label: 'M/E',
						default: 0,
						choices: this.CHOICES_ME.slice(0, this.model.MEs)
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
						 choices: this.CHOICES_MESOURCES
					},
					{
						type: 'dropdown',
						id: 'mixeffect',
						label: 'M/E',
						default: 0,
						choices: this.CHOICES_ME.slice(0, this.model.MEs)
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
						choices: this.CHOICES_AUXES.slice(0, this.model.auxes)
					},
					{
						 type: 'dropdown',
						 label: 'Input',
						 id: 'input',
						 default: 1,
						 choices: this.CHOICES_AUXSOURCES
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
						choices: this.CHOICES_KEYTRANS
					},
					{
						type: 'dropdown',
						id: 'mixeffect',
						label: 'M/E',
						default: 0,
						choices: this.CHOICES_ME.slice(0, this.model.MEs)
					},
					{
						type: 'dropdown',
						label: 'Key',
						id: 'key',
						default: '0',
						choices: this.CHOICES_USKS.slice(0, this.model.USKs)
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
						choices: this.CHOICES_KEYTRANS
					},
					{
						type: 'dropdown',
						label: 'Key',
						id: 'key',
						default: '0',
						choices: this.CHOICES_DSKS.slice(0, this.model.DSKs)
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
						choices: this.CHOICES_ME.slice(0, this.model.MEs)
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
						choices: this.CHOICES_ME.slice(0, this.model.MEs)
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
						choices: this.CHOICES_MACRORUN
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
						choices: this.CHOICES_MV.slice(0, this.model.MVs)
					},
					{
						type:    'dropdown',
						id:      'layout',
						label:   'Layout',
						default: 0,
						choices: this.CHOICES_MVLAYOUT
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
						choices: this.CHOICES_MV.slice(0, this.model.MVs)
					},
					{
						type:    'dropdown',
						id:      'windowIndex',
						label:   'Window #',
						default: 2,
						choices: this.CHOICES_MVWINDOW
					},
					{
						type:    'dropdown',
						id:      'source',
						label:   'Source',
						default: 0,
						choices: this.CHOICES_MVSOURCES
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
		var id = action.action;
		var cmd;
		var opt = action.options;

		switch (action.action) {
			case 'program':
				this.atem.changeProgramInput(parseInt(opt.input), parseInt(opt.mixeffect));
				break;
			case 'preview':
				this.atem.changePreviewInput(parseInt(opt.input), parseInt(opt.mixeffect));
				break;
			case 'aux':
				this.atem.setAuxSource(parseInt(opt.input), parseInt(opt.aux));
				break;
			case 'cut':
				this.atem.cut(parseInt(opt.mixeffect));
				break;
			case 'usk':
				if (opt.onair == 'toggle') {
					this.atem.setUpstreamKeyerOnAir(!this.states['usk' + opt.mixeffect + '-' + opt.key], parseInt(opt.mixeffect), parseInt(opt.key));
				} else {
					this.atem.setUpstreamKeyerOnAir(opt.onair == 'true', parseInt(opt.mixeffect), parseInt(opt.key));
				}
				break;
			case 'dsk':
				if (opt.onair == 'toggle') {
					this.atem.setDownstreamKeyOnAir(!this.states['dsk' + opt.key], parseInt(opt.key));
				} else {
					this.atem.setDownstreamKeyOnAir(opt.onair == 'true', parseInt(opt.key));
				}
				break;
			case 'auto':
				this.atem.autoTransition(parseInt(opt.mixeffect));
				break;
			case 'macrorun':
				if (opt.action == 'runContinue' && this.states['macro_' + opt.macro].isWaiting == 1) {
					this.atem.macroContinue();
				}
				else if (this.states['macro_' + opt.macro].isRecording == 1) {
					this.atem.macroStopRecord()
				}
				else {
					this.atem.macroRun(parseInt(opt.macro) - 1);
				}
				break;
			case 'macrocontinue':
				this.atem.macroContinue();
				break;
			case 'macrostop':
				this.atem.macroStop();
				break;
			case 'setMvLayout':
				this.atem.setMultiViewerProperties( { 'layout': opt.layout }, opt.mvId);
				break;
			case 'setMvSource':
				this.atem.setMultiViewerSource( { 'windowIndex': opt.windowIndex, 'source': opt.source }, opt.mvId);
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
				regex:   this.REGEX_IP
			},
			{
				type:    'dropdown',
				id:      'modelID',
				label:   'Model',
				width:   6,
				choices: this.CHOICES_MODEL,
				default: 0
			},
			{
				type:    'dropdown',
				id:      'presets',
				label:   'Preset Style',
				width:   6,
				choices: this.CHOICES_PRESETSTYLE,
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
				width:   6,
				choices: this.CHOICES_YESNO_BOOLEAN,
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

		if (this.atem !== undefined) {
			this.atem.disconnect();
			delete this.atem;
		}
		debug("destroy", this.id);
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
		var out  = {};

		if (feedback.type == 'preview_bg') {
			if (this.states['preview' + feedback.options.mixeffect] == parseInt(feedback.options.input)) {
				out = { color: feedback.options.fg, bgcolor: feedback.options.bg };
			}
		}
		else if (feedback.type == 'program_bg') {
			if (this.states['program' + feedback.options.mixeffect] == parseInt(feedback.options.input)) {
				out = { color: feedback.options.fg, bgcolor: feedback.options.bg };
			}
		}
		else if (feedback.type == 'aux_bg') {
			if (this.states['aux' + feedback.options.aux] == parseInt(feedback.options.input)) {
				out = { color: feedback.options.fg, bgcolor: feedback.options.bg };
			}
		}
		else if (feedback.type == 'usk_bg') {
			if (this.states['usk' + feedback.options.mixeffect + '-' + feedback.options.key]) {
				out = { color: feedback.options.fg, bgcolor: feedback.options.bg };
			}
		}
		else if (feedback.type == 'dsk_bg') {
			if (this.states['dsk' + feedback.options.key]) {
				out = { color: feedback.options.fg, bgcolor: feedback.options.bg };
			}
		}
		else if (feedback.type == 'macro') {
			var state = this.states['macro_' + feedback.options.macroIndex];

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
			var state = this.states['mv_layout_' + feedback.mvId];

			if (state.mvId == (parseInt(feedback.mvId)) && state.layout == (parseInt(feedback.layout))) {
				out = { color: feedback.options.fg, bgcolor: feedback.options.bg };
			}
		}
		else if (feedback.type == 'mv_source') {
			var index = (parseInt(feedback.options.mvId)) & (parseInt(feedback.options.windowIndex));
			var state = this.states['mv_source_' + index];

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
		debug = this.debug;
		log = this.log;

		this.status(this.STATE_UNKNOWN);

		// Unfortunately this is redundant if the switcher goes
		// online right away, but necessary for offline programming
		this.initVariables();
		this.initFeedbacks();
		this.initPresets();

		this.setupAtemConnection();
	};

	/**
	 * INTERNAL: initialize feedbacks.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initFeedbacks() {
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
					default: this.rgb(255,255,255)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(0,255,0)
				},
				{
					type: 'dropdown',
					label: 'Input',
					id: 'input',
					default: 1,
					choices: this.CHOICES_MESOURCES
				},
				{
					type: 'dropdown',
					id: 'mixeffect',
					label: 'M/E',
					default: 0,
					choices: this.CHOICES_ME.slice(0, this.model.MEs)
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
					default: this.rgb(255,255,255)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(255,0,0)
				},
				{
					type: 'dropdown',
					label: 'Input',
					id: 'input',
					default: 1,
					choices: this.CHOICES_MESOURCES
				},
				{
					type: 'dropdown',
					id: 'mixeffect',
					label: 'M/E',
					default: 0,
					choices: this.CHOICES_ME.slice(0, this.model.MEs)
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
					default: this.rgb(0,0,0)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(255,255,0)
				},
				{
					type: 'dropdown',
					label: 'Input',
					id: 'input',
					default: 1,
					choices: this.CHOICES_AUXSOURCES
				},
				{
					type: 'dropdown',
					id: 'aux',
					label: 'AUX',
					default: 0,
					choices: this.CHOICES_AUXES.slice(0, this.model.auxes)
				}
			]
		};
		feedbacks['usk_bg'] = {
			label: 'Change colors from upstream keyer state',
			description: 'If the specified upstream keyer is active, change color of the bank',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(255,255,255)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(255,0,0)
				},
				{
					type: 'dropdown',
					id: 'mixeffect',
					label: 'M/E',
					default: 0,
					choices: this.CHOICES_ME.slice(0, this.model.MEs)
				},
				{
					type: 'dropdown',
					label: 'Key',
					id: 'key',
					default: '0',
					choices: this.CHOICES_USKS.slice(0, this.model.USKs)
				}
			]
		};
		feedbacks['dsk_bg'] = {
			label: 'Change colors from downstream keyer state',
			description: 'If the specified downstream keyer is active, change color of the bank',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(255,255,255)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(255,0,0)
				},
				{
					type: 'dropdown',
					label: 'Key',
					id: 'key',
					default: '0',
					choices: this.CHOICES_DSKS.slice(0, this.model.DSKs)
				}
			]
		};
		feedbacks['macro'] = {
			label: 'Change colors from macro state',
			description: 'If the specified macro is running or waiting, change color of the bank',
			options: [
				{
					type:   'colorpicker',
					label:  'Foreground color',
					id:     'fg',
					default: this.rgb(255,255,255)
				},
				{
					type:   'colorpicker',
					label:  'Background color',
					id:     'bg',
					default: this.rgb(238,238,0)
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
					choices: this.CHOICES_MACROSTATE
				}
			]
		};
		feedbacks['mv_layout'] = {
			label: 'Change colors from MV layout',
			description: 'If the specified MV is set to the specified layout, change color of the bank',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(0,0,0)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(255,255,0)
				},
				{
					type:    'dropdown',
					id:      'mvId',
					label:   'MV',
					default: 0,
					choices: this.CHOICES_MV.slice(0, this.model.MVs)
				},
				{
					type:    'dropdown',
					id:      'layout',
					label:   'Layout',
					default: 0,
					choices: this.CHOICES_MVLAYOUT
				}
			]
		};
		feedbacks['mv_source'] = {
			label: 'Change colors from MV window',
			description: 'If the specified MV window is set to the specified source, change color of the bank',
			options: [
				{
					type: 'colorpicker',
					label: 'Foreground color',
					id: 'fg',
					default: this.rgb(0,0,0)
				},
				{
					type: 'colorpicker',
					label: 'Background color',
					id: 'bg',
					default: this.rgb(255,255,0)
				},
				{
					type:    'dropdown',
					id:      'mvId',
					label:   'MV',
					default: 0,
					choices: this.CHOICES_MV.slice(0, this.model.MVs)
				},
				{
					type:    'dropdown',
					id:      'windowIndex',
					label:   'Window #',
					default: 2,
					choices: this.CHOICES_MVWINDOW
				},
				{
					type:    'dropdown',
					id:      'source',
					label:   'Source',
					default: 0,
					choices: this.CHOICES_MVSOURCES
				}
			]
		};


		this.setFeedbackDefinitions(feedbacks);
	};

	/**
	 * INTERNAL: initialize presets.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initPresets () {
		var presets = [];
		var pstText = (this.config.presets == 1 ? 'long_' : 'short_');
		var pstSize = (this.config.presets == 1 ? 'auto' : '18')

		for (var me = 0; me < this.model.MEs; ++me) {
			for (var input in this.CHOICES_MESOURCES) {
				var key = this.CHOICES_MESOURCES[input].id;

				presets.push({
					category: 'Preview (M/E ' + (me+1) + ')',
					label: 'Preview button for ' + this.inputs[key].shortName,
					bank: {
						style: 'text',
						text: '$(attem:' + pstText + key + ')',
						size: pstSize,
						color: '16777215',
						bgcolor: 0
					},
					feedbacks: [
						{
							type: 'preview_bg',
							options: {
								bg: 65280,
								fg: 16777215,
								input: key,
								mixeffect: me
							}
						}
					],
					actions: [
						{
							action: 'preview',
							options: {
								mixeffect: me,
								input: key
							}
						}
					]
				});
				presets.push({
					category: 'Program (M/E ' + (me+1) + ')',
					label: 'Program button for ' + this.inputs[key].shortName,
					bank: {
						style: 'text',
						text: '$(attem:' + pstText + key + ')',
						size: pstSize,
						color: '16777215',
						bgcolor: 0
					},
					feedbacks: [
						{
							type: 'program_bg',
							options: {
								bg: 16711680,
								fg: 16777215,
								input: key,
								mixeffect: me
							}
						}
					],
					actions: [
						{
							action: 'program',
							options: {
								mixeffect: me,
								input: key
							}
						}
					]
				});
			}
		}

		for (var i = 0; i < this.model.auxes; ++i) {
			for (var input in this.CHOICES_AUXSOURCES) {
				var key = this.CHOICES_AUXSOURCES[input].id;

				presets.push({
					category: 'AUX ' + (i+1),
					label: 'AUX' + (i+1) + ' button for ' + this.inputs[key].shortName,
					bank: {
						style: 'text',
						text: '$(attem:' + pstText + key + ')',
						size: pstSize,
						color: '16777215',
						bgcolor: 0
					},
					feedbacks: [
						{
							type: 'aux_bg',
							options: {
								bg: 16776960,
								fg: 0,
								input: key,
								aux: i
							}
						}
					],
					actions: [
						{
							action: 'aux',
							options: {
								aux: i,
								input: key
							}
						}
					]
				});
			}
		}

		// Upstream keyers
		for (var me = 0; me < this.model.MEs; ++me) {
			for (var i = 0; i < this.model.USKs; ++i) {
				presets.push({
					category: 'KEYs',
					label: 'Toggle upstream KEY' + (i+1) + '(M/E ' + (me+1) + ')',
					bank: {
						style: 'text',
						text: 'KEY ' + (i+1),
						size: '24',
						color: this.rgb(255,255,255),
						bgcolor: 0
					},
					feedbacks: [
						{
							type: 'usk_bg',
							options: {
								bg: this.rgb(255,0,0),
								fg: this.rgb(255,255,255),
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
		for (var i = 0; i < this.model.DSKs; ++i) {
			presets.push({
				category: 'KEYs',
				label: 'Toggle downstream KEY' + (i+1),
				bank: {
					style: 'text',
					text: 'DSK ' + (i+1),
					size: '24',
					color: this.rgb(255,255,255),
					bgcolor: 0
				},
				feedbacks: [
					{
						type: 'dsk_bg',
						options: {
							bg: this.rgb(255,0,0),
							fg: this.rgb(255,255,255),
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
		for (var i = 1; i <= this.model.macros; i++) {
			presets.push({
				category: 'MACROS',
				label: 'Run button for macro ' + i,
				bank: {
					style:   'text',
					text:    '$(attem:macro_' + i + ')',
					size:    'auto',
					color:   this.rgb(255,255,255),
					bgcolor: this.rgb(0,0,0)
				},
				feedbacks: [
					{
						type: 'macro',
						options: {
							bg:         this.rgb(0,0,238),
							fg:         this.rgb(255,255,255),
							macroIndex: i,
							state:      'isUsed'
						}
					},
					{
						type: 'macro',
						options: {
							bg:         this.rgb(0,238,0),
							fg:         this.rgb(255,255,255),
							macroIndex: i,
							state:      'isRunning'
						}
					},
					{
						type: 'macro',
						options: {
							bg:         this.rgb(238,238,0),
							fg:         this.rgb(255,255,255),
							macroIndex: i,
							state:      'isWaiting'
						}
					},
					{
						type: 'macro',
						options: {
							bg:         this.rgb(238,0,0),
							fg:         this.rgb(255,255,255),
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

		for (var i = 0; i < this.model.MVs; i++) {

			for (var x in this.CHOICES_MVLAYOUT) {

				presets.push({
					category: 'MV Layouts',
					label: 'Set multi viewer '+(i+1)+' to layout '+this.CHOICES_MVLAYOUT[x].label,
					bank: {
						style:   'text',
						text:    'MV '+(i+1)+' Layout '+this.CHOICES_MVLAYOUT[x].label,
						size:    'auto',
						color:   this.rgb(255,255,255),
						bgcolor: this.rgb(0,0,0)
					},
					feedbacks: [
						{
							type: 'mv_layout',
							options: {
								bg:     this.rgb(255,255,0),
								fg:     this.rgb(0,0,0),
								mvId:   i,
								layout: this.CHOICES_MVLAYOUT[x].id
							}
						}
					],
					actions: [
						{
							action: 'setMvLayout',
							options: {
								mvId:   i,
								layout: this.CHOICES_MVLAYOUT[x].id
							}
						}
					]
				});
			}

			for (var j = 0; j < 10; j++) {

				if (this.config.mvUnlock == 'false' && j<2) {}
				else {
					for (var k in this.CHOICES_MVSOURCES) {

						presets.push({
							category: 'MV ' + (i+1) + ' Window ' + (j+1),
							label: 'Set multi viewer '+(i+1)+', window '+(j+1)+' to source '+this.CHOICES_MVSOURCES[k].label,
							bank: {
								style:   'text',
								text:    '$(attem:' + pstText + this.CHOICES_MVSOURCES[k].id + ')',
								size:    pstSize,
								color:   this.rgb(255,255,255),
								bgcolor: this.rgb(0,0,0)
							},
							feedbacks: [
								{
									type: 'mv_source',
									options: {
										bg:          this.rgb(255,255,0),
										fg:          this.rgb(0,0,0),
										mvId:        i,
										source:      this.CHOICES_MVSOURCES[k].id,
										windowIndex: j
									}
								}
							],
							actions: [
								{
									action: 'setMvSource',
									options: {
										mvId:        i,
										source:      this.CHOICES_MVSOURCES[k].id,
										windowIndex: j
									}
								}
							]
						});
					}
				}
			}
		}

		this.setPresetDefinitions(presets);
	}

	/**
	 * INTERNAL: initialize variables.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initVariables() {
		// variable_set
		var variables = [];

		// PGM/PV busses
		for (var i = 0; i < this.model.MEs; ++i) {
			variables.push({
				label: 'Label of input active on program bus (M/E ' + (i+1) + ')',
				name: 'pgm' + (i+1) + '_input'
			});
			if (this.inputs[this.states['program' + i]] !== undefined) {
				this.setVariable('pgm' + (i+1) + '_input', this.inputs[this.states['program' + i]].shortName);
			}
			variables.push({
				label: 'Label of input active on preview bus (M/E ' + (i+1) + ')',
				name: 'pvw' + (i+1) + '_input'
			});
			if (this.inputs[this.states['preview' + i]] !== undefined) {
				this.setVariable('pvw' + (i+1) + '_input', this.inputs[this.states['preview' + i]].shortName);
			}
		}

		// Input names
		for (var key in this.sources) {
			variables.push({
				label: 'Long name of input id ' + key,
				name: 'long_' + key
			});
			variables.push({
				label: 'Short name of input id ' + key,
				name: 'short_' + key
			});

			if (this.inputs[key] !== undefined) {
				this.setVariable('long_' + key,  this.inputs[key].longName);
				this.setVariable('short_' + key, this.inputs[key].shortName);
			}
			else {
				this.setVariable('long_' + key,  this.sources[key].label);
				this.setVariable('short_' + key, this.sources[key].shortName);
			}
		}

		// Macros
		for (var i = 1; i <= this.model.macros; i++) {

			if (this.states['macro_' + i] === undefined) {
				this.states['macro_' + i] = {
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

			this.setVariable('macro_' + i, this.states['macro_' + i].name);
		}

		this.setVariableDefinitions(variables);
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

		switch (state.constructor.name) {
			case 'AuxSourceCommand':
				this.states['aux' + state.auxBus] = state.properties.source;

				if (this.initDone === true) {
					this.checkFeedbacks('aux_bg');
				}
				break;

			case 'PreviewInputCommand':
				this.states['preview' + state.mixEffect] = state.properties.source;

				if (this.inputs[state.properties.source] !== undefined) {
					this.setVariable('pvw' + (state.mixEffect + 1) + '_input', this.inputs[state.properties.source].shortName);
				}

				if (this.initDone === true) {
					this.checkFeedbacks('preview_bg');
				}
				break;

			case 'ProgramInputCommand':
				this.states['program' + state.mixEffect] = state.properties.source;

				if (this.inputs[state.properties.source] !== undefined) {
					this.setVariable('pgm' + (state.mixEffect + 1) + '_input', this.inputs[state.properties.source].shortName);
				}

				if (this.initDone === true) {
					this.checkFeedbacks('program_bg');
				}
				break;

			case 'InputPropertiesCommand':
				this.inputs[state.inputId] = state.properties;
				// resend everything, since names of routes might have changed
				if (this.initDone === true) {
					this.initVariables();
				}
				break;

			case 'InitCompleteCommand':
				debug('Init done');
				this.initDone = true;
				this.log('info', 'Connected to a ' + this.deviceName);

				this.checkFeedbacks('aux_bg');
				this.checkFeedbacks('preview_bg');
				this.checkFeedbacks('program_bg');
				this.checkFeedbacks('dsk_bg');
				this.checkFeedbacks('usk_bg');
				this.checkFeedbacks('macro');
				this.checkFeedbacks('mv_layout');
				this.checkFeedbacks('mv_source');
				break;

			case 'DownstreamKeyStateCommand':
				this.states['dsk' + state.downstreamKeyerId] = state.properties.onAir;

				if (this.initDone === true) {
					this.checkFeedbacks('dsk_bg');
				}
				break;

			case 'MixEffectKeyOnAirCommand':
				this.states['usk' + state.mixEffect + '-' + state.upstreamKeyerId] = state.properties.onAir;

				if (this.initDone === true) {
					this.checkFeedbacks('usk_bg');
				}
				break;

			case 'ProductIdentifierCommand':
				this.deviceModel = state.properties.model;
				this.deviceName  = state.properties.deviceName;
				this.setAtemModel(this.deviceModel, true);
				break;

			case 'MacroPropertiesCommand':
				if (state.properties.macroIndex >= 0 && this.states['macro_'+(state.properties.macroIndex+1)] !== undefined) {
					var macroIndex = this.properties.macroIndex+1;
					this.states['macro_'+macroIndex].description = state.properties.description;
					this.states['macro_'+macroIndex].isUsed      = state.properties.isUsed;
					this.states['macro_'+macroIndex].name        = state.properties.name;

					if (this.initDone === true) {
						this.checkFeedbacks('macro');
					}
				}
				break;

			case 'MacroRunStatusCommand':
				if (state.properties.macroIndex >= 0 && this.states['macro_'+(state.properties.macroIndex+1)] !== undefined) {
					var macroIndex = this.properties.macroIndex+1;
					this.states['macro_'+macroIndex].isRunning  = state.properties.isRunning;
					this.states['macro_'+macroIndex].isWaiting  = state.properties.isWaiting;
					this.states['macro_'+macroIndex].loop       = state.properties.loop;

					if (this.initDone === true) {
						this.checkFeedbacks('macro');
					}
				}
				break;

			case 'MacroRecordStatusCommand':
				if (state.properties.macroIndex >= 0 && this.states['macro_'+(state.properties.macroIndex+1)] !== undefined) {
					var macroIndex = this.properties.macroIndex+1;
					this.states['macro_'+macroIndex].isRecording = state.properties.isRecording;

					if (this.initDone === true) {
						this.checkFeedbacks('macro');
					}
				}
				break;

			case 'MultiViewerPropertiesCommand':
				if (state.mvId >= 0 && this.states['mv_layout_'+(state.mvId)] !== undefined) {
					this.states['mv_layout_'+(state.mvId)].layout = state.properties.layout;
					this.states['mv_layout_'+(state.mvId)].mvId   = state.mvId;

					if (this.initDone === true) {
						this.checkFeedbacks('mv_layout');
					}
				}
				break;

			case 'MultiViewerSourceCommand':
				if (state.mvId >= 0 && this.states['mv_source_'+(state.index)] !== undefined) {
					this.states['mv_source_'+(state.index)].mvId        = state.mvId;
					this.states['mv_source_'+(state.index)].source      = state.properties.source;
					this.states['mv_source_'+(state.index)].windowIndex = state.properties.windowIndex;

					if (this.initDone === true) {
						this.checkFeedbacks('mv_source');
					}
				}
				break;
		}
	}

	/**
	 * INTERNAL: Fires a bunch of setup and cleanup when we switch models.
	 * This is a tricky function because both Config and Atem use this.
	 * Logic has to track who's who and make sure we don't init over a live switcher.
	 *
	 * @param {number} modelID - the new model
	 * @param {boolean} [live] - optional, true if this is the live switcher model; defaults to false
	 * @access protected
	 * @since 1.1.0
	 */
	setAtemModel(modelID, live) {

		if ( !live ) {
			live = false;
		}

		if (this.CONFIG_MODEL[modelID] !== undefined) {

			// Still not sure about this
			if ((live === true && this.config.modelID == 0) || (live == false && (this.deviceModel == 0 || modelID > 0))) {
				this.model = this.CONFIG_MODEL[modelID];
				debug('ATEM Model: ' + this.model.id);
			}

			// This is a funky test, but necessary.  Can it somehow be an else if of the above ... or simply an else?
			if ((live === false && this.deviceModel > 0 && modelID > 0 && modelID != this.deviceModel) ||
				(live === true && this.config.modelID > 0 && this.deviceModel != this.config.modelID)) {
				this.log('error', 'Connected to a ' + this.deviceName + ', but instance is configured for ' + this.model.label + '.  Change instance to \'Auto Detect\' or the appropriate model to ensure stability.');
			}

			this.actions();
			this.initVariables();
			this.initFeedbacks();
			this.initPresets();
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

		if (this.config.host !== undefined) {

			this.atem = new Atem({ externalLog: this.debug.bind(this) });

			this.atem.on('connected', () => {
				this.status(this.STATE_OK);
			});
			this.atem.on('error', (e) => {
				this.status(this.STATUS_ERROR, 'Error');
			});
			this.atem.on('disconnected', () => {
				this.status(this.STATUS_UNKNOWN, 'Disconnected');
				this.initDone = false;
			});

			this.atem.connect(this.config.host);

			this.atem.on('stateChanged', this.processStateChange.bind(this));
		}
	}

	/**
	 * INTERNAL: use config data to define the choices for the MV Window dropdowns.
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	setupMvWindowChoices() {
		this.CHOICES_MVWINDOW = [];

		if (this.config.mvUnlock == 'true') {
			this.CHOICES_MVWINDOW.push({ id: 0, label: 'Window 1' });
			this.CHOICES_MVWINDOW.push({ id: 1, label: 'Window 2' });
		}

		for (var i = 2; i < 10; i++) {
			this.CHOICES_MVWINDOW.push({ id: i, label: 'Window '+ (i+1) });
		}

		for (var i = 0; i < this.model.MVs; i++) {
			for (var j = 0; j < 10; j++) {
				var index = i*100+j;

				if (this.states['mv_source_' + index] === undefined) {
					this.states['mv_source_' + index] = {
						mvId:        i,
						windowIndex: j,
						source:      0
					};
				}
			}

			if (this.states['mv_layout_' + index] === undefined) {
				this.states['mv_layout_' + index] = {
					mvId:        i,
					layout:      0
				};
			}
		}
	}

	/**
	 * INTERNAL: use model data to define the choices for the source dropdowns.
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	setupSourceChoices() {
		this.sources = [];
		this.sources[0] =    { id: 0,    label: 'Black',        useME: 1, useAux: 1, useMV: 1, shortName: 'Blck' };
		this.sources[1000] = { id: 1000, label: 'Bars',         useME: 1, useAux: 1, useMV: 1, shortName: 'Bars' };
		this.sources[2001] = { id: 2001, label: 'Color 1',      useME: 1, useAux: 1, useMV: 1, shortName: 'Col1' };
		this.sources[2002] = { id: 2002, label: 'Color 2',      useME: 1, useAux: 1, useMV: 1, shortName: 'Col2' };
		this.sources[7001] = { id: 7001, label: 'Clean Feed 1', useME: 0, useAux: 1, useMV: 1, shortName: 'Cln1' };
		this.sources[7002] = { id: 7002, label: 'Clean Feed 2', useME: 0, useAux: 1, useMV: 1, shortName: 'Cln2' };

		if (this.model.SSrc > 0) {
			this.sources[6000] = { id: 6000, label: 'Super Source', useME: 1, useAux: 1, useMV: 1, shortName: 'SSrc' };
		}

		for(var i = 1; i <= this.model.inputs; i++) {
			this.sources[i] = { id: i, label: 'Input ' + i, useME: 1, useAux: 1, useMV: 1, shortName: (i<10 ? 'In '+i : 'In'+i) };
		}

		for(var i = 1; i <= this.model.MPs; i++) {
			this.sources[(3000+i*10)]   = { id: (3000+i*10),   label: 'Mediaplayer '+i,        useME: 1, useAux: 1, useMV: 1, shortName: 'MP '+i };
			this.sources[(3000+i*10+1)] = { id: (3000+i*10+1), label: 'Mediaplayer '+i+' Key', useME: 1, useAux: 1, useMV: 1, shortName: 'MP'+i+'K' };
		}

		for(var i = 1; i <= this.model.MEs; i++) {
			// ME 1 can't be used as an ME source, hence i>1 for useME
			this.sources[(10000+i*10)]   = { id: (10000+i*10),   label: 'ME '+i+' Program', useME: (i>1 ? 1 : 0), useAux: 1, useMV: 1, shortName: 'M'+i+'PG' };
			this.sources[(10000+i*10+1)] = { id: (10000+i*10+1), label: 'ME '+i+' Preview', useME: (i>1 ? 1 : 0), useAux: 1, useMV: 1, shortName: 'M'+i+'PV' };
		}

		for(var i = 1; i <= this.model.auxes; i++) {
			this.sources[(8000+i)] = { id: (8000+i),   label: 'Auxilary '+i, useME: 0, useAux: 0, useMV: 1, shortName: 'Aux'+i };
		}

		this.CHOICES_AUXSOURCES = [];
		this.CHOICES_MESOURCES = [];
		this.CHOICES_MVSOURCES = [];

		for(var key in this.sources) {

			if (this.inputs[key] === undefined) {
				this.inputs[key] = {
					longName:  this.sources[key].label,
					shortName: this.sources[key].shortName
				};
			}

			if (this.sources[key].useAux === 1) {
				this.CHOICES_AUXSOURCES.push( { id: key, label: this.sources[key].label } );
			}

			if (this.sources[key].useME === 1) {
				this.CHOICES_MESOURCES.push( { id: key, label: this.sources[key].label } );
			}

			if (this.sources[key].useMV === 1) {
				this.CHOICES_MVSOURCES.push( { id: key, label: this.sources[key].label } );
			}
		}

		this.CHOICES_AUXSOURCES.sort(function(a, b){return a.id - b.id});
		this.CHOICES_MESOURCES.sort(function(a, b){return a.id - b.id});
		this.CHOICES_MVSOURCES.sort(function(a, b){return a.id - b.id});
	}

	/**
	 * Process an updated configuration array.
	 *
	 * @param {Object} config - the new configuration
	 * @access public
	 * @since 1.0.0
	 */
	updateConfig(config) {
		this.config = config;

		this.setupMvWindowChoices();
		this.setAtemModel(config.modelID);

		if (this.config.host !== undefined) {
			if (this.atem !== undefined && this.atem.socket !== undefined && this.atem.socket._socket !== undefined) {
				try {
					this.atem.disconnect();
				} catch (e) {}
			}

			this.atem.connect(this.config.host);
		}
	};
}

exports = module.exports = instance;
