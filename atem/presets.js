module.exports = {

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
					label: 'Preview button for ' + this.api.getSource(key).shortName,
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
					label: 'Program button for ' + this.api.getSource(key).shortName,
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
					label: 'AUX' + (i+1) + ' button for ' + this.api.getSource(key).shortName,
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

				for (var input in this.CHOICES_MESOURCES) {
					var key = this.CHOICES_MESOURCES[input].id;

					presets.push({
						category: 'M/E ' + (me+1) + ' Key ' + (i+1),
						label: 'M/E ' + (me+1) + ' Key ' + (i+1) +' source',
						bank: {
							style: 'text',
							text: '$(attem:' + pstText + key + ')',
							size: pstSize,
							color: this.rgb(255,255,255),
							bgcolor: 0
						},
						feedbacks: [
							{
								type: 'usk_source',
								options: {
									bg: this.rgb(238,238,0),
									fg: this.rgb(0,0,0),
									fill: key,
									key: i,
									mixeffect: me
								}
							}
						],
						actions: [
							{
								action: 'uskSource',
								options: {
									onair: 'toggle',
									fill: key,
									cut: (key == 3010 || key == 3020 ? parseInt(key)+1 : 0),
									key: i,

									mixeffect: me
								}
							}
						]
					});
				}
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

			for (var input in this.CHOICES_MESOURCES) {
				var key = this.CHOICES_MESOURCES[input].id;

				presets.push({
					category: 'DSK ' + (i+1),
					label: 'DSK ' + (i+1) +' source',
					bank: {
						style: 'text',
						text: '$(attem:' + pstText + key + ')',
						size: pstSize,
						color: this.rgb(255,255,255),
						bgcolor: 0
					},
					feedbacks: [
						{
							type: 'dsk_source',
							options: {
								bg: this.rgb(238,238,0),
								fg: this.rgb(0,0,0),
								fill: key,
								key: i
							}
						}
					],
					actions: [
						{
							action: 'dskSource',
							options: {
								onair: 'toggle',
								fill: key,
								cut: (key == 3010 || key == 3020 ? parseInt(key)+1 : 0),
								key: i
							}
						}
					]
				});
			}
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

		var mvWindows, mvStart;

		if (this.model.id == 9) {
			mvWindows = 16;
			mvStart = 0;
		}
		else {
			mvWindows = 10;
			mvStart = 2;
		}

		for (var i = 0; i < this.model.MVs; i++) {

			for (var j = mvStart; j < mvWindows; j++) {

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

		//Future loop for multiple SSRC
		for (var i = 0; i < 1; i++) {

			for (var j = 0; j < 4; j++) {

				for (var k in this.CHOICES_MESOURCES) {

					presets.push({
						category: 'SSrc ' + (i+1) + ' Box ' + (j+1),
						label: 'Set SuperSource '+(i+1)+', box '+(j+1)+' to source '+this.CHOICES_MESOURCES[k].label,
						bank: {
							style:   'text',
							text:    '$(attem:' + pstText + this.CHOICES_MESOURCES[k].id + ')',
							size:    pstSize,
							color:   this.rgb(255,255,255),
							bgcolor: this.rgb(0,0,0)
						},
						feedbacks: [
							{
								type: 'ssrc_box_source',
								options: {
									bg:        this.rgb(255,255,0),
									fg:        this.rgb(0,0,0),
									//ssrcId:    i,
									source:    this.CHOICES_MESOURCES[k].id,
									boxIndex:  j
								}
							}
						],
						actions: [
							{
								action: 'setSsrcBoxSource',
								options: {
									//ssrcId:    i,
									source:    this.CHOICES_MESOURCES[k].id,
									boxIndex:  j
								}
							}
						]
					});
				}
			}
		}

		this.setPresetDefinitions(presets);
	}
}