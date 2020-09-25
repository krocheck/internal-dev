var fs = require('fs');
var path = require('app-root-path');

/**
 * Companion instance icons class for Shure Wireless.
 * Utilized to generate/recall the icons for realtime monitoring.
 *
 * @version 1.0.0
 * @since 1.0.0
 * @author Keith Rocheck <keith.rocheck@gmail.com>
 */
class instance_icons {

	/**
	 * Create an instance of a Shure icons module.
	 *
	 * @param {instance} instance - the parent instance
	 * @since 1.0.0
	 */
	constructor(instance) {
		this.instance = instance;
		this.Image    = instance.Image;
		this.rgb      = instance.rgb;

		this.savedIcons = {};

		this.AD_ANT = {
			BB: { path: 'icons/ad-ant-BB.png', buffer: null },
			BR: { path: 'icons/ad-ant-BR.png', buffer: null },
			BX: { path: 'icons/ad-ant-BX.png', buffer: null },
			RB: { path: 'icons/ad-ant-RB.png', buffer: null },
			RR: { path: 'icons/ad-ant-RR.png', buffer: null },
			RX: { path: 'icons/ad-ant-RX.png', buffer: null },
			XB: { path: 'icons/ad-ant-XB.png', buffer: null },
			XR: { path: 'icons/ad-ant-XR.png', buffer: null },
			XX: { path: 'icons/ad-ant-XX.png', buffer: null }
		};
		this.AD_AUDIO = {
			0:   { path: 'icons/ad-audio-0.png', buffer: null },
			1:   { path: 'icons/ad-audio-1.png', buffer: null },
			3:   { path: 'icons/ad-audio-3.png', buffer: null },
			7:   { path: 'icons/ad-audio-7.png', buffer: null },
			15:  { path: 'icons/ad-audio-15.png', buffer: null },
			31:  { path: 'icons/ad-audio-31.png', buffer: null },
			63:  { path: 'icons/ad-audio-63.png', buffer: null },
			127: { path: 'icons/ad-audio-127.png', buffer: null },
			128: { path: 'icons/ad-audio-128.png', buffer: null },
			129: { path: 'icons/ad-audio-129.png', buffer: null },
			131: { path: 'icons/ad-audio-131.png', buffer: null },
			135: { path: 'icons/ad-audio-135.png', buffer: null },
			143: { path: 'icons/ad-audio-143.png', buffer: null },
			159: { path: 'icons/ad-audio-159.png', buffer: null },
			191: { path: 'icons/ad-audio-191.png', buffer: null },
			255: { path: 'icons/ad-audio-255.png', buffer: null }
		};
		this.AD_RF = {
			0:  { path: 'icons/ad-rf-0.png', buffer: null },
			1:  { path: 'icons/ad-rf-1.png', buffer: null },
			3:  { path: 'icons/ad-rf-3.png', buffer: null },
			7:  { path: 'icons/ad-rf-7.png', buffer: null },
			15: { path: 'icons/ad-rf-15.png', buffer: null },
			31: { path: 'icons/ad-rf-31.png', buffer: null },
			32: { path: 'icons/ad-rf-32.png', buffer: null },
			33: { path: 'icons/ad-rf-33.png', buffer: null },
			35: { path: 'icons/ad-rf-35.png', buffer: null },
			39: { path: 'icons/ad-rf-39.png', buffer: null },
			47: { path: 'icons/ad-rf-47.png', buffer: null },
			63: { path: 'icons/ad-rf-63.png', buffer: null }
		};
		this.BATTERY = {
			0:   { path: 'icons/batt-0.png', buffer: null },
			1:   { path: 'icons/batt-1.png', buffer: null },
			2:   { path: 'icons/batt-2.png', buffer: null },
			3:   { path: 'icons/batt-3.png', buffer: null },
			4:   { path: 'icons/batt-4.png', buffer: null },
			5:   { path: 'icons/batt-5.png', buffer: null },
			255: { path: 'icons/batt-255.png', buffer: null }
		};
		this.BATTERY_RED = {
			0:   { path: 'icons/batt-0-R.png', buffer: null },
			1:   { path: 'icons/batt-1-R.png', buffer: null },
			2:   { path: 'icons/batt-2-R.png', buffer: null },
			3:   { path: 'icons/batt-3-R.png', buffer: null },
			4:   { path: 'icons/batt-4-R.png', buffer: null },
			5:   { path: 'icons/batt-5-R.png', buffer: null }
		};
		this.ENCRYPTION = {
			ON:    { path: 'icons/encryption-on.png', buffer: null },
			OFF:   { path: 'icons/encryption-off.png', buffer: null },
			ERROR: { path: 'icons/encryption-error.png', buffer: null }
		};
		this.LOCK = {
			ALL:   { path: 'icons/lock-all.png', buffer: null },
			MENU:  { path: 'icons/lock-menu.png', buffer: null },
			POWER: { path: 'icons/lock-power.png', buffer: null }
		};
		this.ULX_ANT = {
			AX: { path: 'icons/ulx-ant-AX.png', buffer: null },
			XB: { path: 'icons/ulx-ant-XB.png', buffer: null },
			XX: { path: 'icons/ulx-ant-XX.png', buffer: null }
		};
		this.ULX_AUDIO = {
			0: { path: 'icons/ulx-audio-0.png', buffer: null },
			1: { path: 'icons/ulx-audio-1.png', buffer: null },
			2: { path: 'icons/ulx-audio-2.png', buffer: null },
			3: { path: 'icons/ulx-audio-3.png', buffer: null },
			4: { path: 'icons/ulx-audio-4.png', buffer: null },
			5: { path: 'icons/ulx-audio-5.png', buffer: null },
			6: { path: 'icons/ulx-audio-6.png', buffer: null }
		};
		this.ULX_RF = {
			0: { path: 'icons/ulx-rf-0.png', buffer: null },
			1: { path: 'icons/ulx-rf-1.png', buffer: null },
			2: { path: 'icons/ulx-rf-2.png', buffer: null },
			3: { path: 'icons/ulx-rf-3.png', buffer: null },
			4: { path: 'icons/ulx-rf-4.png', buffer: null },
			5: { path: 'icons/ulx-rf-5.png', buffer: null }
		};
	}

	/**
	 * Returns the desired channel state object.
	 *
	 * @param {Object} img - the image object to draw on
	 * @param {Object} icon - the icon object
	 * @param {number} xStart - x start
	 * @param {number} yStart - y start
	 * @param {number} width - width
	 * @param {number} height - height
	 * @param {String} halign - horizontal alignment
	 * @param {String} valign - vertical alignment
	 * @access protected
	 * @since 1.0.0
	 */
	drawFromPNGdata(img, icon, xStart, yStart, width, height, halign, valign) {

		if (icon !== undefined && icon.buffer === null) {
			try {
				icon.buffer = fs.readFileSync(path + '/lib/module/shure-wireless/' + icon.path);
			} catch (e) {
				this.instance.log('debug', "Error opening image file: " + icon.path + '(' + e + ')');
				return;
			}
		}
		else {
			this.instance.debug('icon: ' + icon);
		}

		try {
			img.drawFromPNGdata(icon.buffer, xStart, yStart, width, height, halign, valign);
		} catch (e) {
			this.instance.log('debug', "Error drawing image file: " + icon.path + '(' + e + ')');
			return;
		}
	}

	/**
	 * Returns the desired channel state object.
	 *
	 * @param {String} bg - the background color
	 * @param {String} ant - the antenna status
	 * @param {number} audio - the audio status
	 * @param {number} rfA - the RF A status
	 * @param {number} rfB - the RF B status
	 * @param {number|String} battery - the battery status
	 * @param {String} lock - the lock status
	 * @returns {String} base64 encoded PNG
	 * @access public
	 * @since 1.0.0
	 */
	getADStatus(bg = 0, ant = 'XX', audio = 0, rfA = 0, rfB = 0, battery = 255, lock = 'OFF', encryption = 'OFF') {
		var id = bg + '-' + ant + '-' + audio + '-' + rfA + '-' + rfB + '-' + battery + '-' + lock + '-' + encryption;
		var out;

		if ( this.savedIcons[id] === undefined ) {
			var img = new this.Image();
			//img.backgroundColor(bg);

			this.drawFromPNGdata(img, this.AD_ANT[ant],            51, 13, 11, 10, 'left', 'top');
			this.drawFromPNGdata(img, this.AD_AUDIO[audio],        64, 13,  4, 42, 'left', 'top');
			this.drawFromPNGdata(img, this.AD_RF[rfA],             51, 24,  4, 31, 'left', 'top');
			this.drawFromPNGdata(img, this.AD_RF[rfB],             57, 24,  4, 31, 'left', 'top');
			this.drawFromPNGdata(img, this.BATTERY[battery],        3, 46, 25,  9, 'left', 'top');
			this.drawFromPNGdata(img, this.ENCRYPTION[encryption], 52,  2, 16,  6, 'left', 'top');

			if ( lock == 'all' || lock == 'power' || lock == 'menu' ) {
				this.drawFromPNGdata(img, this.LOCK[lock], 31, 46, 18, 8, 'left', 'top');
			}

			out = img.toBase64();
			this.savedIcons[id] = out;
		}
		else {
			out = this.savedIcons[id];
		}

		return out;
	}

	/**
	 * Returns the desired channel state object.
	 *
	 * @param {String} bg - the background color
	 * @param {String} ant - the antenna status
	 * @param {number} audio - the audio status
	 * @param {number} rf - the RF status
	 * @param {number|String} battery - the battery status
	 * @param {String} lock - the lock status
	 * @returns {String} base64 encoded PNG
	 * @access public
	 * @since 1.0.0
	 */
	getULXStatus(bg, ant = 'XX', audio = 0, rf = 0, battery = 255, lock = 'OFF', encryption = 'OFF') {
		var id = bg + '-' + ant + '-' + audio + '-' + rf + '-' + battery + '-' + lock + '-' + encryption;
		var out;

		if ( this.savedIcons[id] === undefined ) {
			var img = new this.Image();
			//img.backgroundColor(bg);

			img.drawFromPNGdata(this.ULX_ANT[ant],           47, 12, 13,  5, 'left', 'top');
			img.drawFromPNGdata(this.ULX_AUDIO[audio],       63, 12,  5, 43, 'left', 'top');
			img.drawFromPNGdata(this.ULX_RF[rf],             50, 19,  6, 37, 'left', 'top');
			img.drawFromPNGdata(this.BATTERY[battery],        3, 46, 25,  9, 'left', 'top');
			img.drawFromPNGdata(this.ENCRYPTION[encryption], 52,  2, 16,  6, 'left', 'top');

			if ( lock == 'all' || lock == 'power' || lock == 'menu' ) {
				img.drawFromPNGdata(this.LOCK[lock], 31, 46, 18, 8, 'left', 'top');
			}

			out = img.toBase64();
		}
		else {
			out = this.savedIcons[id];
		}

		return out;
	}
}

exports = module.exports = instance_icons;