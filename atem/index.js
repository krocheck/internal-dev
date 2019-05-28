var instance_skel = require('../../instance_skel');

var instance_api  = require('./instanceAPI');
var feedback      = require('./feedback');
var presets       = require('./presets');
var variables     = require('./variables');

var Atem = require('atem-connection').Atem;
var debug;
var log;

/**
 * Companion instance class for the Blackmagic ATEM Switchers.
 *
 * @extends instance_skel
 * @version 1.1.0
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
		this.deviceName  = '';
		this.deviceModel = 0;
		this.initDone    = false;

		Object.assign(this, {
			...feedback,
			...presets,
			...variables
		});

		this.api = new instance_api(this);

		this.CONFIG_MODEL = {
			0: { id: 0, label: 'Auto Detect',           inputs: 8,  auxes: 3,  MEs: 1, USKs: 1, DSKs: 2, MPs: 2, MVs: 1, SSrc: 1, macros: 100 },
			1: { id: 1, label: 'TV Studio',             inputs: 8,  auxes: 1,  MEs: 1, USKs: 1, DSKs: 2, MPs: 2, MVs: 1, SSrc: 0, macros: 100 },
			2: { id: 2, label: '1 ME Production',       inputs: 8,  auxes: 3,  MEs: 1, USKs: 4, DSKs: 2, MPs: 2, MVs: 1, SSrc: 1, macros: 100 },
			3: { id: 3, label: '2 ME Production',       inputs: 16, auxes: 6,  MEs: 2, USKs: 4, DSKs: 2, MPs: 2, MVs: 2, SSrc: 1, macros: 100 },
			4: { id: 4, label: 'Production Studio 4K',  inputs: 8,  auxes: 1,  MEs: 1, USKs: 1, DSKs: 2, MPs: 2, MVs: 1, SSrc: 0, macros: 100 },
			5: { id: 5, label: '1 ME Production 4K',    inputs: 10, auxes: 3,  MEs: 1, USKs: 4, DSKs: 2, MPs: 2, MVs: 1, SSrc: 1, macros: 100 },
			6: { id: 6, label: '2 ME Production 4K',    inputs: 20, auxes: 6,  MEs: 2, USKs: 2, DSKs: 2, MPs: 2, MVs: 2, SSrc: 1, macros: 100 },
			7: { id: 7, label: '4 ME Broadcast 4K',     inputs: 20, auxes: 6,  MEs: 4, USKs: 4, DSKs: 2, MPs: 4, MVs: 2, SSrc: 1, macros: 100 },
			8: { id: 8, label: 'TV Studio HD',          inputs: 8,  auxes: 1,  MEs: 1, USKs: 1, DSKs: 2, MPs: 2, MVs: 1, SSrc: 0, macros: 100 },
			9: { id: 9, label: '4 ME Constellation 8K', inputs: 40, auxes: 24, MEs: 4, USKs: 4, DSKs: 4, MPs: 4, MVs: 4, SSrc: 2, macros: 100 }
		};

		this.CHOICES_AUXES = [];

		for(var i = 0; i < 24; i++) {
			this.CHOICES_AUXES.push({ id: i, label: (i+1).toString() });
		}

		this.CHOICES_DSKS = [
			{ id: 0, label: '1' },
			{ id: 1, label: '2' },
			{ id: 2, label: '3' },
			{ id: 3, label: '4' }
		];

		this.CHOICES_KEYTRANS = [
			{ id: 'true',   label: 'On Air' },
			{ id: 'false',  label: 'Off' },
			{ id: 'toggle', label: 'Toggle' }
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
		// Sort alphabetical but leave index 0 at the top (Auto Detect)
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
			{ id: 1, label: 'MV 2' },
			{ id: 2, label: 'MV 3' },
			{ id: 3, label: 'MV 4' }
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
			this.config.modelID = 0;
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
			'uskSource': {
				label: 'Set inputs on Upstream KEY',
				options: [
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
					},
					{
						 type: 'dropdown',
						 label: 'Fill Source',
						 id: 'fill',
						 default: 1,
						 choices: this.CHOICES_MESOURCES
					},
					{
						 type: 'dropdown',
						 label: 'Key Source',
						 id: 'cut',
						 default: 0,
						 choices: this.CHOICES_MESOURCES
					}
				]
			},
			'dskSource': {
				label: 'Set inputs on Downstream KEY',
				options: [
					{
						type: 'dropdown',
						label: 'Key',
						id: 'key',
						default: '0',
						choices: this.CHOICES_DSKS.slice(0, this.model.DSKs)
					},
					{
						 type: 'dropdown',
						 label: 'Fill Source',
						 id: 'fill',
						 default: 1,
						 choices: this.CHOICES_MESOURCES
					},
					{
						 type: 'dropdown',
						 label: 'Key Source',
						 id: 'cut',
						 default: 0,
						 choices: this.CHOICES_MESOURCES
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
			'setMvSource': {
				label: 'Change MV window source',
				options: [
					{
						type:    'dropdown',
						id:      'multiViewerId',
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
			case 'uskSource':
				this.atem.setUpstreamKeyerFillSource(parseInt(opt.fill), parseInt(opt.mixeffect), parseInt(opt.key));
				this.atem.setUpstreamKeyerCutSource(parseInt(opt.cut), parseInt(opt.mixeffect), parseInt(opt.key));
				break;
			case 'dskSource':
				this.atem.setDownstreamKeyFillSource(parseInt(opt.fill), parseInt(opt.key));
				this.atem.setDownstreamKeyCutSource(parseInt(opt.cut), parseInt(opt.key));
				break;
			case 'aux':
				this.atem.setAuxSource(parseInt(opt.input), parseInt(opt.aux));
				break;
			case 'cut':
				this.atem.cut(parseInt(opt.mixeffect));
				break;
			case 'usk':
				if (opt.onair == 'toggle') {
					this.atem.setUpstreamKeyerOnAir(!this.api.getUSK(opt.mixeffect,opt.key).onAir, parseInt(opt.mixeffect), parseInt(opt.key));
				} else {
					this.atem.setUpstreamKeyerOnAir(opt.onair == 'true', parseInt(opt.mixeffect), parseInt(opt.key));
				}
				break;
			case 'dsk':
				if (opt.onair == 'toggle') {
					this.atem.setDownstreamKeyOnAir(!this.api.getDSK(opt.key).onAir, parseInt(opt.key));
				} else {
					this.atem.setDownstreamKeyOnAir(opt.onair == 'true', parseInt(opt.key));
				}
				break;
			case 'auto':
				this.atem.autoTransition(parseInt(opt.mixeffect));
				break;
			case 'macrorun':
				if (opt.action == 'runContinue' && this.api.getMacro(parseInt(opt.macro)-1).isWaiting == 1) {
					this.atem.macroContinue();
				}
				else if (this.api.getMacro(parseInt(opt.macro)-1).isRecording == 1) {
					this.atem.macroStopRecord()
				}
				else {
					this.atem.macroRun(parseInt(opt.macro)-1);
				}
				break;
			case 'macrocontinue':
				this.atem.macroContinue();
				break;
			case 'macrostop':
				this.atem.macroStop();
				break;
			case 'setMvSource':
				this.atem.setMultiViewerSource( { 'windowIndex': opt.windowIndex, 'source': opt.source }, opt.multiViewerId);
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
	config_fields() {

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

		if (this.atem !== undefined) {
			this.atem.disconnect();
			delete this.atem;
		}

		debug("destroy", this.id);
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

		this.status(this.STATE_UNKNOWN);

		// Unfortunately this is redundant if the switcher goes
		// online right away, but necessary for offline programming
		this.initVariables();
		this.initFeedbacks();
		this.initPresets();

		this.setupAtemConnection();
	}

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
				this.api.getAux(state.auxBus).source = state.properties.source;

				if (this.initDone === true) {
					this.checkFeedbacks('aux_bg');
				}
				break;

			case 'DownstreamKeyPropertiesCommand':
				this.api.updateDSK(state.downstreamKeyerId, state.properties);

				if (this.initDone === true) {
					this.checkFeedbacks('dsk_bg');
				}
				break;

			case 'DownstreamKeySourcesCommand':
				this.api.updateDSK(state.downstreamKeyerId, state.properties);

				var id = state.properties.fillSource;
				this.setVariable('dsk_' + (state.downstreamKeyerId+1) + '_input', (this.config.presets == 1 ? this.api.getSource(id).longName : this.api.getSource(id).shortName));

				if (this.initDone === true) {
					this.checkFeedbacks('dsk_source');
				}
				break;

			case 'DownstreamKeyStateCommand':
				this.api.updateDSK(state.downstreamKeyerId, state.properties);

				if (this.initDone === true) {
					this.checkFeedbacks('dsk_bg');
				}
				break;

			case 'InitCompleteCommand':
				debug('Init done');
				this.initDone = true;
				this.log('info', 'Connected to a ' + this.deviceName);

				this.setAtemModel(this.deviceModel, true);
				this.checkFeedbacks('aux_bg');
				this.checkFeedbacks('preview_bg');
				this.checkFeedbacks('preview_bg_2');
				this.checkFeedbacks('preview_bg_3');
				this.checkFeedbacks('preview_bg_4');
				this.checkFeedbacks('program_bg');
				this.checkFeedbacks('program_bg_2');
				this.checkFeedbacks('program_bg_3');
				this.checkFeedbacks('program_bg_4');
				this.checkFeedbacks('dsk_bg');
				this.checkFeedbacks('dsk_source');
				this.checkFeedbacks('usk_bg');
				this.checkFeedbacks('usk_source');
				this.checkFeedbacks('macro');
				this.checkFeedbacks('mv_source');
				break;

			case 'InputPropertiesCommand':
				this.api.updateSource(state.inputId, state.properties);
				// resend everything, since names of routes might have changed
				if (this.initDone === true) {
					this.initVariables();
				}
				break;

			case 'MixEffectKeyOnAirCommand':
				this.api.updateUSK(state.mixEffect, state.upstreamKeyerId, state.properties);

				if (this.initDone === true) {
					this.checkFeedbacks('usk_bg');
				}
				break;

			case 'MixEffectKeyPropertiesGetCommand':
				this.api.updateUSK(state.mixEffect, state.properties.upstreamKeyerId, state.properties);

				var id = state.properties.fillSource;
				this.setVariable('usk_' + (state.mixEffect+1) + '_' + (state.properties.upstreamKeyerId+1) + '_input', (this.config.presets == 1 ? this.api.getSource(id).longName : this.api.getSource(id).shortName));

				if (this.initDone === true) {
					this.checkFeedbacks('usk_source');
				}
				break;

			case 'MacroPropertiesCommand':
				this.api.updateMacro(state.properties.macroIndex, state.properties);

				if (this.initDone === true) {
					this.checkFeedbacks('macro');
				}
				break;

			case 'MacroRecordingStatusCommand':
				this.api.updateMacro(state.properties.macroIndex, state.properties);

				if (this.initDone === true) {
					this.checkFeedbacks('macro');
				}
				break;

			case 'MacroRunStatusCommand':
				this.api.updateMacro(state.properties.macroIndex, state.properties);

				if (this.initDone === true) {
					this.checkFeedbacks('macro');
				}
				break;

			case 'MultiViewerSourceCommand':
				this.api.updateMvWindow(state.multiViewerId, state.properties.windowIndex, state.properties)

				if (this.initDone === true) {
					this.checkFeedbacks('mv_source');
				}
				break;

			case 'ProductIdentifierCommand':
				this.deviceModel = state.properties.model;
				this.deviceName  = state.properties.deviceName;
				break;

			case 'ProgramInputCommand':
				this.api.getME(state.mixEffect).pgmSrc = state.properties.source;

				var id = state.properties.source;
				this.setVariable('pgm' + (state.mixEffect+1) + '_input', (this.config.presets == 1 ? this.api.getSource(id).longName : this.api.getSource(id).shortName));

				if (this.initDone === true) {
					this.checkFeedbacks('program_bg');
					this.checkFeedbacks('program_bg_2');
					this.checkFeedbacks('program_bg_3');
					this.checkFeedbacks('program_bg_4');
				}
				break;

			case 'PreviewInputCommand':
				this.api.getME(state.mixEffect).pvwSrc = state.properties.source;

				var id = state.properties.source;
				this.setVariable('pvw' + (state.mixEffect+1) + '_input', (this.config.presets == 1 ? this.api.getSource(id).longName : this.api.getSource(id).shortName));

				if (this.initDone === true) {
					this.checkFeedbacks('preview_bg');
					this.checkFeedbacks('preview_bg_2');
					this.checkFeedbacks('preview_bg_3');
					this.checkFeedbacks('preview_bg_4');
				}
				break;

			case 'PreviewTransitionCommand':
				this.api.getME(state.mixEffect).preview = state.properties.preview;

				if (this.initDone === true) {
					this.checkFeedbacks('trans_pvw');
				}
				break;

			case 'TransitionPositionCommand':
				this.api.updateME(state.mixEffect, state.properties);

				var iconId = state.properties.handlePosition / 100;
				iconId = ( iconId >= 90 ? 90 : ( iconId >= 70 ? 70 : ( iconId >= 50 ? 50 : ( iconId >= 30 ? 30 : ( iconId >= 10 ? 10 : 0 )))));
				var newIcon = 'trans' + iconId;

				if (newIcon != this.api.getME(state.mixEffect).transIcon || state.properties.inTransition != this.api.getME(state.mixEffect).inTransition) {
					this.api.getME(state.mixEffect).transIcon    = newIcon;

					if (this.initDone === true) {
						this.checkFeedbacks('trans_state');
					}
				}
				break;

			case 'TransitionPropertiesCommand':
				this.api.updateME(state.mixEffect, state.properties);

				if (this.initDone === true) {
					this.checkFeedbacks('trans_mods');
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

		this.atem = new Atem({ externalLog: this.debug.bind(this) });

		this.atem.on('connected', () => {
			this.status(this.STATE_OK);
		});
		this.atem.on('error', (e) => {
			this.status(this.STATUS_ERROR, e.message);
		});
		this.atem.on('disconnected', () => {
			this.status(this.STATUS_UNKNOWN, 'Disconnected');
			this.initDone = false;
		});
		this.atem.on('stateChanged', this.processStateChange.bind(this));


		if (this.config.host !== undefined) {
			this.atem.connect(this.config.host);
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

		var mvWindows, mvStart;

		if (this.model.id == 9) {
			mvWindows = 16;
			mvStart = 0;
		}
		else {
			mvWindows = 10;
			mvStart = 2;
		}

		for (var i = mvStart; i < mvWindows; i++) {
			this.CHOICES_MVWINDOW.push({ id: i, label: 'Window '+ (i+1) });
		}
	}

	/**
	 * INTERNAL: use model data to define the choices for the source dropdowns.
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	setupSourceChoices() {

		this.api.resetSources();

		this.api.setSource(0,    1, 1, 1, 'Blck','Black');
		this.api.setSource(1000, 1, 1, 1, 'Bars', 'Bars');
		this.api.setSource(2001, 1, 1, 1, 'Col1', 'Color 1');
		this.api.setSource(2002, 1, 1, 1, 'Col2', 'Color 2');
		this.api.setSource(7001, 0, 1, 1, 'Cln1', 'Clean Feed 1');
		this.api.setSource(7002, 0, 1, 1, 'Cln2', 'Clean Feed 2');

		if (this.model.SSrc > 1) {
			this.api.setSource(6000, 1, 1, 1, 'SSc1', 'Super Source 1');
			this.api.setSource(6001, 1, 1, 1, 'SSc2', 'Super Source 2');
		}
		else if (this.model.SSrc > 0) {
			this.api.setSource(6000, 1, 1, 1, 'SSrc', 'Super Source');
		}

		for(var i = 1; i <= this.model.inputs; i++) {
			this.api.setSource(i, 1, 1, 1, (i<10 ? 'In '+i : 'In'+i), 'Input ' + i);
		}

		for(var i = 1; i <= this.model.MPs; i++) {
			this.api.setSource(3000+i*10,   1, 1, 1, 'MP '+i,    'Media Player '+i);
			this.api.setSource(3000+i*10+1, 1, 1, 1, 'MP'+i+'K', 'Media Player '+i+' Key');
		}

		for(var i = 1; i <= this.model.MEs; i++) {
			// ME 1 can't be used as an ME source, hence i>1 for useME
			this.api.setSource(10000+i*10,   (i>1 ? 1 : 0), 1, 1, 'M'+i+'PG', 'ME '+i+' Program');
			this.api.setSource(10000+i*10+1, (i>1 ? 1 : 0), 1, 1, 'M'+i+'PV', 'ME '+i+' Preview');
		}

		for(var i = 1; i <= this.model.auxes; i++) {
			this.api.setSource(8000+i, 0, 0, 1, 'Aux'+i, 'Auxilary '+i);
		}

		this.CHOICES_AUXSOURCES = [];
		this.CHOICES_MESOURCES = [];
		this.CHOICES_MVSOURCES = [];

		var sources = this.api.getSources()

		for(var key in sources) {

			if (sources[key].init == 1 && sources[key].useAux === 1) {
				this.CHOICES_AUXSOURCES.push( { id: key, label: sources[key].label } );
			}

			if (sources[key].init == 1 && sources[key].useME === 1) {
				this.CHOICES_MESOURCES.push( { id: key, label: sources[key].label } );
			}

			if (sources[key].init == 1 && sources[key].useMV === 1) {
				this.CHOICES_MVSOURCES.push( { id: key, label: sources[key].label } );
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
	}
}

exports = module.exports = instance;