import AbstractCommand from '../AbstractCommand'
import { AtemState } from '../../state'
import { SuperSourceBorder } from '../../state/video'
import { Util, Enums } from '../..'

export class SuperSourceBorderCommand extends AbstractCommand {
	static MaskFlags = {
		borderEnabled: 1 << 0,
		borderBevel: 1 << 1,
		borderOuterWidth: 1 << 2,
		borderInnerWidth: 1 << 3,
		borderOuterSoftness: 1 << 4,
		borderInnerSoftness: 1 << 5,
		borderBevelSoftness: 1 << 6,
		borderBevelPosition: 1 << 7,
		borderHue: 1 << 8,
		borderSaturation: 1 << 9,
		borderLuma: 1 << 10,
		borderLightSourceDirection: 1 << 11,
		borderLightSourceAltitude: 1 << 12
	}

	rawName = 'SSBd'
	ssrcId: number
	properties: SuperSourceBorder

	updateProps (newProps: Partial<SuperSourceBorder>) {
		this._updateProps(newProps)
	}

	deserialize (rawCommand: Buffer) {
		this.ssrcId = rawCommand[0]
		this.properties = {
			borderEnabled: rawCommand[13] === 1,
			borderBevel: Util.parseEnum<Enums.BorderBevel>(rawCommand.readUInt8(2), Enums.BorderBevel),
			borderOuterWidth: Util.parseNumberBetween(rawCommand.readUInt16BE(4), 0, 1600),
			borderInnerWidth: Util.parseNumberBetween(rawCommand.readUInt16BE(6), 0, 1600),
			borderOuterSoftness: Util.parseNumberBetween(rawCommand.readUInt8(8), 0, 100),
			borderInnerSoftness: Util.parseNumberBetween(rawCommand.readUInt8(9), 0, 100),
			borderBevelSoftness: Util.parseNumberBetween(rawCommand.readUInt8(10), 0, 100),
			borderBevelPosition: Util.parseNumberBetween(rawCommand.readUInt8(11), 0, 100),
			borderHue: Util.parseNumberBetween(rawCommand.readUInt16BE(12), 0, 3599),
			borderSaturation: Util.parseNumberBetween(rawCommand.readUInt16BE(14), 0, 1000),
			borderLuma: Util.parseNumberBetween(rawCommand.readUInt16BE(16), 0, 1000),
			borderLightSourceDirection: Util.parseNumberBetween(rawCommand.readUInt16BE(18), 0, 3599),
			borderLightSourceAltitude: Util.parseNumberBetween(rawCommand.readUInt8(20), 0, 100)
		}
	}

	serialize () {
		const buffer = Buffer.alloc(24)

		buffer.writeUInt32BE(this.flag, 0)
		buffer.writeUInt8(this.ssrcId, 2)
		buffer.writeUInt8(this.properties.borderEnabled ? 1 : 0, 3)
		buffer.writeUInt8(this.properties.borderBevel, 4)
		buffer.writeUInt16BE(this.properties.borderOuterWidth, 6)
		buffer.writeUInt16BE(this.properties.borderInnerWidth, 8)
		buffer.writeUInt8(this.properties.borderOuterSoftness, 10)
		buffer.writeUInt8(this.properties.borderInnerSoftness, 11)
		buffer.writeUInt8(this.properties.borderBevelSoftness, 12)
		buffer.writeUInt8(this.properties.borderBevelPosition, 13)
		buffer.writeUInt16BE(this.properties.borderHue, 14)
		buffer.writeUInt16BE(this.properties.borderSaturation, 16)
		buffer.writeUInt16BE(this.properties.borderLuma, 18)
		buffer.writeUInt16BE(this.properties.borderLightSourceDirection, 20)
		buffer.writeUInt8(this.properties.borderLightSourceAltitude, 22)

		return Buffer.concat([Buffer.from('CSBd', 'ascii'), buffer])
	}

	applyToState (state: AtemState) {
		state.video.getSuperSource(this.ssrcId).border = this.properties
	}
}
