var instance_skel = require('../../instance_skel');
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
		this.states      = {};
		this.sources     = [];
		this.macros      = [];
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

		this.ICONS = {
			trans0:  'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6CAYAAAATBx+NAAABEUlEQVR4nO3XsYqDQBRG4ZthQDs73//57OwUxIQRHKIkni4EPF+36xbLj3uz5xERz9BXyWmuORDI749zztF1XTRNs309z3OM4xjLsvzfb/4j9QaVcfq+j5SOL9W6rjEMw21HqmuUN+c8zvYDKW3P7qousv9ZfdK2rQMJBioH+Ztpmm47Xx2ofFqVg3xWvlee3dXhP+n9Y36/OeXN8WPe1LjkkQYOBEwNYGoAUwOYGsAjDUwNYGoAUwOYGsAjDRwImBrA1ACmBjA1gEcamBrA1ACmBjA1gEcaOBAwNYCpAUwNYGoAjzQwNYCpAUwNYGoAjzRwIGBqAFMDmBrA1AAeaWBqAFMDmBrA1AAeaeBAVyLiBWXm8V8PJiWhAAAAAElFTkSuQmCC',
			trans10: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6CAYAAAATBx+NAAABk0lEQVR4nO2XP04CQRjFn4ZYbFg1NHqANdhgxwk0HkDPyQWMnoAOCk1Yem0wAqEwJGM+cCfs39eJYd5vs8ky3xabl8wbfkcOcBC1HCuaZhQQobU7XkYRRkmCj05n8/tiNsNNmqK9Wv2/L/8jfActoggv/T6+W7nMcLJe43Y4RBxoSH6LjZOkFI5hazYLFR9Qtq2qeG+YHToqaYIPyAq5jsuG2aHjA+pNp5tCLmJrNguV3D9pO8nGhWO+l6bBnmAoBiTKqKQJCogg1SBINQhSDYJUg6CSJkg1CFINglSDINUgqKQJCogg1SBINQhSDYJUg6CSJkg1CFINglSDINUgqKQJCogg1SBINQhSDYJUg6CSJkg1CFINglSDINUgqKQJCoiQC2hyBTwOgLOv7W3PthY01kF2v3Xhzj/hipet2Sx7L7TbB/QwKIeTXTYLNSB/itmWmp9W76X2EljEYe4zlTTBB3T3XP/i/dPev3N/ZHvt9bq+pG0WfEm735PMCjmeb297DvkEc7slLapRSRMUUBMAfgCe/BxFmDkyuQAAAABJRU5ErkJggg==',
			trans30: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6CAYAAAATBx+NAAABnUlEQVR4nO2XTUoDQRSESwkuhoxKNnqAEd3EXU6geAA9Zy4geoLskoWCk71uIiYhCwm0vMRp5r92RtL1NQ09/WYxFLx6UwcOcBCNHEqadiQQoZMvL6MI4yTBR6+3eT6bzXCdpuiuVv/vy/8I70GLKMLzYIDvTkEzHK3XuBmNEAcqkm+xSZJUxDHszmqh4gXK2qqO95baviOTJniBzJCbOG+p7TteoP50ujHkMnZntVAp/EnbJJuUxnw/TYOdYCgLJKrIpAkSiKCoQVDUIChqEBQ1CDJpgqIGQVGDoKhBUNQgyKQJEoigqEFQ1CAoahAUNQgyaYKiBkFRg6CoQVDUIMikCRKIUBDo7QJ4GAInX9ttZ7sLGvMg26+XcKefcOVld1bL3gtte4Huh1VxsmW1UAXyU8xaan5c30vdJbCIw+wzmTTBC3T71Pzi3ePOv3N3ZL32ctVs0lYL3qTd7yQzQ47n223nkCeYy5u0qEcmTZBABEUNRt6gFTVappiiBpliihr1yKQJihqMrNcUNYhJO0WNdpMW9cikCRKoDQA/aDI3GCpYlokAAAAASUVORK5CYII=',
			trans50: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6CAYAAAATBx+NAAABqUlEQVR4nO2XQUoDQRRESwkuBqOSjR5gRDdxlxMoHkDPmQuIniA7s1BwstdNxCRkIYGWnzjNZNLTtTOSrtc09PSfxVDw60/tOcBBNLIvaeJIIEKrWp5lGZ7zHB+dzvL5dDzGVVHgcD7/f1/+R3gPmmYZnno9fLfWNMPBYoHrwQDtREXyLTbM8w1xDLuzWqp4gcq2CvEeqe06MmmCF8gMuYmzSG3X8QJ1R6OlIdexO6ulytqftE2yYW3Md4si2QmGukBiE5k0QQIRFDUIihoERQ2CogZBJk1Q1CAoahAUNQiKGgSZNEECEdYEejsH7vvA8ddq29nuksY8yPbrBdzJJ1x92Z3VyvdS216gu/6mOOWyWqoC+SlmLTU5CvfS4QyYttPsM5k0wQt089j84u3D1r9ze5S99nLZbNJWS96k3e8kM0NuT1bbzilPMFc1aRFGJk2QQARFDUbVoBU1IlNMUYNMMUWNMDJpgqIGo+w1RQ1i0k5RI27SIoxMmiCBCIoajKpBK2pEppiiBpliihphZNIERQ1G2WuKGsSknaJG3KRFGJk0QQLFAPADXxxR6+1L46oAAAAASUVORK5CYII=',
			trans70: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6CAYAAAATBx+NAAABs0lEQVR4nO2XQUrDQBiFf6W4CI1KN3qAiG7qridQPICesxcQPUF37ULBdK+bim3pQgojf+sMk2Qyb2el874QSOfPIjz43+s7MCJGSCuHlCYOBQJ0/PEyy2RcFPLR621+n81mcl2W0l2t/t+X/xHOgxZZJs+DgXx3KprJ0XotN6OR5ImK5FZsUhQNcRQ901mqOIHsWoV4j8z2HZo0wAmkhtzGeWS27ziB+tPpxpDr6JnOUqXyT1qTbFKL+X5ZJptgUheINKFJAygQoCLQ24XIw1Dk5Gt767OeJY16kN6vl2JOP8XULz3TmX0vtdsJdD9simMvnaUqkEsxXan5cXiXukuRRZ7mntGkAU6g26f2F+8ed/6du8Pu2stVu0nrLHmTNr9Jpoacz7e3PqecYMY3aRKGJg2gQABWDYRv0KwakRRj1QApxqoRhiYNYNVA2F1j1QAmbVg14iZNwtCkARQIwKqB8A2aVSOSYqwaIMVYNcLQpAGsGgi7a6wawKQNq0bcpEkYmjSAAgFYNRC+QbNqRFKMVQOkGKtGGJo0gFUDYXeNVQOYtGHViJs0CUOTBlCgGCLyA4O6bL7/MAr3AAAAAElFTkSuQmCC',
			trans90: 'iVBORw0KGgoAAAANSUhEUgAAAEgAAAA6CAYAAAATBx+NAAABS0lEQVR4nO2XQUoDQRBFS9cm5hLBHERyAD1nLhByjwgeIiS6LyliD62pqb/Mot8bGoaZWQwf6hfvwc3cYJZHoqkhIMGfgD7XZu87s+fz9cR9PBua6KA4Hy/mq5P5/yuexbv23WhnCuhtdxtOu+LdqAFNWyxG6rLMZ+np2+xrMeacUdKCKaDXw/yH2/3d//N+tFk7buZLOt4NX9L+u8mikBeX64n7kTeY9yUNOZS0gIAEqIaiL2hUo9hiqIbYYqhGDiUtQDUUbdZQDVHSjmrUJQ05lLSAgASohqIvaFSj2GKohthiqEYOJS1ANRRt1lANUdKOatQlDTmUtICABKiGoi9oVKPYYqiG2GKoRg4lLUA1FG3WUA1R0o5q1CUNOZS0gIAEqIaiL2hUo9hiqIbYYqhGDiUtQDUUbdZQDVHSjmrUJQ05lLSAgCrM7AfWDIeR8gJXywAAAABJRU5ErkJggg=='
		};

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
				label: 'Change MV layout',
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
						id:      'layout',
						label:   'Layout',
						default: 0,
						choices: this.CHOICES_MVLAYOUT
					}
				]
			},
			'setMvWindow': {
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
			case 'aux':
				this.atem.setAuxSource(parseInt(opt.input), parseInt(opt.aux));
				break;
			case 'cut':
				this.atem.cut(parseInt(opt.mixeffect));
				break;
			case 'usk':
				if (opt.onair == 'toggle') {
					this.atem.setUpstreamKeyerOnAir(!this.getUSK(opt.mixeffect,opt.key).onAir, parseInt(opt.mixeffect), parseInt(opt.key));
				} else {
					this.atem.setUpstreamKeyerOnAir(opt.onair == 'true', parseInt(opt.mixeffect), parseInt(opt.key));
				}
				break;
			case 'dsk':
				if (opt.onair == 'toggle') {
					this.atem.setDownstreamKeyOnAir(!this.getDSK(opt.key).onAir, parseInt(opt.key));
				} else {
					this.atem.setDownstreamKeyOnAir(opt.onair == 'true', parseInt(opt.key));
				}
				break;
			case 'auto':
				this.atem.autoTransition(parseInt(opt.mixeffect));
				break;
			case 'macrorun':
				if (opt.action == 'runContinue' && this.getMacro(parseInt(opt.macro)-1).isWaiting == 1) {
					this.atem.macroContinue();
				}
				else if (this.getMacro(parseInt(opt.macro)-1).isRecording == 1) {
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
			case 'setMvLayout':
				this.atem.setMultiViewerProperties( { 'layout': opt.layout }, opt.multiViewerId);
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
		var opt = feedback.options;

		if (feedback.type == 'preview_bg') {
			if (this.getME(opt.mixeffect).pvwSrc == parseInt(opt.input)) {
				out = { color: opt.fg, bgcolor: opt.bg };
			}
		}
		else if (feedback.type == 'program_bg') {
			if (this.getME(opt.mixeffect).pgmSrc == parseInt(opt.input)) {
				out = { color: opt.fg, bgcolor: opt.bg };
			}
		}
		else if (feedback.type == 'aux_bg') {
			if (this.getAux(opt.aux).source == parseInt(opt.input)) {
				out = { color: opt.fg, bgcolor: opt.bg };
			}
		}
		else if (feedback.type == 'usk_bg') {
			if (this.getUSK(opt.mixeffect, opt.key).onAir) {
				out = { color: opt.fg, bgcolor: opt.bg };
			}
		}
		else if (feedback.type == 'dsk_bg') {
			if (this.getDSK(opt.key).onAir) {
				out = { color: opt.fg, bgcolor: opt.bg };
			}
		}
		else if (feedback.type == 'macro') {
			if ( this.getMacro(parseInt(opt.macroIndex)-1)[opt.state] == 1 ) {
				out = { color: opt.fg, bgcolor: opt.bg };
			}
		}
		else if (feedback.type == 'mv_layout') {
			if (this.getMV(feedback.multiViewerId).layout == parseInt(opt.layout)) {
				out = { color: opt.fg, bgcolor: opt.bg };
			}
		}
		else if (feedback.type == 'mv_source') {
			if (this.getMvWindow(opt.multiViewerId, opt.windowIndex).source == opt.source) {
					out = { color: opt.fg, bgcolor: opt.bg };
			}
		}

		return out;
	}

	/**
	 * INTERNAL: returns the desired Aux state object.
	 *
	 * @param {number} id - the aux id to fetch
	 * @returns {Object} the desired aux object
	 * @access protected
	 * @since 1.1.0
	 */
	getAux(id) {
		return this.getSource(8000+id+1);
	}

	/**
	 * INTERNAL: returns the desired DSK state object.
	 *
	 * @param {number} id - the DSK id to fetch
	 * @returns {Object} the desired DSK object
	 * @access protected
	 * @since 1.1.0
	 */
	getDSK(id) {

		if (this.states['dsk_' + id] === undefined) {
			this.states['dsk_' + id] = {
				downstreamKeyerId: id,
				fillSource:        0,
				cutSource:         0,
				onAir:             0,
				tie:               0,
				rate:              30,
				inTransition:      0,
				transIcon:        'trans0',
				isAuto:           0,
				remaingFrames:    0
			};
		}

		return this.states['dsk_' + id];
	}

	/**
	 * INTERNAL: returns the desired macro state object.
	 * These are indexed -1 of the human value.
	 *
	 * @param {number} id - the macro id to fetch
	 * @returns {Object} the desired macro object
	 * @access protected
	 * @since 1.1.0
	 */
	getMacro(id) {

		if (this.macros[id] === undefined) {
			this.macros[id] = {
				macroIndex:  id,
				isRunning:   0,
				isWaiting:   0,
				isUsed:      0,
				isRecording: 0,
				loop:        0,
				label:       'Macro ' + (id+1),
				name:        'Macro ' + (id+1),
				description: ''
			};
		}

		return this.macros[id];
	}

	/**
	 * INTERNAL: returns the desired ME state object.
	 *
	 * @param {number} id - the ME to fetch
	 * @returns {Object} the desired ME object
	 * @access protected
	 * @since 1.1.0
	 */
	getME(id) {

		if (this.states['me_' + id] === undefined) {
			this.states['me_' + id] = {
				mixEffect:       id,
				handlePosition:  0,
				remainingFrames: 0,
				inTransition:    0,
				style:           0,
				transIcon:       'trans0',
				selection:       1,
				preview:         0,
				pgmSrc:          0,
				pvwSrc:          0
			};
		}

		return this.states['me_' + id];
	}

	/**
	 * INTERNAL: returns the desired MV state object.
	 *
	 * @param {number} id - the MV to fetch
	 * @returns {Object} the desired MV object
	 * @access protected
	 * @since 1.1.0
	 */
	getMV(id) {

		if (this.states['mv_' + id] === undefined) {
			this.states['mv_' + id] = {
				multiViewerId:  id,
				layout:         0,
				windows: {
					window0: { windowIndex: 0, source: 0 },
					window1: { windowIndex: 1, source: 0 },
					window2: { windowIndex: 2, source: 0 },
					window3: { windowIndex: 3, source: 0 },
					window4: { windowIndex: 4, source: 0 },
					window5: { windowIndex: 5, source: 0 },
					window6: { windowIndex: 6, source: 0 },
					window7: { windowIndex: 7, source: 0 },
					window8: { windowIndex: 8, source: 0 },
					window9: { windowIndex: 9, source: 0 }
				}
			};
		}

		return this.states['mv_' + id];
	}

	/**
	 * INTERNAL: returns the desired mv window state object.
	 *
	 * @param {number} mv - the MV of the window to fetch
	 * @param {number} window - the index of the window to fetch
	 * @returns {Object} the desired MV window object
	 * @access protected
	 * @since 1.1.0
	 */
	getMvWindow(mv, window) {

		return this.getMV(mv).windows['window' + window];
	}

	/**
	 * INTERNAL: returns the desired source object.
	 *
	 * @param {number} id - the source to fetch
	 * @returns {Object} the desired source object
	 * @access protected
	 * @since 1.1.0
	 */
	getSource(id) {

		if (this.sources[id] === undefined) {
			this.sources[id] = {
				inputId:        0,
				init:           0,
				label:          '',
				shortLabel:     '',
				useME:          0,
				useAux:         0,
				useMV:          0,
				longName:       '',
				shortName:      ''
			};
		}

		return this.sources[id];
	}

	/**
	 * INTERNAL: returns the desired USK state object.
	 *
	 * @param {number} me - the ME of the USK to fetch
	 * @param {number} keyer - the ID of the USK to fetch
	 * @returns {Object} the desired USK object
	 * @access protected
	 * @since 1.1.0
	 */
	getUSK(me, keyer) {

		if (this.states['usk_' + me + '_' + keyer] === undefined) {
			this.states['usk_' + me + '_' + keyer] = {
				mixEffect:        me,
				upstreamKeyerId:  keyer,
				mixEffectKeyType: 0,
				fillSource:       0,
				cutSource:        0,
				onAir:            0
			};
		}

		return this.states['usk_' + me + '_' + keyer];
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
					id:      'multiViewerId',
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
					label: 'Preview button for ' + this.getSource(key).shortName,
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
					label: 'Program button for ' + this.getSource(key).shortName,
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
					label: 'AUX' + (i+1) + ' button for ' + this.getSource(key).shortName,
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
		for (var i = 0; i < this.model.macros; i++) {
			presets.push({
				category: 'MACROS',
				label: 'Run button for macro ' + (i+1),
				bank: {
					style:   'text',
					text:    '$(attem:macro_' + (i+1) + ')',
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
							macroIndex: (i+1),
							state:      'isUsed'
						}
					},
					{
						type: 'macro',
						options: {
							bg:         this.rgb(0,238,0),
							fg:         this.rgb(255,255,255),
							macroIndex: (i+1),
							state:      'isRunning'
						}
					},
					{
						type: 'macro',
						options: {
							bg:         this.rgb(238,238,0),
							fg:         this.rgb(255,255,255),
							macroIndex: (i+1),
							state:      'isWaiting'
						}
					},
					{
						type: 'macro',
						options: {
							bg:         this.rgb(238,0,0),
							fg:         this.rgb(255,255,255),
							macroIndex: (i+1),
							state:      'isRecording'
						}
					}
				],
				actions: [
					{
						action: 'macrorun',
						options: {
							macro:  (i+1),
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
								multiViewerId:   i,
								layout: this.CHOICES_MVLAYOUT[x].id
							}
						}
					],
					actions: [
						{
							action: 'setMvLayout',
							options: {
								multiViewerId:   i,
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
										multiViewerId:        i,
										source:      this.CHOICES_MVSOURCES[k].id,
										windowIndex: j
									}
								}
							],
							actions: [
								{
									action: 'setMvSource',
									options: {
										multiViewerId:        i,
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

			var id = this.getME(i).pgmSrc;
			this.setVariable('pgm' + (i+1) + '_input', (this.config.presets == 1 ? this.getSource(id).longName : this.getSource(id).shortName));

			variables.push({
				label: 'Label of input active on preview bus (M/E ' + (i+1) + ')',
				name: 'pvw' + (i+1) + '_input'
			});

			var id = this.getME(i).pvwSrc;
			this.setVariable('pvw' + (i+1) + '_input', (this.config.presets == 1 ? this.getSource(id).longName : this.getSource(id).shortName));

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

			this.setVariable('long_' + key,  this.getSource(key).longName);
			this.setVariable('short_' + key, this.getSource(key).shortName);
		}

		// Macros
		for (var i = 0; i < this.model.macros; i++) {
			variables.push({
				label: 'Name of macro id ' + (i+1),
				name: 'macro_' + (i+1)
			});

			this.setVariable('macro_' + (i+1), (this.getMacro(i).name != '' ? this.getMacro(i).name : this.getMacro(i).label));
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
				this.getAux(state.auxBus).source = state.properties.source;

				if (this.initDone === true) {
					this.checkFeedbacks('aux_bg');
				}
				break;

			case 'DownstreamKeyPropertiesCommand':
				this.updateDSK(state.downstreamKeyerId, state.properties);

				if (this.initDone === true) {
					this.checkFeedbacks('dsk_bg');
				}
				break;

			case 'DownstreamKeySourcesCommand':
				this.updateDSK(state.downstreamKeyerId, state.properties);

				if (this.initDone === true) {
					this.checkFeedbacks('dsk_bg');
				}
				break;

			case 'DownstreamKeyStateCommand':
				this.updateDSK(state.downstreamKeyerId, state.properties);

				if (this.initDone === true) {
					this.checkFeedbacks('dsk_bg');
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

			case 'InputPropertiesCommand':
				this.updateSource(state.inputId, state.properties);
				// resend everything, since names of routes might have changed
				if (this.initDone === true) {
					this.initVariables();
				}
				break;

			case 'MixEffectKeyOnAirCommand':
				this.updateUSK(state.mixEffect, state.upstreamKeyerId, state.properties);

				if (this.initDone === true) {
					this.checkFeedbacks('usk_bg');
				}
				break;

			case 'MixEffectKeyPropertiesGetCommand':
				
				break;

			case 'MacroPropertiesCommand':
				this.updateMacro(state.properties.macroIndex, state.properties);

				if (this.initDone === true) {
					this.checkFeedbacks('macro');
				}
				break;

			case 'MacroRecordStatusCommand':
				this.updateMacro(state.properties.macroIndex, state.properties);

				if (this.initDone === true) {
					this.checkFeedbacks('macro');
				}
				break;

			case 'MacroRunStatusCommand':
				this.updateMacro(state.properties.macroIndex, state.properties);

				if (this.initDone === true) {
					this.checkFeedbacks('macro');
				}
				break;

			case 'MultiViewerPropertiesCommand':
				this.updateMV(state.multiViewerId, this.properties);

				if (this.initDone === true) {
					this.checkFeedbacks('mv_layout');
				}
				break;

			case 'MultiViewerSourceCommand':
				this.updateMvWindow(state.multiViewerId, state.properties.windowIndex, state.properties)

				if (this.initDone === true) {
					this.checkFeedbacks('mv_source');
				}
				break;

			case 'ProductIdentifierCommand':
				this.deviceModel = state.properties.model;
				this.deviceName  = state.properties.deviceName;
				this.setAtemModel(this.deviceModel, true);
				break;

			case 'ProgramInputCommand':
				this.getME(state.mixEffect).pgmSrc = state.properties.source;

				var id = state.properties.source;
				this.setVariable('pgm' + (state.mixEffect+1) + '_input', (this.config.presets == 1 ? this.getSource(id).longName : this.getSource(id).shortName));

				if (this.initDone === true) {
					this.checkFeedbacks('program_bg');
				}
				break;

			case 'PreviewInputCommand':
				this.getME(state.mixEffect).pvwSrc = state.properties.source;

				var id = state.properties.source;
				this.setVariable('pvw' + (state.mixEffect+1) + '_input', (this.config.presets == 1 ? this.getSource(id).longName : this.getSource(id).shortName));

				if (this.initDone === true) {
					this.checkFeedbacks('preview_bg');
				}
				break;

			case 'PreviewTransitionCommand':
				this.getME(state.mixEffect).preview = state.properties.preview;

				if (this.initDone === true) {
					this.checkFeedbacks('trans_pvw');
				}
				break;

			case 'TransitionPositionCommand':
				this.updateME(state.mixEffect) = state.properties;

				var iconId = state.properties.handlePosition / 100;
				iconId = ( iconId >= 90 ? 90 : ( iconId >= 70 ? 70 : ( iconId >= 50 ? 50 : ( iconId >= 30 ? 30 : ( iconId >= 10 ? 10 : 0 )))));
				var newIcon = 'trans' + iconId;

				if (newIcon != this.getME(state.mixEffect).transIcon || state.properties.inTransition != this.getME(state.mixEffect).inTransition) {
					this.getME(state.mixEffect).transIcon    = newIcon;

					if (this.initDone === true) {
						this.checkFeedbacks('trans_state');
					}
				}
				break;

			case 'TransitionPropertiesCommand':
				this.updateME(state.mixEffect) = state.properties;

				if (this.initDone === true) {
					this.checkFeedbacks('trans_mods');
				}
				break;
		}
	}

	/**
	 * INTERNAL: Resets the init flag in the sources so that the now mode
	 * can be processed without deleting the existing data.
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	resetSources() {

		for (var x in this.sources) {
			this.sources[x].init = 0;
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
	 * INTERNAL: populate base source data into its object.
	 *
	 * @param {number} id - the source id
	 * @param {number} useME - number, but 0,1, if the source is available to MEs
	 * @param {number} useAux - number, but 0,1, if the source is available to Auxes
	 * @param {number} useMV - number, but 0,1, if the source is available to MVs
	 * @param {String} shortLabel - the source's base short name
	 * @param {String} label - the source's base long name
	 * @access protected
	 * @since 1.1.0
	 */
	setSource(id, useME, useAux, useMV, shortLabel, label) {
		
		var source = this.getSource(id);

		// Use ATEM names if we got um
		if (source.longName != '') {
			source.label = source.longName;
		}
		else {
			source.label = label;
			source.longName = label;
		}

		if (source.shortName != '') {
			source.shortLabel = source.shortName
		}
		else {
			source.shortLabel = shortLabel;
			source.shortName = shortLabel;
		}

		source.id = id;
		source.useME = useME;
		source.useAux = useAux;
		source.useMV = useMV;
		source.init = 1;
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
	}

	/**
	 * INTERNAL: use model data to define the choices for the source dropdowns.
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	setupSourceChoices() {

		this.resetSources();

		this.setSource(0, 1, 1, 1, 'Blck','Black');
		this.setSource(1000, 1, 1, 1, 'Bars', 'Bars');
		this.setSource(2001, 1, 1, 1, 'Col1', 'Color 1');
		this.setSource(2002, 1, 1, 1, 'Col2', 'Color 2');
		this.setSource(7001, 0, 1, 1, 'Cln1', 'Clean Feed 1');
		this.setSource(7002, 0, 1, 1, 'Cln2', 'Clean Feed 2');

		if (this.model.SSrc > 0) {
			this.setSource(6000, 1, 1, 1, 'SSrc', 'Super Source');
		}

		for(var i = 1; i <= this.model.inputs; i++) {
			this.setSource(i, 1, 1, 1, (i<10 ? 'In '+i : 'In'+i), 'Input ' + i);
		}

		for(var i = 1; i <= this.model.MPs; i++) {
			this.setSource(3000+i*10,   1, 1, 1, 'MP '+i,    'Media Player '+i);
			this.setSource(3000+i*10+1, 1, 1, 1, 'MP'+i+'K', 'Media Player '+i+' Key');
		}

		for(var i = 1; i <= this.model.MEs; i++) {
			// ME 1 can't be used as an ME source, hence i>1 for useME
			this.setSource(10000+i*10,   (i>1 ? 1 : 0), 1, 1, 'M'+i+'PG', 'ME '+i+' Program');
			this.setSource(10000+i*10+1, (i>1 ? 1 : 0), 1, 1, 'M'+i+'PV', 'ME '+i+' Preview');
		}

		for(var i = 1; i <= this.model.auxes; i++) {
			this.setSource(8000+i, 0, 0, 1, 'Aux'+i, 'Auxilary '+i);
		}

		this.CHOICES_AUXSOURCES = [];
		this.CHOICES_MESOURCES = [];
		this.CHOICES_MVSOURCES = [];

		for(var key in this.sources) {

			if (this.sources[key].init == 1 && this.sources[key].useAux === 1) {
				this.CHOICES_AUXSOURCES.push( { id: key, label: this.sources[key].label } );
			}

			if (this.sources[key].init == 1 && this.sources[key].useME === 1) {
				this.CHOICES_MESOURCES.push( { id: key, label: this.sources[key].label } );
			}

			if (this.sources[key].init == 1 && this.sources[key].useMV === 1) {
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
	}

	/**
	 * Update an array of properties for a DSK.
	 *
	 * @param {number} id - the source id
	 * @param {Object} properties - the new properties
	 * @access public
	 * @since 1.1.0
	 */
	updateDSK(id, properties) {
		var dsk = this.getDSK(id);

		if (typeof properties === 'object') {
			for (var x in properties) {
				dsk[x] = properties[x];
			}
		}
	}

	/**
	 * Update an array of properties for a macro.
	 *
	 * @param {number} id - the macro id
	 * @param {Object} properties - the new properties
	 * @access public
	 * @since 1.1.0
	 */
	updateMacro(id, properties) {

		if (typeof properties === 'object') {

			if (id == 65535) {
				for (var x in properties) {
					if (properties[x] == 0) {
						for( var i in this.macros) {
							this.macros[i][x] = properties[x];
						}
					}
				}
			}
			else {
				var macro = this.getMacro(id);

				for (var x in properties) {
					macro[x] = properties[x];
				}

				this.setVariable('macro_' + (id+1), (macro.description != '' ? macro.description : macro.label));
			}
		}
	}

	/**
	 * Update an array of properties for a ME.
	 *
	 * @param {number} id - the ME id
	 * @param {Object} properties - the new properties
	 * @access public
	 * @since 1.1.0
	 */
	updateME(id, properties) {
		var me = this.getME(id);

		if (typeof properties === 'object') {
			for (var x in properties) {
				me[x] = properties[x];
			}
		}
	}

	/**
	 * Update an array of properties for a MV.
	 *
	 * @param {number} id - the MV id
	 * @param {Object} properties - the new properties
	 * @access public
	 * @since 1.1.0
	 */
	updateMV(id, properties) {
		var mv = this.getMV(id);

		if (typeof properties === 'object') {
			for (var x in properties) {
				mv[x] = properties[x];
			}
		}
	}

	/**
	 * Update an array of properties for a MV window.
	 *
	 * @param {number} mv - the MV of the window
	 * @param {number} window - the index of the window
	 * @param {Object} properties - the new properties
	 * @access public
	 * @since 1.1.0
	 */
	updateMvWindow(mv, window, properties) {
		var index = this.getMvWindow(mv, window);

		if (typeof properties === 'object') {
			for (var x in properties) {
				index[x] = properties[x];
			}
		}
	}

	/**
	 * Update an array of properties for a source.
	 *
	 * @param {number} id - the source id
	 * @param {Object} properties - the new properties
	 * @access public
	 * @since 1.1.0
	 */
	updateSource(id, properties) {
		var source = this.getSource(id);

		if (typeof properties === 'object') {
			for (var x in properties) {
				source[x] = properties[x];
			}
		}
	}

	/**
	 * Update an array of properties for a USK.
	 *
	 * @param {number} me - the ME of the USK
	 * @param {number} keyer - the ID of the USK
	 * @param {Object} properties - the new properties
	 * @access public
	 * @since 1.1.0
	 */
	updateUSK(me, keyer, properties) {
		var usk = this.getUSK(me, keyer);

		if (typeof properties === 'object') {
			for (var x in properties) {
				usk[x] = properties[x];
			}
		}
	}
}

exports = module.exports = instance;
