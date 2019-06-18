import AbstractCommand from '../AbstractCommand'
import { AtemState } from '../../state'
import { SuperSourceProperties } from '../../state/video'
import { Util, Enums } from '../..'

export class SuperSourcePropertiesCommand extends AbstractCommand {
	static MaskFlags = {
		artFillSource: 1 << 0,
		artCutSource: 1 << 1,
		artOption: 1 << 2,
		artPreMultiplied: 1 << 3,
		artClip: 1 << 4,
		artGain: 1 << 5,
		artInvertKey: 1 << 6,

		borderEnabled: 1 << 7,
		borderBevel: 1 << 8,
		borderOuterWidth: 1 << 9,
		borderInnerWidth: 1 << 10,
		borderOuterSoftness: 1 << 11,
		borderInnerSoftness: 1 << 12,
		borderBevelSoftness: 1 << 13,
		borderBevelPosition: 1 << 14,
		borderHue: 1 << 15,
		borderSaturation: 1 << 16,
		borderLuma: 1 << 17,
		borderLightSourceDirection: 1 << 18,
		borderLightSourceAltitude: 1 << 19
	}

	rawName = 'SSrc'
	ssrcId: number
	properties: SuperSourceProperties

	updateProps (newProps: Partial<SuperSourceProperties>) {
		this._updateProps(newProps)
	}

	deserialize (rawCommand: Buffer) {
		this.ssrcId = rawCommand[0]
		this.properties = {
			artFillSource: rawCommand.readUInt16BE(2),
			artCutSource: rawCommand.readUInt16BE(4),
			artOption: Util.parseEnum<Enums.SuperSourceArtOption>(rawCommand.readUInt8(6), Enums.SuperSourceArtOption),
			artPreMultiplied: rawCommand[7] === 1,
			artClip: Util.parseNumberBetween(rawCommand.readUInt16BE(8), 0, 1000),
			artGain: Util.parseNumberBetween(rawCommand.readUInt16BE(10), 0, 1000),
			artInvertKey: rawCommand[12] === 1,

			borderEnabled: rawCommand[13] === 1,
			borderBevel: Util.parseEnum<Enums.BorderBevel>(rawCommand.readUInt8(14), Enums.BorderBevel),
			borderOuterWidth: Util.parseNumberBetween(rawCommand.readUInt16BE(16), 0, 1600),
			borderInnerWidth: Util.parseNumberBetween(rawCommand.readUInt16BE(18), 0, 1600),
			borderOuterSoftness: Util.parseNumberBetween(rawCommand.readUInt8(20), 0, 100),
			borderInnerSoftness: Util.parseNumberBetween(rawCommand.readUInt8(21), 0, 100),
			borderBevelSoftness: Util.parseNumberBetween(rawCommand.readUInt8(22), 0, 100),
			borderBevelPosition: Util.parseNumberBetween(rawCommand.readUInt8(23), 0, 100),
			borderHue: Util.parseNumberBetween(rawCommand.readUInt16BE(24), 0, 3599),
			borderSaturation: Util.parseNumberBetween(rawCommand.readUInt16BE(26), 0, 1000),
			borderLuma: Util.parseNumberBetween(rawCommand.readUInt16BE(28), 0, 1000),
			borderLightSourceDirection: Util.parseNumberBetween(rawCommand.readUInt16BE(30), 0, 3599),
			borderLightSourceAltitude: Util.parseNumberBetween(rawCommand.readUInt8(32), 0, 100)
		}
	}

	serialize () {
		const buffer = Buffer.alloc(36)

		buffer.writeUInt32BE(this.flag, 0)
		buffer.writeUInt8(this.ssrcId, 4)
		buffer.writeUInt16BE(this.properties.artFillSource, 6)
		buffer.writeUInt16BE(this.properties.artCutSource, 8)
		buffer.writeUInt8(this.properties.artOption, 10)
		buffer.writeUInt8(this.properties.artPreMultiplied ? 1 : 0, 11)
		buffer.writeUInt16BE(this.properties.artClip, 12)
		buffer.writeUInt16BE(this.properties.artGain, 14)
		buffer.writeUInt8(this.properties.artInvertKey ? 1 : 0, 16)

		buffer.writeUInt8(this.properties.borderEnabled ? 1 : 0, 17)
		buffer.writeUInt8(this.properties.borderBevel, 18)
		buffer.writeUInt16BE(this.properties.borderOuterWidth, 20)
		buffer.writeUInt16BE(this.properties.borderInnerWidth, 22)
		buffer.writeUInt8(this.properties.borderOuterSoftness, 24)
		buffer.writeUInt8(this.properties.borderInnerSoftness, 25)
		buffer.writeUInt8(this.properties.borderBevelSoftness, 26)
		buffer.writeUInt8(this.properties.borderBevelPosition, 27)
		buffer.writeUInt16BE(this.properties.borderHue, 28)
		buffer.writeUInt16BE(this.properties.borderSaturation, 30)
		buffer.writeUInt16BE(this.properties.borderLuma, 32)
		buffer.writeUInt16BE(this.properties.borderLightSourceDirection, 34)
		buffer.writeUInt8(this.properties.borderLightSourceAltitude, 36)

		return Buffer.concat([Buffer.from('CSSc', 'ascii'), buffer])
	}

	applyToState (state: AtemState) {
		state.video.getSuperSource(this.ssrcId).properties = this.properties
	}
}
