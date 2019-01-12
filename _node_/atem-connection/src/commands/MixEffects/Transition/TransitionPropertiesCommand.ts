import AbstractCommand from '../../AbstractCommand'
import { AtemState } from '../../../state'
import { TransitionProperties } from '../../../state/video'
import { Util, Enums } from '../../..'

export class TransitionPropertiesCommand extends AbstractCommand {
	static MaskFlags = {
		style: 1 << 0,
		selection: 1 << 1
	}

	rawName = 'TrSS'
	mixEffect: number

	properties: TransitionProperties

	updateProps (newProps: Partial<TransitionProperties>) {
		this._updateProps(newProps)
	}

	deserialize (rawCommand: Buffer) {
		this.mixEffect = Util.parseNumberBetween(rawCommand[0], 0, 3)
		this.properties = {
			style: Util.parseEnum<Enums.TransitionStyle>(rawCommand[1], Enums.TransitionStyle),// rawCommand[1],
			selection: rawCommand[2],
			nextStyle: Util.parseEnum<Enums.TransitionStyle>(rawCommand[3], Enums.TransitionStyle),
			nextSelection: rawCommand[4]
		}
	}

	serialize () {
		const rawCommand = 'CTTp'
		const buffer = new Buffer(8)
		buffer.fill(0)
		Buffer.from(rawCommand).copy(buffer, 0)

		buffer.writeUInt8(this.flag, 4)

		buffer.writeUInt8(this.mixEffect, 5)
		buffer.writeUInt8(this.properties.style, 6)
		buffer.writeUInt8(this.properties.selection, 7)

		return buffer
	}

	applyToState (state: AtemState) {
		const mixEffect = state.video.getMe(this.mixEffect)
		mixEffect.transitionProperties = {
			...this.properties
		}
	}
}
