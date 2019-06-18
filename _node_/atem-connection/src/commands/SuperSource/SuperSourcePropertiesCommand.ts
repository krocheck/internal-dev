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
			artFillSource: rawCommand.readUInt16BE(1),
			artCutSource: rawCommand.readUInt16BE(3),
			artOption: Util.parseEnum<Enums.SuperSourceArtOption>(rawCommand.readUInt8(5), Enums.SuperSourceArtOption),
			artPreMultiplied: rawCommand[6] === 1,
			artClip: Util.parseNumberBetween(rawCommand.readUInt16BE(7), 0, 1000),
			artGain: Util.parseNumberBetween(rawCommand.readUInt16BE(9), 0, 1000),
			artInvertKey: rawCommand[11] === 1,

			borderEnabled: rawCommand[12] === 1,
			borderBevel: Util.parseEnum<Enums.BorderBevel>(rawCommand.readUInt8(13), Enums.BorderBevel),
			borderOuterWidth: Util.parseNumberBetween(rawCommand.readUInt16BE(15), 0, 1600),
			borderInnerWidth: Util.parseNumberBetween(rawCommand.readUInt16BE(17), 0, 1600),
			borderOuterSoftness: Util.parseNumberBetween(rawCommand.readUInt8(19), 0, 100),
			borderInnerSoftness: Util.parseNumberBetween(rawCommand.readUInt8(20), 0, 100),
			borderBevelSoftness: Util.parseNumberBetween(rawCommand.readUInt8(21), 0, 100),
			borderBevelPosition: Util.parseNumberBetween(rawCommand.readUInt8(22), 0, 100),
			borderHue: Util.parseNumberBetween(rawCommand.readUInt16BE(23), 0, 3599),
			borderSaturation: Util.parseNumberBetween(rawCommand.readUInt16BE(25), 0, 1000),
			borderLuma: Util.parseNumberBetween(rawCommand.readUInt16BE(27), 0, 1000),
			borderLightSourceDirection: Util.parseNumberBetween(rawCommand.readUInt16BE(29), 0, 3599),
			borderLightSourceAltitude: Util.parseNumberBetween(rawCommand.readUInt8(31), 0, 100)
		}
	}

	serialize () {
		const buffer = Buffer.alloc(36)

		buffer.writeUInt32BE(this.flag, 0)
		buffer.writeUInt8(this.ssrcId, 4)
		buffer.writeUInt16BE(this.properties.artFillSource, 5)
		buffer.writeUInt16BE(this.properties.artCutSource, 7)
		buffer.writeUInt8(this.properties.artOption, 9)
		buffer.writeUInt8(this.properties.artPreMultiplied ? 1 : 0, 10)
		buffer.writeUInt16BE(this.properties.artClip, 11)
		buffer.writeUInt16BE(this.properties.artGain, 13)
		buffer.writeUInt8(this.properties.artInvertKey ? 1 : 0, 15)

		buffer.writeUInt8(this.properties.borderEnabled ? 1 : 0, 16)
		buffer.writeUInt8(this.properties.borderBevel, 17)
		buffer.writeUInt16BE(this.properties.borderOuterWidth, 19)
		buffer.writeUInt16BE(this.properties.borderInnerWidth, 21)
		buffer.writeUInt8(this.properties.borderOuterSoftness, 23)
		buffer.writeUInt8(this.properties.borderInnerSoftness, 24)
		buffer.writeUInt8(this.properties.borderBevelSoftness, 25)
		buffer.writeUInt8(this.properties.borderBevelPosition, 26)
		buffer.writeUInt16BE(this.properties.borderHue, 27)
		buffer.writeUInt16BE(this.properties.borderSaturation, 29)
		buffer.writeUInt16BE(this.properties.borderLuma, 31)
		buffer.writeUInt16BE(this.properties.borderLightSourceDirection, 33)
		buffer.writeUInt8(this.properties.borderLightSourceAltitude, 35)

		return Buffer.concat([Buffer.from('CSSc', 'ascii'), buffer])
	}

	applyToState (state: AtemState) {
		state.video.getSuperSource(this.ssrcId).properties = this.properties
	}
}
