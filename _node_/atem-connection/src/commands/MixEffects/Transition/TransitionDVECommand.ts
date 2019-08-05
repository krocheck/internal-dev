import AbstractCommand from '../../AbstractCommand'
import { AtemState } from '../../../state'
import { DVETransitionSettings } from '../../../state/video'
import { Util, Enums } from '../../..'

export class TransitionDVECommand extends AbstractCommand {
	static MaskFlags = {
		rate: 1 << 0,
		logoRate: 1 << 1,
		style: 1 << 2,
		fillSource: 1 << 3,
		keySource: 1 << 4,
		enableKey: 1 << 5,
		preMultiplied: 1 << 6,
		clip: 1 << 7,
		gain: 1 << 8,
		invertKey: 1 << 9,
		reverse: 1 << 10,
		flipFlop: 1 << 11
	}

	rawName = 'CTDv'
	mixEffect: number

	properties: DVETransitionSettings

	updateProps (newProps: Partial<DVETransitionSettings>) {
		this._updateProps(newProps)
	}

	serialize () {
		const buffer = Buffer.alloc(20, 0)
		buffer.writeUInt16BE(this.flag, 0)

		buffer.writeUInt8(this.mixEffect, 2)
		buffer.writeUInt8(this.properties.rate, 3)
		buffer.writeUInt8(this.properties.logoRate, 4)
		buffer.writeUInt8(this.properties.style, 5)

		buffer.writeUInt16BE(this.properties.fillSource, 6)
		buffer.writeUInt16BE(this.properties.keySource, 8)

		buffer.writeUInt8(this.properties.enableKey ? 1 : 0, 10)
		buffer.writeUInt8(this.properties.preMultiplied ? 1 : 0, 11)
		buffer.writeUInt16BE(this.properties.clip, 12)
		buffer.writeUInt16BE(this.properties.gain, 14)
		buffer.writeUInt8(this.properties.invertKey ? 1 : 0, 16)
		buffer.writeUInt8(this.properties.reverse ? 1 : 0, 17)
		buffer.writeUInt8(this.properties.flipFlop ? 1 : 0, 18)

		return buffer
	}
}

export class TransitionDVEUpdateCommand extends AbstractCommand {
	rawName = 'TDvP'
	mixEffect: number

	properties: DVETransitionSettings

	deserialize (rawCommand: Buffer) {
		this.mixEffect = Util.parseNumberBetween(rawCommand[0], 0, 3)
		this.properties = {
			rate: Util.parseNumberBetween(rawCommand[1], 1, 250),
			logoRate: Util.parseNumberBetween(rawCommand[2], 1, 250),
			style: Util.parseEnum<Enums.DVEEffect>(rawCommand[3], Enums.DVEEffect),
			fillSource: rawCommand[4] << 8 | (rawCommand[5] & 0xff),
			keySource: rawCommand[6] << 8 | (rawCommand[7] & 0xff),

			enableKey: rawCommand[8] === 1,
			preMultiplied: rawCommand[9] === 1,
			clip: Util.parseNumberBetween(rawCommand.readUInt16BE(10), 0, 1000),
			gain: Util.parseNumberBetween(rawCommand.readUInt16BE(12), 0, 1000),
			invertKey: rawCommand[14] === 1,
			reverse: rawCommand[15] === 1,
			flipFlop: rawCommand[16] === 1
		}
	}

	applyToState (state: AtemState) {
		const mixEffect = state.video.getMe(this.mixEffect)
		mixEffect.transitionSettings.DVE = {
			...this.properties
		}
		return `video.ME.${this.mixEffect}.transitionSettings.DVE`
	}
}
