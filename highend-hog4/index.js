var instance_skel = require('../../instance_skel');
var debug;
var log;

/**
 * Companion instance class for the RadioDJ REST API.
 *
 * @extends instance_skel
 * @version 1.0.0
 * @since 1.0.0
 * @author Keith Rocheck <keith.rocheck@gmail.com>
 */
class instance extends instance_skel {

	/**
	 * Create an instance of a RadioDJ module.
	 *
	 * @param {EventEmitter} system - the brains of the operation
	 * @param {string} id - the instance ID
	 * @param {Object} config - saved user configuration parameters
	 * @since 1.0.0
	 */
	constructor(system, id, config) {
		super(system, id, config);

		this.togglePlayState = 1;

		this.PRESETS_ACTIONS = [
			{ id: 'go', label: 'Go' },
			{ id: 'halt', label: 'Halt' },
			{ id: 'release', label: 'Release' },
			{ id: 'resume', label: 'Resume' }
		];

		this.PRESETS_FADERLEVEL = [
			{ id: '0', label: '0%' },
			{ id: '127', label: '50%' },
			{ id: '255', label: '100%' }
		];

		this.CHOICES_PBTYPE = [
			{ id: '0', label: 'Cuelist' },
			{ id: '1', label: 'Scene' },
			{ id: '2', label: 'Macro' }
		];

		this.CHOICES_UPDOWN = [
			{ id: '1', label: 'Press' },
			{ id: '0', label: 'Release' }
		];

		this.CHOICES_HARDWAREKEY = [
			//main keypad
			{ id: 'zero', label: '0' },
			{ id: 'one', label: '1' },
			{ id: 'two', label: '2' },
			{ id: 'three', label: '3' },
			{ id: 'four', label: '4' },
			{ id: 'five', label: '5' },
			{ id: 'six', label: '6' },
			{ id: 'seven', label: '7' },
			{ id: 'eight', label: '8' },
			{ id: 'nine', label: '9' },
			{ id: 'period', label: '.' },
			{ id: 'at', label: '@' },
			{ id: 'minus', label: '-' },
			{ id: 'plus', label: '+' },
			{ id: 'slash', label: '/' },
			{ id: 'thru', label: 'Thru' },
			{ id: 'full', label: 'Full' },
			{ id: 'backspace', label: 'Backspace' },
			{ id: 'enter', label: 'Enter' },
			//navigation
			{ id: 'back', label: 'Back' },
			{ id: 'all', label: 'All' },
			{ id: 'next', label: 'Next' },
			{ id: 'highlight', label: 'Highlight' },
			{ id: 'blind', label: 'Blind' },
			{ id: 'clear', label: 'Clear' },
			{ id: 'up', label: 'Up' },
			{ id: 'down', label: 'Down' },
			{ id: 'left', label: 'Left' },
			{ id: 'right', label: 'Right' },
			//programming
			{ id: 'live', label: 'Live' },
			{ id: 'scene', label: 'Scene' },
			{ id: 'cue', label: 'Cue' },
			{ id: 'macro', label: 'Macro' },
			{ id: 'list', label: 'List' },
			{ id: 'page', label: 'Page' },
			{ id: 'delete', label: 'Delete' },
			{ id: 'move', label: 'Move' },
			{ id: 'copy', label: 'Copy' },
			{ id: 'update', label: 'Update' },
			{ id: 'merge', label: 'Merge' },
			{ id: 'record', label: 'Record' },
			{ id: 'setup', label: 'Setup' },
			{ id: 'goto', label: 'Goto' },
			{ id: 'set', label: 'Set' },
			{ id: 'pig', label: 'Pig' },
			{ id: 'fan', label: 'Fan' },
			{ id: 'open', label: 'Open' },
			//palettes
			{ id: 'intensity', label: 'Intensity' },
			{ id: 'position', label: 'Position' },
			{ id: 'colour', label: 'Colour' },
			{ id: 'beam', label: 'Beam' },
			{ id: 'effect', label: 'Effect' },
			{ id: 'time', label: 'Time' },
			{ id: 'group', label: 'Group' },
			{ id: 'fixture', label: 'Fixture' },
			//playback
			{ id: 'maingo', label: 'Main Play' },
			{ id: 'mainhalt', label: 'Main Halt' },
			{ id: 'mainback', label: 'Main Back' },
			{ id: 'mainchoose', label: 'Center Choose' },
			{ id: 'skipfwd', label: 'Skip Forward' },
			{ id: 'skipback', label: 'Skip Back' },
			{ id: 'assert', label: 'Assert' },
			{ id: 'release', label: 'Release' },
			{ id: 'restore', label: 'Restore' },
			{ id: 'rate', label: 'Rate' }
		];

		this.CHOICES_MASTERKEY = [
			{ id: 'choose', label: 'Choose' },
			{ id: 'go', label: 'Go' },
			{ id: 'pause', label: 'Pause' },
			{ id: 'goback', label: 'Back' },
			{ id: 'flash', label: 'Flash' }
		];

		this.CHOICES_NOTESTATE = [
			{ id: 'on', label: 'Note On' },
			{ id: 'off', label: 'Note Off' }
		];

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

		this.setActions({

			'qlGoCue': {
				label: 'Go on Cue in Cuelist',
				options: [
					{
						type:     'textinput',
						label:    'Cuelist',
						id:       'qlId',
						default:  '1',
						regex:    this.REGEX_NUMBER
					},
					{
						type:     'textinput',
						label:    'Cue',
						id:       'qId',
						default:  '1',
						regex:    this.REGEX_NUMBER
					},
					{
						type:    'dropdown',
						label:   'Action',
						id:      'action',
						choices: this.CHOICES_UPDOWN,
						default: '1'
					}
				]
			},

			'go': {
				label: 'Go on Cuelist, Scene, or Macro',
				options: [
					{
						type:    'dropdown',
						label:   'Type',
						id:      'type',
						choices: this.CHOICES_PBTYPE,
						default: '0'
					},
					{
						type:    'textinput',
						label:   'Number',
						id:      'num',
						default: '1',
						regex:   this.REGEX_NUMBER
					},
					{
						type:    'dropdown',
						label:   'Action',
						id:      'action',
						choices: this.CHOICES_UPDOWN,
						default: '1'
					}
				]
			},

			'halt': {
				label: 'Halt Cuelist, Scene, or Macro',
				options: [
					{
						type:    'dropdown',
						label:   'Type',
						id:      'type',
						choices: this.CHOICES_PBTYPE,
						default: '0'
					},
					{
						type:    'textinput',
						label:   'Number',
						id:      'num',
						default: '1',
						regex:   this.REGEX_NUMBER
					},
					{
						type:    'dropdown',
						label:   'Action',
						id:      'action',
						choices: this.CHOICES_UPDOWN,
						default: '1'
					}
				]
			},

			'release': {
				label: 'Release Cuelist, Scene, or Macro',
				options: [
					{
						type:    'dropdown',
						label:   'Type',
						id:      'type',
						choices: this.CHOICES_PBTYPE,
						default: '0'
					},
					{
						type:    'textinput',
						label:   'Number',
						id:      'num',
						default: '1',
						regex:   this.REGEX_NUMBER
					},
					{
						type:    'dropdown',
						label:   'Action',
						id:      'action',
						choices: this.CHOICES_UPDOWN,
						default: '1'
					}
				]
			},

			'resume': {
				label: 'Resume Cuelist, Scene, or Macro',
				options: [
					{
						type:    'dropdown',
						label:   'Type',
						id:      'type',
						choices: this.CHOICES_PBTYPE,
						default: '0'
					},
					{
						type:    'textinput',
						label:   'Number',
						id:      'num',
						default: '1',
						regex:   this.REGEX_NUMBER
					},
					{
						type:    'dropdown',
						label:   'Action',
						id:      'action',
						choices: this.CHOICES_UPDOWN,
						default: '1'
					}
				]
			},

			'masterKey': {
				label: 'Master Key',
				options: [
					{
						type:    'textinput',
						label:   'Master Number (1-90)',
						id:      'mId',
						default: '1',
						regex:   '/^([0]?[1-9]|[1-8][0-9]|90)$/'
					},
					{
						type:    'dropdown',
						label:   'Key',
						id:      'type',
						choices: this.CHOICES_MASTERKEY,
						default: 'go'
					},
					{
						type:    'dropdown',
						label:   'Action',
						id:      'action',
						choices: this.CHOICES_UPDOWN,
						default: '1'
					}
				]
			},

			'masterFader': {
				label: 'Master Fader Level',
				options: [
					{
						type:    'textinput',
						label:   'Master Number (0 = GM, 1-90)',
						id:      'mId',
						default: '1',
						regex:   '/^([0]?[0-9]|[1-8][0-9]|90)$/'
					},
					{
						type:    'number',
						label:   'Fader Level (0-255)',
						id:      'level',
						default:  255,
						min:      0,
						max:      255,
						required: true,
						range:    true
					}
				]
			},

			'hardwareKey': {
				label: 'Hardware Key',
				options: [
					{
						type:    'dropdown',
						label:   'Key',
						id:      'type',
						choices: this.CHOICES_HARDWAREKEY,
						default: 'pig'
					},
					{
						type:    'dropdown',
						label:   'Action',
						id:      'action',
						choices: this.CHOICES_UPDOWN,
						default: '1'
					}
				]
			},

			'hKey': {
				label: 'H Key',
				options: [
					{
						type:    'textinput',
						label:   'H Key Number',
						id:      'hId',
						default: '1',
						regex:   this.REGEX_NUMBER
					},
					{
						type:    'dropdown',
						label:   'Action',
						id:      'action',
						choices: this.CHOICES_UPDOWN,
						default: '1'
					}
				]
			},

			'midiNote': {
				label: 'MIDI Note',
				options: [
					{
						type:    'dropdown',
						label:   'Action',
						id:      'action',
						choices: this.CHOICES_NOTESTATE,
						default: 'on'
					},
					{
						type:     'number',
						label:    'Channel #',
						id:       'cId',
						default:  1,
						min:      1,
						max:      16,
						required: true,
						range:    true
					},
					{
						type:     'number',
						label:    'Note #',
						id:       'nId',
						default:  1,
						min:      1,
						max:      128,
						required: true,
						range:    true
					},
					{
						type:    'number',
						label:   'Velocity (0 is treated as a Note Off)',
						id:      'velocity',
						default:  127,
						min:      0,
						max:      127,
						required: true,
						range:    true
					}
				]
			},
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
		var cmd;
		var arg = {};
		var opt = action.options;

		switch (action.action){

			case 'qlGoCue':
				arg = {
					type: "f",
					value: parseFloat(opt.action)
				};
				cmd = '/hog/playback/go/0/' + opt.qlId + '.' + opt.qId;
				break;

			case 'go':
				arg = {
					type: "f",
					value: parseFloat(opt.action)
				};
				cmd = '/hog/playback/go/' + opt.type + '/' + opt.num;
				break;

			case 'halt':
				var arg = {
					type: "f",
					value: parseFloat(opt.action)
				};
				cmd = '/hog/playback/halt/' + opt.type + '/' + opt.num;
				break;

			case 'release':
				arg = {
					type: "f",
					value: parseFloat(opt.action)
				};
				cmd = '/hog/playback/release/' + opt.type + '/' + opt.num;
				break;

			case 'resume':
				arg = {
					type: "f",
					value: parseFloat(opt.action)
				};
				cmd = '/hog/playback/resume/' + opt.type + '/' + opt.num;
				break;

			case 'masterKey':
				arg = {
					type: "f",
					value: parseFloat(opt.action)
				};
				cmd = '/hog/hardware/'+ opt.type +'/'+ opt.mId;
				break;

			case 'masterFader':
				arg = {
					type: "f",
					value: parseFloat(opt.level)
				};
				cmd = '/hog/hardware/fader/' + opt.mId;
				break;

			case 'hardwareKey':
				arg = {
					type: "f",
					value: parseFloat(opt.action)
				};
				cmd = '/hog/hardware/' + opt.type;
				break;

			case 'hKey':
				arg = {
					type: "f",
					value: parseFloat(opt.action)
				};
				cmd = '/hog/hardware/h'+ opt.hId;
				break;

			case 'midiNote':
				arg = {
					type: "f",
					value: parseFloat(opt.velocity)
				};
				cmd = '/hog/midi/'+ opt.action +'/'+ opt.cId +'/'+ opt.nId;
				break;
		}

		if (cmd != undefined) {
			debug(cmd,arg);
			this.system.emit('osc_send', this.config.host, this.config.port, cmd, [arg]);
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
				value: 'You must enable \'OSC In\' on the Hog 4 console and set a port'
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				tooltip: 'The IP of the hog4 console',
				width: 6,
				regex: this.REGEX_IP
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target Port',
				width: 4,
				default: '7000',
				regex: this.REGEX_PORT
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
		debug("destory", this.id);
	}

	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	init() {
		this.status(this.STATE_OK); // status ok!
		this.init_presets();
		debug = this.debug;
		log = this.log;
	}

	/**
	 * INTERNAL: initialize presets.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initPresets () {
		var presets = [];

		for (var key in this.CHOICES_HARDWAREKEY) {
			presets.push({
				category: 'Hardware Keys',
				label: this.CHOICES_HARDWAREKEY[key].label,
				bank: {
					style: 'text',
					text: this.CHOICES_HARDWAREKEY[key].label,
					size: '18',
					color: this.rgb(255,255,255),
					bgcolor: this.rgb(0,0,0)
				},
				actions: [
					{
						action: 'hardwareKey',
						options: {
							type: this.CHOICES_HARDWAREKEY[key].id,
							action: '1'
						}
					}
				],
				release_actions: [
					{
						action: 'hardwareKey',
						options: {
							type: this.CHOICES_HARDWAREKEY[key].id,
							action: '0'
						}
					}
				]
			});
		}

		for (var hKey = 1; hKey <= 20; hKey++) {
			presets.push({
				category: 'H Keys',
				label: 'H Key ' + hKey,
				bank: {
					style: 'text',
					text: 'H Key ' + hKey,
					size: '18',
					color: this.rgb(255,255,255),
					bgcolor: this.rgb(0,0,0)
				},
				actions: [
					{
						action: 'hKey',
						options: {
							hId: hKey,
							action: '1'
						}
					}
				],
				release_actions: [
					{
						action: 'hKey',
						options: {
							hId: hKey,
							action: '0'
						}
					}
				]
			});
		}

		for (var midi = 1; midi <= 100; midi++) {
			presets.push({
				category: 'MIDI Notes',
				label: 'MIDI ' + midi,
				bank: {
					style: 'text',
					text: 'MIDI ' + midi,
					size: '18',
					color: this.rgb(255,255,255),
					bgcolor: this.rgb(0,0,0)
				},
				actions: [
					{
						action: 'midiNote',
						options: {
							action: 'on',
							cId: '1',
							nId: midi,
							velocity: '1'
						}
					}
				],
				release_actions: [
					{
						action: 'midiNote',
						options: {
							action: 'on',
							cId: '1',
							nId: midi,
							velocity: '0'
						}
					}
				]
			});
		}

		for( var level in this.PRESETS_FADERLEVEL){
			presets.push({
				category: 'Grand Master',
				label: 'GM @ ' + this.PRESETS_FADERLEVEL[level].label,
				bank: {
					style: 'text',
					text: 'GM @ ' + this.PRESETS_FADERLEVEL[level].label,
					size: '18',
					color: this.rgb(255,255,255),
					bgcolor: this.rgb(0,0,0)
				},
				actions: [
					{
						action: 'masterFader',
						options: {
							mId: '0',
							level: this.PRESETS_FADERLEVEL[level].id
						}
					}
				]
			});
		}

		for (var master = 1; master <= 20; master++) {
			for (var key in this.CHOICES_MASTERKEY) {
				presets.push({
					category: 'Master ' + master,
					label: this.CHOICES_MASTERKEY[key].label + ' Master ' + master,
					bank: {
						style: 'text',
						text: this.CHOICES_MASTERKEY[key].label + ' Master ' + master,
						size: '14',
						color: this.rgb(255,255,255),
						bgcolor: this.rgb(0,0,0)
					},
					actions: [
						{
							action: 'masterKey',
							options: {
								type: this.CHOICES_MASTERKEY[key].id,
								mId: master,
								action: '1'
							}
						}
					],
					release_actions: [
						{
							action: 'masterKey',
							options: {
								type: this.CHOICES_MASTERKEY[key].id,
								mId: master,
								action: '0'
							}
						}
					]
				});
			}

			for( var level in this.PRESETS_FADERLEVEL){
				presets.push({
					category: 'Master ' + master,
					label: 'Master ' + master + ' @ ' + this.PRESETS_FADERLEVEL[level].label,
					bank: {
						style: 'text',
						text: 'Master ' + master + ' @ ' + this.PRESETS_FADERLEVEL[level].label,
						size: '14',
						color: this.rgb(255,255,255),
						bgcolor: this.rgb(0,0,0)
					},
					actions: [
						{
							action: 'masterFader',
							options: {
								mId: master,
								level: this.PRESETS_FADERLEVEL[level].id
							}
						}
					]
				});
			}
		}

		for (var type in this.CHOICES_PBTYPE) {
			for (var seq = 1; seq <= 10; seq++) {
				for( var action in this.PRESETS_ACTIONS) {
					presets.push({
						category: this.CHOICES_PBTYPE[type].label + ' ' + seq,
						label: this.PRESETS_ACTIONS[action].label + ' ' + this.CHOICES_PBTYPE[type].label + ' ' + seq,
						bank: {
							style: 'text',
							text: this.PRESETS_ACTIONS[action].label + ' ' + this.CHOICES_PBTYPE[type].label + ' ' + seq,
							size: '14',
							color: this.rgb(255,255,255),
							bgcolor: this.rgb(0,0,0)
						},
						actions: [
							{
								action: this.PRESETS_ACTIONS[action].id,
								options: {
									type: this.CHOICES_PBTYPE[type].id,
									num: seq,
									action: '1'
								}
							}
						],
						release_actions: [
							{
								action: this.PRESETS_ACTIONS[action].id,
								options: {
									type: this.CHOICES_PBTYPE[type].id,
									num: seq,
									action: '0'
								}
							}
						]
					});
				}

				if ( this.CHOICES_PBTYPE[type].id === '0' ) {
					for( var cId = 1; cId <= 5; cId++) {
						presets.push({
							category: this.CHOICES_PBTYPE[type].label + ' ' + seq,
							label: 'Go on Cue ' + seq + '.' + cId,
							bank: {
								style: 'text',
								text: 'Go on Cue ' + seq + '.' + cId,
								size: '14',
								color: this.rgb(255,255,255),
								bgcolor: this.rgb(0,0,0)
							},
							actions: [
								{
									action: 'qlGoCue',
									options: {
										qlId: seq,
										qId: cId,
										action: '1'
									}
								}
							],
							release_actions: [
								{
									action: 'qlGoCue',
									options: {
										qlId: seq,
										qId: cId,
										action: '0'
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
	 * Process an updated configuration array.
	 *
	 * @param {Object} config - the new configuration
	 * @access public
	 * @since 1.0.0
	 */
	updateConfig(config) {
		this.config = config;
	}
}

exports = module.exports = instance;
