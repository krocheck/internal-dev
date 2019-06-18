var debug;
var log;

/**
 * Companion instance API class for the Blackmagic ATEM Switchers.
 * Utilized to track the state of the live switcher.
 *
 * @version 1.2.0
 * @since 1.2.0
 * @author Keith Rocheck <keith.rocheck@gmail.com>
 */
class instance_api {

	/**
	 * Create an instance of an ATEM module.
	 *
	 * @param {instance} instance - the parent instance
	 * @since 1.2.0
	 */
	constructor(instance) {
		this.instance = instance;

		this.states      = {};
		this.sources     = [];
		this.macros      = [];
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
				windows: {
					window0:  { windowIndex: 0,  source: 0 },
					window1:  { windowIndex: 1,  source: 0 },
					window2:  { windowIndex: 2,  source: 0 },
					window3:  { windowIndex: 3,  source: 0 },
					window4:  { windowIndex: 4,  source: 0 },
					window5:  { windowIndex: 5,  source: 0 },
					window6:  { windowIndex: 6,  source: 0 },
					window7:  { windowIndex: 7,  source: 0 },
					window8:  { windowIndex: 8,  source: 0 },
					window9:  { windowIndex: 9,  source: 0 },
					window10: { windowIndex: 10, source: 0 },
					window11: { windowIndex: 11, source: 0 },
					window12: { windowIndex: 12, source: 0 },
					window13: { windowIndex: 13, source: 0 },
					window14: { windowIndex: 14, source: 0 },
					window15: { windowIndex: 15, source: 0 }
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
	 * INTERNAL: returns the sources object.
	 *
	 * @returns {Object} the sources object
	 * @access protected
	 * @since 1.2.0
	 */
	getSources() {
		return this.sources;
	}

	/**
	 * INTERNAL: returns the desired SuperSource object.
	 *
	 * @param {number} id - the ssrc id to fetch
	 * @returns {Object} the desired ssrc object
	 * @access protected
	 * @since 1.1.7
	 */
	getSuperSource(id = 0) {

		if (this.states['ssrc' + id] === undefined) {
			this.states['ssrc' + id] = {
				artFillSource:              0,
				artCutSource:               0,
				artOption:                  0,
				artPreMultiplied:           0,
				artClip:                    0,
				artGain:                    0,
				artInvertKey:               0,
				borderEnabled:              0,
				borderBevel:                0,
				borderOuterWidth:           0,
				borderInnerWidth:           0,
				borderOuterSoftness:        0,
				borderInnerSoftness:        0,
				borderBevelSoftness:        0,
				borderBevelPosition:        0,
				borderHue:                  0,
				borderSaturation:           0,
				borderLuma:                 0,
				borderLightSourceDirection: 0,
				borderLightSourceAltitude:  0
			};
		}

		return this.states['ssrc' + id];
	}

	/**
	 * INTERNAL: returns the SuperSource cascade state.
	 *
	 * @returns {boolean} the desired ssrc object
	 * @access protected
	 * @since 1.2.0
	 */
	getSuperSourceCascade() {

		if (this.states['ssrc_cascade'] === undefined) {
			this.states['ssrc_cascade'] = {
				enabled: false
			};
		}

		return this.states['ssrc_cascade'];
	}

	/**
	 * INTERNAL: returns the desired SuperSource box object.
	 *
	 * @param {number} box - the ssrc box to fetch
	 * @param {number} id - the ssrc id to fetch
	 * @returns {Object} the desired ssrc object
	 * @access protected
	 * @since 1.1.7
	 */
	getSuperSourceBox(box, id = 0) {

		if (this.states['ssrc' + id + 'box' + box] === undefined) {
			this.states['ssrc' + id + 'box' + box] = {
				enabled:    0,
				source:     0,
				x:          0,
				y:          0,
				size:       0,
				cropped:    0,
				cropTop:    0,
				cropBottom: 0,
				cropLeft:   0,
				cropRight:  0
			};
		}

		return this.states['ssrc' + id + 'box' + box];
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

				this.instance.setVariable('macro_' + (id+1), (macro.description != '' ? macro.description : macro.label));
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
	 * Update an array of properties for a SuperSource.
	 *
	 * @param {number} id - the SuperSource id
	 * @param {Object} properties - the new properties
	 * @access public
	 * @since 1.1.7
	 */
	updateSuperSource(id, properties) {
		var ssrc = this.getSuperSource(id);

		if (typeof properties === 'object') {
			for (var x in properties) {
				ssrc[x] = properties[x];
			}
		}
	}

	/**
	 * Update an array of properties for a SuperSource.
	 *
	 * @param {number} box - the box id
	 * @param {number} id - the SuperSource id
	 * @param {Object} properties - the new properties
	 * @access public
	 * @since 1.1.7
	 */
	updateSuperSourceBox(box, id, properties) {
		var box = this.getSuperSourceBox(box, id);

		if (typeof properties === 'object') {
			for (var x in properties) {
				box[x] = properties[x];
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

exports = module.exports = instance_api;